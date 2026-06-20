import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePublicSettings } from "../context/PublicSettingsContext";
import "./Auth.css";

const Register = () => {
    const navigate = useNavigate();
    const { brandName, logoUrl } = usePublicSettings();
    const { register } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setError("");
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await register({
                email: formData.email,
                password: formData.password,
                role: "STUDENT" // Default role for new registrations
            });

            if (result.success) {
                // Redirect to login after successful registration
                // Alternatively, we could auto-login, but login redirection is safer
                navigate("/login", { state: { message: "Account created! Please sign in." } });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("Registration failed. Please try again.");
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
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">
                        Already have an account? <Link to="/login">Sign in here</Link>
                    </p>
                </div>

                {error && (
                    <div className="auth-error-msg anim-shake">
                        <iconify-icon icon="ri:error-warning-fill"></iconify-icon>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="fullname">Full Name</label>
                        <div className="form-input-wrap">
                            <input
                                type="text"
                                id="fullname"
                                className="form-input"
                                placeholder="Your full name"
                                value={formData.fullname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

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
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
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
                        <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                        <div className="form-input-wrap">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                className="form-input"
                                placeholder="Repeat password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <iconify-icon icon={showConfirmPassword ? "ri:eye-off-line" : "ri:eye-line"}></iconify-icon>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={loading}>
                        {loading ? (
                            <>
                                <iconify-icon icon="eos-icons:loading" width="24"></iconify-icon>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Get Started <iconify-icon icon="ri:arrow-right-line"></iconify-icon>
                            </>
                        )}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '0px' }}>
                        By registering, you agree to our Terms & Conditions.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
