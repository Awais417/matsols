import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("matsols_token"));
    const [loading, setLoading] = useState(true);
    const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
    const [sessionRemainingMs, setSessionRemainingMs] = useState(null);

    useEffect(() => {
        // Initialize user from localStorage first
        const storedUser = localStorage.getItem("matsols_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }

        if (token) {
            try {
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split("")
                        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                        .join("")
                );
                const decoded = JSON.parse(jsonPayload);
                const expiresAt = decoded.exp ? decoded.exp * 1000 : null;
                setSessionExpiresAt(expiresAt);

                // Merge decoded token info with existing user state
                setUser(prev => {
                    const merged = {
                        ...(prev || {}),
                        ...decoded,
                        role: decoded.role || prev?.role || 'STUDENT'
                    };
                    // Ensure localStorage stays in sync with merged token data
                    localStorage.setItem("matsols_user", JSON.stringify(merged));
                    return merged;
                });
            } catch (e) {
                console.error("Invalid token", e);
                logout(true, "invalid");
            }
        } else {
            setSessionExpiresAt(null);
        }
        setLoading(false);
    }, [token]);

    useEffect(() => {
        if (!sessionExpiresAt) return undefined;
        const remaining = sessionExpiresAt - Date.now();
        if (remaining <= 0) {
            logout(true, "timeout");
            return undefined;
        }
        const timeoutId = setTimeout(() => logout(true, "timeout"), remaining);
        return () => clearTimeout(timeoutId);
    }, [sessionExpiresAt]);

    useEffect(() => {
        if (!sessionExpiresAt) {
            setSessionRemainingMs(null);
            return undefined;
        }
        const tick = () => {
            const remaining = Math.max(0, sessionExpiresAt - Date.now());
            setSessionRemainingMs(remaining);
        };
        tick();
        const intervalId = setInterval(tick, 30000);
        return () => clearInterval(intervalId);
    }, [sessionExpiresAt]);

    const login = async (email, password) => {
        const data = await apiService.login(email, password);

        if (data.mfaSetupRequired) {
            return { success: true, mfaSetupRequired: true, mfaToken: data.mfaToken };
        }

        if (data.mfaRequired) {
            return { success: true, mfaRequired: true, mfaToken: data.mfaToken };
        }

        if (data.token) {
            localStorage.setItem("matsols_token", data.token);
            localStorage.setItem("matsols_user", JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            return { success: true, role: data.user.role };
        }

        return {
            success: false,
            error: data.error || "Login failed"
        };
    };

    const register = async (userData) => {
        const data = await apiService.register(userData);
        if (data.userId) {
            return { success: true };
        }
        return { success: false, error: data.error || "Registration failed" };
    };

    const updateUser = (userData) => {
        setUser(prev => {
            const merged = { ...(prev || {}), ...userData };
            localStorage.setItem("matsols_user", JSON.stringify(merged));
            return merged;
        });
    };

    const logout = (shouldRedirect = true, reason = null) => {
        localStorage.removeItem("matsols_token");
        localStorage.removeItem("matsols_user");
        setToken(null);
        setUser(null);
        setSessionExpiresAt(null);
        setSessionRemainingMs(null);
        // Force a full reload to clear any sensitive state and prevent back-button access
        if (shouldRedirect && window.location.pathname !== "/login") {
            const redirectUrl = reason ? `/login?reason=${reason}` : "/login";
            window.location.href = redirectUrl;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, updateUser, loading, isAuthenticated: !!token, sessionExpiresAt, sessionRemainingMs }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
