import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../Dashboard/Dashboard.css';

const ApplicationManagement = () => {
    const [applications, setApplications] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('apps'); // 'apps' or 'docs'
    const [message, setMessage] = useState({ type: '', text: '' });

    const statusOptions = [
        "Submitted",
        "Documents Verified",
        "Under Review",
        "Offer Decision",
        "Visa Process"
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [appsData, docsData] = await Promise.all([
            apiService.getAdminApplications(),
            apiService.getAdminDocuments()
        ]);
        setApplications(appsData);
        setDocuments(docsData);
        setLoading(false);
    };

    const handleUpdateAppStatus = async (appId, newStatus) => {
        const step = statusOptions.indexOf(newStatus) + 1;
        const result = await apiService.updateApplicationStatus(appId, { status: newStatus, step });
        if (result && !result.error) {
            setMessage({ type: 'success', text: 'Application updated successfully' });
            fetchData();
        } else {
            setMessage({ type: 'error', text: 'Failed to update application' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleUpdateDocStatus = async (docId, newStatus) => {
        const result = await apiService.updateDocumentStatus(docId, { status: newStatus });
        if (result && !result.error) {
            setMessage({ type: 'success', text: `Document ${newStatus.toLowerCase()} successfully` });
            fetchData();
        } else {
            setMessage({ type: 'error', text: 'Failed to update document' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    if (loading) return (
        <div className="fuckin-loader-overlay">
            <div className="fuckin-loader"></div>
            <div className="loader-text">Loading Management Data...</div>
        </div>
    );

    return (
        <div className="admin-content application-mgmt fade-in">
            <div className="admin-header">
                <div className="admin-title">
                    <h1>Application & Document Management</h1>
                    <p>Track student submissions and verify required documentation.</p>
                </div>
                {message.text && (
                    <div className={`form-message ${message.type}`} style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1001 }}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="management-tabs">
                <button
                    className={`tab-btn ${activeTab === 'apps' ? 'active' : ''}`}
                    onClick={() => setActiveTab('apps')}
                >
                    Student Applications ({applications.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('docs')}
                >
                    Pending Documents ({documents.length})
                </button>
            </div>

            <div className="admin-card-list">
                {activeTab === 'apps' ? (
                    <div className="admin-table-wrapper">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>University & Course</th>
                                    <th>Status</th>
                                    <th>Applied Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => (
                                    <tr key={app.id}>
                                        <td>
                                            <div className="user-info">
                                                <strong>{app.user?.fullName}</strong>
                                                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{app.user?.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="uni-info">
                                                <strong>{app.university?.name}</strong>
                                                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{app.courseName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-tag ${app.status.toLowerCase().replace(' ', '-')}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                className="ai-input status-select"
                                                value={app.status}
                                                onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {applications.length === 0 && (
                                    <tr><td colSpan="5" className="empty-msg">No applications found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Document Name</th>
                                    <th>Type</th>
                                    <th>Uploaded</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map(doc => (
                                    <tr key={doc.id}>
                                        <td>
                                            <strong>{doc.user?.fullName}</strong>
                                        </td>
                                        <td>
                                            <div className="doc-link">
                                                <iconify-icon icon="ri:file-line"></iconify-icon>
                                                <a href={doc.url} target="_blank" rel="noreferrer" style={{ marginLeft: '5px' }}>{doc.name}</a>
                                            </div>
                                        </td>
                                        <td>{doc.type}</td>
                                        <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="verify-actions">
                                                <button className="btn-verify" onClick={() => handleUpdateDocStatus(doc.id, 'Verified')}>
                                                    Verify
                                                </button>
                                                <button className="btn-reject" onClick={() => handleUpdateDocStatus(doc.id, 'Rejected')}>
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {documents.length === 0 && (
                                    <tr><td colSpan="5" className="empty-msg">No pending documents to review.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .management-tabs { display: flex; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; overflow-x: auto; scrollbar-width: none; }
                .management-tabs::-webkit-scrollbar { display: none; }
                .tab-btn { padding: 12px 20px; background: none; border: none; font-weight: 600; color: #64748b; cursor: pointer; position: relative; white-space: nowrap; }
                .tab-btn.active { color: #ff863c; }
                .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #ff863c; }
                .status-select { padding: 4px 10px; font-size: 13px; height: auto; min-width: 140px; }
                .doc-link { display: flex; alignItems: center; gap: 8px; color: #06b6d4; }
                .verify-actions { display: flex; gap: 10px; }
                .btn-verify { background: #10b981; color: white; border: none; padding: 6px 12px; borderRadius: 6px; cursor: pointer; fontSize: 12px; }
                .btn-reject { background: #ef4444; color: white; border: none; padding: 6px 12px; borderRadius: 6px; cursor: pointer; fontSize: 12px; }
                .empty-msg { padding: 40px; textAlign: center; color: #94a3b8; }
                .status-tag { padding: 2px 8px; borderRadius: 12px; fontSize: 11px; fontWeight: bold; text-transform: uppercase; white-space: nowrap; }
                .status-tag.submitted { background: #e0f2fe; color: #0369a1; }
                .status-tag.documents-verified { background: #dcfce7; color: #15803d; }
                .status-tag.under-review { background: #fef9c3; color: #854d0e; }
                .status-tag.offer-decision { background: #f3e8ff; color: #7e22ce; }
                .status-tag.visa-process { background: #ffedd5; color: #9a3412; }

                @media (max-width: 768px) {
                    .admin-table th, .admin-table td {
                        padding: 12px 8px;
                        font-size: 13px;
                    }
                    .user-info strong, .uni-info strong {
                        display: block;
                        max-width: 150px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default ApplicationManagement;
