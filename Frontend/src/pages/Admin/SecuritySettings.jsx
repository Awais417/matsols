import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './SecuritySettings.css';

const SecuritySettings = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mfaData, setMfaData] = useState(null);
    const [otp, setOtp] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState('overview');
    const [setupToken, setSetupToken] = useState('');
    const [mfaActive, setMfaActive] = useState(user?.mfaEnabled || false);
    const [securityEvents, setSecurityEvents] = useState([]);
    const [confirmDisable, setConfirmDisable] = useState(false);

    useEffect(() => {
        const loadSecurityEvents = async () => {
            const events = await apiService.getSecurityEvents();
            setSecurityEvents(Array.isArray(events) ? events : []);
        };
        loadSecurityEvents();

        // Proactive Status Sync: Refresh user data to ensure MFA status is current
        const syncStatus = async () => {
            try {
                const latestUser = await apiService.getProfile();
                if (latestUser && latestUser.id) {
                    setMfaActive(!!latestUser.mfaEnabled);
                    if (updateUser) updateUser(latestUser);
                }
            } catch (err) {
                console.error("Status sync failed:", err);
            }
        };
        syncStatus();
    }, []);

    useEffect(() => {
        if (!success) return undefined;
        const timer = setTimeout(() => setSuccess(''), 2400);
        return () => clearTimeout(timer);
    }, [success]);

    const handleSetupMfa = async () => {
        setLoading(true);
        setError('');
        try {
            const resp = await apiService.setupMfa();
            if (resp.secret && resp.setupToken) {
                setMfaData(resp);
                setSetupToken(resp.setupToken);
                setStep('setup');
            } else {
                setError(resp.error || 'Failed to initialize MFA.');
            }
        } catch (err) {
            setError('Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmMfa = async () => {
        if (otp.length !== 6) {
            setError('Please enter a 6-digit code.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const resp = await apiService.confirmMfa(otp, setupToken);
            if (resp.success) {
                setMfaActive(true);
                updateUser({ ...user, mfaEnabled: true });
                setRecoveryCodes(resp.recoveryCodes);
                setStep('success');
                setSuccess('Two-Factor Authentication enabled successfully!');
            } else {
                setError(resp.error || 'Invalid code. Try again.');
            }
        } catch (err) {
            setError('Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableMfa = async () => {
        setLoading(true);
        try {
            const resp = await apiService.disableMfa();
            if (resp.success) {
                setMfaActive(false);
                updateUser({ ...user, mfaEnabled: false });
                setSuccess("Two-factor authentication disabled.");
                // Reset view to overview
                setStep('overview');
            } else {
                setError(resp.error || "Failed to disable MFA.");
            }
        } catch (err) {
            setError("Server error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="security-settings-container">
            {success && step !== 'success' && (
                <div className="security-inline-success">{success}</div>
            )}
            <header className="page-header">
                <div className="header-text">
                    <h1 
                        className="admin-title" 
                        style={{ 
                            color: '#ff6b00', 
                            background: 'none', 
                            WebkitBackgroundClip: 'unset', 
                            WebkitTextFillColor: 'initial',
                            opacity: 1,
                            fontWeight: '800'
                        }}
                    >
                        Security & Account Safety
                    </h1>
                    <p className="admin-subtitle">Manage your password, 2FA, and review account activity logs.</p>
                </div>
                {mfaActive && (
                    <div className="security-badge">
                        <iconify-icon icon="ri:lock-password-line"></iconify-icon>
                        Hardened Security Active
                    </div>
                )}
            </header>

            <div className="security-grid">
                {/* 2FA Card */}
                <div className="security-card main-mfa">
                    <div className="card-header">
                        <iconify-icon icon="ri:shield-flash-line"></iconify-icon>
                        <h2>Two-Factor Authentication (2FA)</h2>
                    </div>
                    
                    {step === 'overview' && (
                        <div className="card-content anim-fade-in">
                            {mfaActive ? (
                                <div className="mfa-active-status">
                                    <div className="status-indicator">
                                        <iconify-icon icon="ri:checkbox-circle-fill" style={{ color: '#22c55e' }}></iconify-icon>
                                        <span style={{ color: '#22c55e', fontWeight: '600' }}>Active & Protected</span>
                                    </div>
                                    <p style={{ marginTop: '12px' }}>Your account is currently secured with two-factor authentication.</p>
                                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                        <button className="btn-setup" onClick={handleSetupMfa}>
                                            Re-configure 2FA
                                        </button>
                                        <button className="btn-disable" onClick={() => setConfirmDisable(true)}>
                                            Disable 2FA
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p>Protect your account by requiring a code from a mobile app in addition to your password.</p>
                                    <div className="mfa-benefits">
                                        <div className="benefit">
                                            <iconify-icon icon="ri:checkbox-circle-fill"></iconify-icon>
                                            <span>Stop unauthorized logins</span>
                                        </div>
                                        <div className="benefit">
                                            <iconify-icon icon="ri:checkbox-circle-fill"></iconify-icon>
                                            <span>Secure session tracking</span>
                                        </div>
                                        <div className="benefit">
                                            <iconify-icon icon="ri:checkbox-circle-fill"></iconify-icon>
                                            <span>Offline recovery support</span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '32px' }}>
                                        <button className="btn-setup" onClick={handleSetupMfa} disabled={loading}>
                                            {loading ? 'Initializing...' : 'Set Up 2FA Now'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {step === 'setup' && (
                        <div className="card-content setup-view anim-fade-in">
                            <div className="manual-entry-primary">
                                <div className="manual-header">
                                    <iconify-icon icon="ri:key-fill"></iconify-icon>
                                    <span>Manual Configuration Key</span>
                                </div>
                                <p className="manual-hint">Add this key manually in your authenticator app. Use TOTP, 6 digits, and a 30-second interval.</p>
                                
                                {mfaData?.secret && (
                                    <div className="secret-vault-display">
                                        <code>{mfaData.secret}</code>
                                        <button 
                                            className="btn-copy-vault"
                                            onClick={() => {
                                                navigator.clipboard.writeText(mfaData.secret);
                                                setSuccess('Secret key copied.');
                                            }}
                                            title="Copy Secret Key"
                                        >
                                            <iconify-icon icon="ri:file-copy-line"></iconify-icon>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="step-final">
                                <p>After adding the manual key, enter the 6-digit code generated by your app:</p>
                            </div>
                            <div className="otp-input-area">
                                <input 
                                    type="text" 
                                    className="mfa-otp-input" 
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                                />
                                {error && <p className="mfa-error">{error}</p>}
                                <div className="mfa-actions">
                                    <button className="btn-confirm" onClick={handleConfirmMfa} disabled={loading}>
                                        {loading ? 'Confirming...' : 'Verify and Enable'}
                                    </button>
                                    <button className="btn-cancel" onClick={() => setStep('overview')}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="card-content success-view anim-fade-in">
                            <div className="success-icon">
                                <iconify-icon icon="ri:checkbox-circle-line"></iconify-icon>
                            </div>
                            <h3>Active & Protected</h3>
                            <p>MFA is now enabled on your account.</p>
                            
                            {recoveryCodes.length > 0 && (
                                <div className="recovery-section">
                                    <h4>Master Recovery Codes</h4>
                                    <p className="warning-text">
                                        <iconify-icon icon="ri:error-warning-line"></iconify-icon>
                                        Save these now! If you lose your phone, these are the ONLY way to recover your account.
                                    </p>
                                    <div className="codes-grid">
                                        {recoveryCodes.map((code, idx) => (
                                            <code key={idx}>{code}</code>
                                        ))}
                                    </div>
                                    <button className="btn-copy-codes" onClick={() => {
                                        navigator.clipboard.writeText(recoveryCodes.join('\n'));
                                        setSuccess('Recovery codes copied.');
                                    }}>
                                        Copy All Codes
                                    </button>
                                </div>
                            )}
                            <button className="btn-done" onClick={() => window.location.reload()}>Finish Setup</button>
                        </div>
                    )}
                </div>

                {/* Link to Full Activity Log */}
                <div className="security-card activity-summary-card">
                    <div className="card-header">
                        <iconify-icon icon="ri:history-line"></iconify-icon>
                        <h2>Forensic Audit Log</h2>
                    </div>
                    <div className="card-content">
                        <p>View the complete history of system security events, staff logins, and administrative changes with detailed IP tracking.</p>
                        <a href="/admin/activity" className="btn-view-logs">
                            View Full Audit Log <iconify-icon icon="ri:external-link-line"></iconify-icon>
                        </a>
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="security-card">
                    <div className="card-header">
                        <iconify-icon icon="ri:key-2-line"></iconify-icon>
                        <h2>Update Password</h2>
                    </div>
                    <div className="card-content">
                        <p>It's a best practice to change your password every 90 days.</p>
                        <button className="btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Support via Admin Management</button>
                    </div>
                </div>
            </div>

            {confirmDisable && (
                <div className="security-confirm-overlay" onClick={() => setConfirmDisable(false)}>
                    <div className="security-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="security-confirm-icon">
                            <iconify-icon icon="ri:error-warning-line"></iconify-icon>
                        </div>
                        <h3>Disable 2FA?</h3>
                        <p>Disabling 2FA will make your account less secure. Are you sure you want to continue?</p>
                        <div className="security-confirm-actions">
                            <button type="button" className="btn-cancel" onClick={() => setConfirmDisable(false)}>Cancel</button>
                            <button
                                type="button"
                                className="btn-disable"
                                onClick={async () => {
                                    setConfirmDisable(false);
                                    await handleDisableMfa();
                                }}
                            >
                                Disable 2FA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecuritySettings;
