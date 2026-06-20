import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { createPortal } from 'react-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [roleChangeRequest, setRoleChangeRequest] = useState(null);
    const [deleteRequest, setDeleteRequest] = useState(null);
    const [confirmingRoleChange, setConfirmingRoleChange] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [newUser, setNewUser] = useState({ fullName: '', email: '', role: 'EDITOR', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'students'

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 30; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewUser(prev => ({ ...prev, password: pass }));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await apiService.getUsers();
        setUsers(data || []);
        setLoading(false);
    };

    const handleRoleChange = (userId, userEmail, userName, newRole, currentRole) => {
        if (currentRole === 'ADMIN') {
            setMessage({ type: 'error', text: 'System Error: Administrator roles are locked and cannot be changed.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }

        if (newRole === currentRole) {
            return;
        }

        setRoleChangeRequest({
            userId,
            userEmail,
            userName,
            newRole,
            currentRole
        });
    };

    const confirmRoleChange = async () => {
        if (!roleChangeRequest) return;
        setConfirmingRoleChange(true);
        const { userId, userEmail, userName, newRole } = roleChangeRequest;
        const result = await apiService.updateUserRole(userId, newRole);
        if (result && !result.error) {
            setMessage({ type: 'success', text: `Role updated for ${userName}` });
            fetchUsers();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update role' });
        }
        setRoleChangeRequest(null);
        setConfirmingRoleChange(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const result = await apiService.createAdminUser(newUser);
        if (result && !result.error) {
            setMessage({ type: 'success', text: 'User created and role assigned successfully' });
            setShowAddModal(false);
            setNewUser({ fullName: '', email: '', role: 'EDITOR', password: '' });

            fetchUsers();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to create user' });
        }
        setSubmitting(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleDeleteUser = (userId, userName, role) => {
        if (role === 'ADMIN') {
            setMessage({ type: 'error', text: 'System Error: Administrator accounts cannot be deleted for safety.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }

        setDeleteRequest({ userId, userName, role });
    };

    const confirmDeleteUser = async () => {
        if (!deleteRequest) return;
        setConfirmingDelete(true);
        const { userId, userName } = deleteRequest;
        const result = await apiService.deleteAdminUser(userId);
        if (result && !result.error) {
            setMessage({ type: 'success', text: `${userName} removed from system` });
            fetchUsers();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to delete user' });
        }
        setDeleteRequest(null);
        setConfirmingDelete(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const roleLabelMap = {
        ADMIN: 'Administrator',
        EDITOR: 'Editor (CMS)',
        MARKETING: 'Marketing (Leads)',
        VIEWER: 'Viewer',
        SUPPORT_AGENT: 'Support Agent',
        COUNSELOR: 'Counselor'
    };

    const getRoleLabel = (role) => roleLabelMap[role] || role;

    const filteredUsers = users.filter(user => {
        const role = user.role?.toUpperCase();
        if (activeTab === 'staff') {
            return ['ADMIN', 'EDITOR', 'MARKETING', 'VIEWER', 'SUPPORT_AGENT', 'COUNSELOR'].includes(role);
        }
        return role === 'STUDENT';
    });

    if (loading) return (
        <div className="fuckin-loader-overlay">
            <div className="fuckin-loader"></div>
            <div className="loader-text">Fetching Personnel Data...</div>
        </div>
    );

    return (
        <div className="admin-content fade-in">
            <div className="admin-header">
                <div className="admin-title">
                    <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {activeTab === 'staff' ? 'Staff & Role Management' : 'Student Account Management'}
                    </h1>
                    <p>
                        {activeTab === 'staff'
                            ? 'Assign administrative roles and notify staff members via email.'
                            : 'Manage registered student accounts and platform access.'}
                    </p>
                </div>
                {activeTab === 'staff' && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '12px 28px',
                            borderRadius: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '15px'
                        }}
                    >
                        <iconify-icon icon="ri:user-add-line" style={{ fontSize: '20px' }}></iconify-icon>
                        Add Person
                    </button>
                )}
            </div>

            <div className="admin-tabs" style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                background: '#f1f5f9',
                padding: '6px',
                borderRadius: '16px',
                width: 'fit-content'
            }}>
                <button
                    onClick={() => setActiveTab('staff')}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: activeTab === 'staff' ? 'white' : 'transparent',
                        color: activeTab === 'staff' ? '#0f172a' : '#64748b',
                        boxShadow: activeTab === 'staff' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    Administrative Staff
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: activeTab === 'students' ? 'white' : 'transparent',
                        color: activeTab === 'students' ? '#0f172a' : '#64748b',
                        boxShadow: activeTab === 'students' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    Registered Students
                </button>
            </div>

            {message.text && (
                <div className={`form-message ${message.type}`} style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#16a34a' : '#ef4444',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                    {message.text}
                </div>
            )}

            <div className="admin-table-wrapper">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status/Role</th>
                            {activeTab === 'staff' && <th>Assign New Role</th>}
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td><strong>{user.fullName}</strong></td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`status-tag ${user.role?.toLowerCase()}`}>
                                        {user.role === 'STUDENT' ? 'Verified' : getRoleLabel(user.role)}
                                    </span>
                                </td>
                                {activeTab === 'staff' && (
                                    <td>
                                        <select
                                            className="ai-input"
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: '13px',
                                                width: 'auto',
                                                color: user.role === 'ADMIN' ? '#94a3b8' : '#0f172a',
                                                cursor: user.role === 'ADMIN' ? 'not-allowed' : 'pointer'
                                            }}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, user.email, user.fullName, e.target.value, user.role)}
                                            disabled={user.role === 'ADMIN'}
                                        >
                                            <option value="EDITOR">Editor (CMS)</option>
                                            <option value="MARKETING">Marketing (Leads)</option>
                                            <option value="SUPPORT_AGENT">Support Agent</option>
                                            <option value="COUNSELOR">Counselor</option>
                                            <option value="VIEWER">Viewer</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                    </td>
                                )}
                                <td style={{ textAlign: 'right' }}>
                                    {user.role !== 'ADMIN' && (
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.fullName, user.role)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                            title={user.role === 'STUDENT' ? "Delete Student Account" : "Delete Personnel"}
                                            className="delete-user-btn"
                                        >
                                            <iconify-icon icon="ri:delete-bin-line" style={{ fontSize: '18px' }}></iconify-icon>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr><td colSpan="5" className="empty-msg" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No {activeTab} found in database.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAddModal && createPortal(
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(255, 255, 255, 0.45)',
                    backdropFilter: 'blur(15px)',
                    zIndex: 9999999,
                    display: 'grid',
                    placeItems: 'center',
                    padding: '24px'
                }}>
                    <div className="glass-card fade-in" style={{
                        width: '100%',
                        maxWidth: '520px',
                        padding: '48px',
                        background: 'white',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.15)',
                        borderRadius: '32px',
                        fontFamily: '"Outfit", sans-serif',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '22px',
                                background: 'rgba(255, 134, 60, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: 'var(--primary-orange)'
                            }}>
                                <iconify-icon icon="ri:user-add-line" style={{ fontSize: '34px' }}></iconify-icon>
                            </div>
                            <h2 style={{ color: '#0f172a', fontSize: '30px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em', textTransform: 'none' }}>Add New Person</h2>
                            <p style={{ color: '#64748b', fontSize: '15px' }}>Role assignment notification will be sent via email.</p>
                        </div>

                        <form onSubmit={handleAddUser}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Full Name</label>
                                <input
                                    type="text"
                                    className="ai-input"
                                    required
                                    placeholder="e.g. John Doe"
                                    value={newUser.fullName}
                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        borderRadius: '16px',
                                        padding: '16px 20px',
                                        border: '2px solid #f1f5f9',
                                        background: '#f8fafc',
                                        fontSize: '15px',
                                        color: '#0f172a'
                                    }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="ai-input"
                                    required
                                    placeholder="staff@matsols.com"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        borderRadius: '16px',
                                        padding: '16px 20px',
                                        border: '2px solid #f1f5f9',
                                        background: '#f8fafc',
                                        fontSize: '15px',
                                        color: '#0f172a'
                                    }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                                    <span>Password</span>
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary-orange)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <iconify-icon icon="ri:loop-right-line"></iconify-icon> Generate
                                    </button>
                                </label>
                                <input
                                    type="text"
                                    className="ai-input"
                                    required
                                    placeholder="Enter a secure password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    maxLength={30}
                                    style={{
                                        width: '100%',
                                        borderRadius: '16px',
                                        padding: '16px 20px',
                                        border: '2px solid #f1f5f9',
                                        background: '#f8fafc',
                                        fontSize: '15px',
                                        color: '#0f172a'
                                    }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '35px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Initial Role</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        className="ai-input"
                                        required
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        style={{
                                            width: '100%',
                                            borderRadius: '16px',
                                            padding: '16px 20px',
                                            border: '2px solid #f1f5f9',
                                            background: '#f8fafc',
                                            fontSize: '15px',
                                            color: '#0f172a',
                                            appearance: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontFamily: '"Outfit", sans-serif'
                                        }}
                                    >
                                        <option value="EDITOR">Editor (CMS)</option>
                                        <option value="MARKETING">Marketing (Leads)</option>
                                        <option value="SUPPORT_AGENT">Support Agent</option>
                                        <option value="COUNSELOR">Counselor</option>
                                        <option value="VIEWER">Viewer</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                    <iconify-icon
                                        icon="ri:arrow-down-s-line"
                                        style={{
                                            position: 'absolute',
                                            right: '18px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#64748b',
                                            pointerEvents: 'none',
                                            fontSize: '22px'
                                        }}
                                    ></iconify-icon>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        flex: 1,
                                        color: '#64748b',
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: '2px solid #e2e8f0',
                                        background: 'transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                    style={{
                                        flex: 1,
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 20px rgba(255, 134, 60, 0.2)',
                                        background: 'var(--primary-orange)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {submitting ? (
                                        <div className="fuckin-loader fuckin-loader-sm" style={{ borderColor: 'rgba(255,255,255,0.2)', borderLeftColor: 'white' }}></div>
                                    ) : 'Create Personnel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {roleChangeRequest && createPortal(
                <div className="admin-modal-overlay" style={{ zIndex: 10000000 }}>
                    <div className="admin-modal" style={{ maxWidth: '520px' }}>
                        <div className="modal-header">
                            <h3>Confirm Role Change</h3>
                            <button className="btn-close" onClick={() => setRoleChangeRequest(null)} disabled={confirmingRoleChange}>
                                <iconify-icon icon="ri:close-line"></iconify-icon>
                            </button>
                        </div>
                        <div className="modal-body" style={{ paddingBottom: '8px' }}>
                            <div style={{
                                border: '1px solid #dbe4ef',
                                borderRadius: '18px',
                                padding: '18px',
                                background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)'
                            }}>
                                <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: 700 }}>
                                    Change {roleChangeRequest.userName}&apos;s role?
                                </p>
                                <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                                    This will update access from <strong>{getRoleLabel(roleChangeRequest.currentRole)}</strong> to <strong>{getRoleLabel(roleChangeRequest.newRole)}</strong> and send a role notification email.
                                </p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-outline" onClick={() => setRoleChangeRequest(null)} disabled={confirmingRoleChange} style={{ flex: 1, padding: '12px 16px' }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={confirmRoleChange} disabled={confirmingRoleChange} style={{ flex: 1, padding: '12px 16px' }}>
                                {confirmingRoleChange ? 'Updating...' : 'Confirm Change'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {deleteRequest && createPortal(
                <div className="admin-modal-overlay" style={{ zIndex: 10000000 }}>
                    <div className="admin-modal" style={{ maxWidth: '520px' }}>
                        <div className="modal-header">
                            <h3>Confirm Deletion</h3>
                            <button className="btn-close" onClick={() => setDeleteRequest(null)} disabled={confirmingDelete}>
                                <iconify-icon icon="ri:close-line"></iconify-icon>
                            </button>
                        </div>
                        <div className="modal-body" style={{ paddingBottom: '8px' }}>
                            <div style={{
                                border: '1px solid #fecaca',
                                borderRadius: '18px',
                                padding: '18px',
                                background: 'linear-gradient(180deg, #fffefe 0%, #fef2f2 100%)'
                            }}>
                                <p style={{ margin: '0 0 12px', color: '#991b1b', fontWeight: 700 }}>
                                    Remove {deleteRequest.userName} from the system?
                                </p>
                                <p style={{ margin: 0, color: '#7f1d1d', lineHeight: 1.6 }}>
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-outline" onClick={() => setDeleteRequest(null)} disabled={confirmingDelete} style={{ flex: 1, padding: '12px 16px' }}>
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                disabled={confirmingDelete}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#dc2626',
                                    color: '#fff',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                {confirmingDelete ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                .status-tag { 
                    padding: 4px 10px; 
                    border-radius: 12px; 
                    font-size: 11px; 
                    font-weight: 700; 
                    text-transform: uppercase; 
                }
                .status-tag.admin { background: #fee2e2; color: #dc2626; }
                .status-tag.editor { background: #e0f2fe; color: #0284c7; }
                .status-tag.marketing { background: #fef3c7; color: #d97706; }
                .status-tag.support_agent { background: #ede9fe; color: #7c3aed; }
                .status-tag.counselor { background: #dcfce7; color: #15803d; }
                .status-tag.viewer { background: #f1f5f9; color: #475569; }
                .status-tag.student { background: #f0fdf4; color: #16a34a; }
                .status-tag.user { background: #f1f5f9; color: #475569; }
                
                @media (max-width: 768px) {
                    .admin-table th, .admin-table td { font-size: 12px; padding: 12px 10px; }
                    .ai-input { min-width: 120px; }
                }
            `}</style>
        </div>
    );
};

export default UserManagement;
