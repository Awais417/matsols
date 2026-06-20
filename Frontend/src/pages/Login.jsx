import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePublicSettings } from "../context/PublicSettingsContext";
import { apiService } from "../services/api";
import "./Auth.css";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { brandName, logoUrl } = usePublicSettings();
    const { login, logout } = useAuth();

    // Parse query parameters
    const queryParams = new URLSearchParams(location.search);
    const reason = queryParams.get('reason');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState("login");
    const [mfaToken, setMfaToken] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [passwordResetToken, setPasswordResetToken] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");
    const [resetForm, setResetForm] = useState({
        email: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    // Proactive security: Clear all state on arrival to login page
    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Force logout and clear all local storage to prevent "credential retention"
        if (typeof logout === 'function') {
            logout(false); 
        }

        // Explicitly zero-out form data in case of browser/React state persistence
        setFormData({ email: "", password: "" });
        setOtp("");
        setError("");
        setResetSuccess("");
    }, []); // Run strictly once on mount

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setError("");
    };

    const handleResetFieldChange = (e) => {
        setResetForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
        setError("");
        setResetSuccess("");
    };


    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                if (result.mfaSetupRequired) {
                    setMfaToken(result.mfaToken);
                    // Initialize enrollment to get secret
                    const init = await apiService.enrollMfaInit(result.mfaToken);
                    if (init.secret) {
                        setEnrollSecret(init.secret);
                        setMfaToken(init.enrollToken || result.mfaToken);
                        setMode("enroll");
                    } else {
                        setError(init.error || "MFA initialization failed.");
                    }
                    setLoading(false);
                    return;
                }

                if (result.mfaRequired) {
                    setMfaToken(result.mfaToken);
                    setMode("mfa");
                    setLoading(false);
                    return;
                }

                // Standard redirect
                const from = location.state?.from?.pathname || "/admin";
                navigate(from);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const [isRecovery, setIsRecovery] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState("");
    const [enrollSecret, setEnrollSecret] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [secretCopied, setSecretCopied] = useState(false);
    const [recoveryCopied, setRecoveryCopied] = useState(false);

    const handleEnrollConfirm = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await apiService.enrollMfaConfirm(mfaToken, otp, enrollSecret);
            if (!response?.token) {
                console.error("[LOGIN_ENROLL_CONFIRM_RESPONSE]", response);
            }
            if (response?.status === 401 || response?.error === "Invalid enrollment session") {
                window.location.href = "/login?reason=timeout";
                return;
            }
            if (response.token) {
                setRecoveryCodes(response.recoveryCodes);
                setMode("enroll_success");
                // Save session but wait for user to click "Finish"
                localStorage.setItem("matsols_token", response.token);
                localStorage.setItem("matsols_user", JSON.stringify(response.user));
            } else {
                setError(response.error || "Verification failed.");
            }
        } catch (err) {
            console.error("[LOGIN_ENROLL_CONFIRM_EXCEPTION]", err);
            setError("Enrollment confirmation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleMfaVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await apiService.verifyLoginMfa(mfaToken, isRecovery ? null : otp, isRecovery ? recoveryCode : null);
            if (response.token) {
                localStorage.setItem("matsols_token", response.token);
                localStorage.setItem("matsols_user", JSON.stringify(response.user));
                window.location.href = location.state?.from?.pathname || "/admin";
            } else {
                setError(response.error || "Invalid code.");
            }
        } catch (err) {
            setError(err.response?.data?.error || "MFA verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordInit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResetSuccess("");

        try {
            const response = await apiService.initForgotPassword(resetForm.email);
            if (response.resetToken) {
                setResetToken(response.resetToken);
                setOtp("");
                setMode("forgot_otp");
                setResetSuccess("Email verified. Enter the authenticator code for this staff account.");
            } else {
                setError(response.error || "Unable to start password reset.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResetSuccess("");

        try {
            const response = await apiService.verifyForgotPasswordOtp(resetToken, otp);
            if (response.passwordResetToken) {
                setPasswordResetToken(response.passwordResetToken);
                setOtp("");
                setMode("forgot_password");
            } else {
                setError(response.error || "Invalid authenticator code.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResetSuccess("");

        if (resetForm.newPassword !== resetForm.confirmPassword) {
            setLoading(false);
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await apiService.resetForgotPassword(passwordResetToken, resetForm.newPassword);
            if (response.success) {
                setMode("login");
                setMfaToken("");
                setResetToken("");
                setPasswordResetToken("");
                setOtp("");
                setFormData((prev) => ({ ...prev, email: resetForm.email, password: "" }));
                setResetForm({
                    email: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setResetSuccess("Password updated. Sign in with the new password.");
            } else {
                setError(response.error || "Unable to update password.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-overlay">
                <div className="auth-blob orange"></div>
                <div className="auth-blob blue"></div>
            </div>

            <div className="auth-card anim-fade-up">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">
                        {logoUrl ? (
                            <img src={logoUrl} alt={brandName} style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                        ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary-orange)"></path>
                                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        )}
                        {brandName}
                    </Link>
                    {mode === "login" && (
                        <>
                            <h1 className="auth-title">Welcome Back</h1>
                            <p className="auth-subtitle">
                                Staff access only. Students can use <Link to="/free-consultation">Free Consultation</Link>.
                            </p>
                        </>
                    )}
                    {mode === "mfa" && (
                        <>
                            <h1 className="auth-title">{isRecovery ? "Master Recovery" : "Two-Factor Auth"}</h1>
                            <p className="auth-subtitle">
                                {isRecovery 
                                    ? "Enter one of your 8-character master recovery codes." 
                                    : "Enter the 6-digit code from your authenticator app."}
                            </p>
                        </>
                    )}
                    {mode === "enroll" && (
                        <>
                            <h1 className="auth-title">Mandatory Security</h1>
                            <p className="auth-subtitle">2FA is required for staff. Set it up now to continue.</p>
                        </>
                    )}
                    {mode === "enroll_success" && (
                        <>
                            <h1 className="auth-title">Setup Complete</h1>
                            <p className="auth-subtitle">Save your recovery codes in a safe place.</p>
                        </>
                    )}
                    {mode === "forgot_email" && (
                        <>
                            <h1 className="auth-title">Reset Password</h1>
                            <p className="auth-subtitle">Enter the admin or staff email tied to the account.</p>
                        </>
                    )}
                    {mode === "forgot_otp" && (
                        <>
                            <h1 className="auth-title">Verify Authenticator</h1>
                            <p className="auth-subtitle">Enter the 6-digit code from the authenticator app for this account.</p>
                        </>
                    )}
                    {mode === "forgot_password" && (
                        <>
                            <h1 className="auth-title">Set New Password</h1>
                            <p className="auth-subtitle">Use a strong password that meets the security requirements.</p>
                        </>
                    )}
                </div>

                {reason === 'timeout' && (
                    <div className="auth-timeout-msg">
                        <iconify-icon icon="ri:time-line"></iconify-icon>
                        Session timed out. Please login again for security.
                    </div>
                )}

                {error && (
                    <div className="auth-error-msg anim-shake">
                        <iconify-icon icon="ri:error-warning-fill"></iconify-icon>
                        {error}
                    </div>
                )}

                {resetSuccess && (
                    <div className="auth-success-msg">
                        <iconify-icon icon="ri:checkbox-circle-fill"></iconify-icon>
                        {resetSuccess}
                    </div>
                )}

                {mode === "login" && (
                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <div className="form-input-wrap">
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div className="form-input-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <iconify-icon icon={showPassword ? "ri:eye-off-line" : "ri:eye-line"}></iconify-icon>
                                </button>
                            </div>
                        </div>



                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <iconify-icon icon="eos-icons:loading" width="24"></iconify-icon>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In <iconify-icon icon="ri:arrow-right-line"></iconify-icon>
                                </>
                            )}
                        </button>

                        <div className="security-notice-wrapper">
                            <div className="security-notice">
                                <iconify-icon icon="ri:shield-check-line"></iconify-icon> Secure Login
                            </div>
                        </div>
                        
                        <p className="login-footer-note">
                            Lost access? Contact master admin for recovery code.
                        </p>

                        <button
                            type="button"
                            className="auth-text-link"
                            onClick={() => {
                                setMode("forgot_email");
                                setError("");
                                setResetSuccess("");
                                setOtp("");
                                setResetToken("");
                                setPasswordResetToken("");
                                setResetForm({
                                    email: formData.email || "",
                                    newPassword: "",
                                    confirmPassword: ""
                                });
                            }}
                        >
                            Forgot password?
                        </button>
                    </form>
                )}

                {mode === "mfa" && (
                    <form className="auth-form" onSubmit={handleMfaVerify}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="otp">
                                {isRecovery ? "Master Recovery Code" : "Authentication Code"}
                            </label>
                            <div className="form-input-wrap">
                                <input
                                    type="text"
                                    id="otp"
                                    className="form-input"
                                    placeholder={isRecovery ? "8 characters" : "000000"}
                                    value={isRecovery ? recoveryCode : otp}
                                    onChange={(e) => {
                                        if (isRecovery) {
                                            setRecoveryCode(e.target.value.toLowerCase().trim().slice(0, 8));
                                        } else {
                                            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        }
                                    }}
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <iconify-icon icon="eos-icons:loading" width="24"></iconify-icon>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    {isRecovery ? "Recover Access" : "Verify Code"} <iconify-icon icon="ri:shield-flash-line"></iconify-icon>
                                </>
                            )}
                        </button>

                        <div className="mfa-footer-links">
                            <button
                                type="button"
                                className="toggle-recovery-link"
                                onClick={() => {
                                    setIsRecovery(!isRecovery);
                                    setError("");
                                }}
                            >
                                {isRecovery ? "Use Authenticator App" : "Use Master Recovery Code"}
                            </button>

                            <button
                                type="button"
                                className="back-to-login"
                                onClick={() => {
                                    setMode("login");
                                    setError("");
                                    setIsRecovery(false);
                                }}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {mode === "enroll" && (
                    <form className="auth-form" onSubmit={handleEnrollConfirm}>
                        <div className="enroll-instruction">
                            <p>1. Open your Authenticator app (Google, Microsoft, or Authy).</p>
                            <p>2. Add a new account and enter this secret key manually:</p>
                            <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                                Use TOTP with 6 digits and 30-second period.
                            </p>
                        </div>
                        
                        <div className="enroll-secret-box">
                            <code title={enrollSecret}>{enrollSecret}</code>
                            <button 
                                type="button" 
                                className="btn-copy-mini"
                                onClick={() => {
                                    navigator.clipboard.writeText(enrollSecret);
                                    setSecretCopied(true);
                                    setTimeout(() => setSecretCopied(false), 2000);
                                }}
                                aria-label={secretCopied ? "Copied" : "Copy secret key"}
                            >
                                <iconify-icon icon={secretCopied ? "ri:check-line" : "ri:file-copy-line"}></iconify-icon>
                            </button>
                        </div>

                        <div className="form-group" style={{ marginTop: '20px' }}>
                            <label className="form-label" htmlFor="enroll-otp">Verification Code</label>
                            <div className="form-input-wrap">
                                <input
                                    type="text"
                                    id="enroll-otp"
                                    className="form-input"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    autoFocus
                                />
                            </div>
                            <small style={{ color: "#64748b", fontSize: "12px", display: "block", marginTop: "8px" }}>
                                If the code fails, delete old MATSOLS entry and add this key again with TOTP settings.
                            </small>
                        </div>

                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading ? "Verifying..." : "Verify & Enable 2FA"}
                        </button>
                    </form>
                )}

                {mode === "forgot_email" && (
                    <form className="auth-form" onSubmit={handleForgotPasswordInit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Staff Email</label>
                            <div className="form-input-wrap">
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder="staff@matsols.com"
                                    value={resetForm.email}
                                    onChange={handleResetFieldChange}
                                    autoComplete="off"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading ? "Checking..." : "Verify Email"}
                        </button>

                        <button
                            type="button"
                            className="auth-text-link auth-text-link-muted"
                            onClick={() => {
                                setMode("login");
                                setError("");
                                setResetSuccess("");
                            }}
                        >
                            Back to login
                        </button>
                    </form>
                )}

                {mode === "forgot_otp" && (
                    <form className="auth-form" onSubmit={handleForgotPasswordVerify}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="forgot-otp">Authenticator Code</label>
                            <div className="form-input-wrap">
                                <input
                                    type="text"
                                    id="forgot-otp"
                                    className="form-input"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setError("");
                                    }}
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading ? "Verifying..." : "Verify Authenticator"}
                        </button>

                        <button
                            type="button"
                            className="auth-text-link auth-text-link-muted"
                            onClick={() => {
                                setMode("forgot_email");
                                setError("");
                                setResetSuccess("");
                                setOtp("");
                            }}
                        >
                            Back
                        </button>
                    </form>
                )}

                {mode === "forgot_password" && (
                    <form className="auth-form" onSubmit={handleForgotPasswordReset}>
                        <div className="password-rules-box">
                            <strong>Password Requirements</strong>
                            <span>At least 12 characters, with uppercase, lowercase, number, and special character.</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="newPassword">New Password</label>
                            <div className="form-input-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    className="form-input"
                                    placeholder="Enter your new password"
                                    value={resetForm.newPassword}
                                    onChange={handleResetFieldChange}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <iconify-icon icon={showPassword ? "ri:eye-off-line" : "ri:eye-line"}></iconify-icon>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="form-input-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className="form-input"
                                    placeholder="Re-enter your new password"
                                    value={resetForm.confirmPassword}
                                    onChange={handleResetFieldChange}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading ? "Updating..." : "Set New Password"}
                        </button>

                        <button
                            type="button"
                            className="auth-text-link auth-text-link-muted"
                            onClick={() => {
                                setMode("forgot_otp");
                                setError("");
                                setResetSuccess("");
                            }}
                        >
                            Back
                        </button>
                    </form>
                )}

                {mode === "enroll_success" && (
                    <div className="enroll-success-flow">
                        <div className="recovery-vault-header">
                            <iconify-icon icon="ri:shield-keyhole-line"></iconify-icon>
                            <span>Master Recovery Vault</span>
                        </div>
                        <p className="recovery-hint">Keep these codes safe. They are your only backup if you lose your phone.</p>
                        
                        <div className="recovery-codes-stack">
                            {recoveryCodes.map((code, idx) => (
                                <div key={idx} className="recovery-code-item">
                                    <span className="code-idx">{idx + 1}.</span>
                                    <code>{code}</code>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="btn-copy-all"
                            onClick={() => {
                                navigator.clipboard.writeText(recoveryCodes.join('\n'));
                                setRecoveryCopied(true);
                                setTimeout(() => setRecoveryCopied(false), 2000);
                            }}
                        >
                            <iconify-icon icon={recoveryCopied ? "ri:check-line" : "ri:file-copy-line"}></iconify-icon>
                            {recoveryCopied ? "Copied" : "Copy All Codes"}
                        </button>

                        <button 
                            type="button"
                            className="btn-auth-submit" 
                            style={{ marginTop: '12px', width: '100%' }}
                            onClick={() => window.location.href = "/admin"}
                        >
                            Finish &amp; Access Dashboard <iconify-icon icon="ri:door-open-line"></iconify-icon>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Login;
