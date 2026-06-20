import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading || (isAuthenticated && !user)) {
        return (
            <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <iconify-icon icon="eos-icons:loading" width="48" style={{ color: 'var(--primary-orange)' }}></iconify-icon>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but save the current location to redirect back
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(user?.role)) {
            // If logged in but role doesn't match, send them to their correct "home"
            const staffRoles = ["ADMIN", "EDITOR", "MARKETING", "VIEWER", "SUPPORT_AGENT", "COUNSELOR"];
            if (staffRoles.includes(user?.role)) {
                return <Navigate to="/admin" replace />;
            }
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
