import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import './Dashboard.css';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [requiredActions, setRequiredActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [banner, setBanner] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const [docsData, summaryData] = await Promise.all([
                apiService.getDocuments(),
                apiService.getDashboardSummary()
            ]);
            setDocuments(docsData);
            if (summaryData && summaryData.actions) {
                setRequiredActions(summaryData.actions.filter(a => a.type === 'upload' && !a.isCompleted));
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!banner) return undefined;
        const timer = setTimeout(() => setBanner(""), 2200);
        return () => clearTimeout(timer);
    }, [banner]);

    const stats = {
        verified: documents.filter(d => d.status === "Verified").length,
        pending: documents.filter(d => d.status === "Pending Review").length,
        required: requiredActions.length
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading documents...</div>;


    return (
        <div className="documents-page fade-in">
            {banner && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '14px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', boxShadow: '0 12px 28px rgba(15,23,42,0.08)', fontWeight: 600 }}>
                    {banner}
                </div>
            )}
            <div className="section-header">
                <p className="section-subtitle">Manage your application documents and uploads.</p>
                <button className="btn-upload-new">
                    <iconify-icon icon="ri:upload-2-line"></iconify-icon>
                    Upload New Document
                </button>
            </div>

            <div className="doc-stats">
                <div className="doc-stat-card">
                    <div className="stat-icon verified">
                        <iconify-icon icon="ri:checkbox-circle-line"></iconify-icon>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.verified}</h3>
                        <p>Verified</p>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon pending">
                        <iconify-icon icon="ri:time-line"></iconify-icon>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.pending}</h3>
                        <p>Pending</p>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon required">
                        <iconify-icon icon="ri:error-warning-line"></iconify-icon>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.required}</h3>
                        <p>Required</p>
                    </div>
                </div>
            </div>

            <div className="docs-table-wrapper">
                <table className="docs-table">
                    <thead>
                        <tr>
                            <th>Document Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Date Uploaded</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => (
                            <tr key={doc.id}>
                                <td>
                                    <div className="doc-name-cell">
                                        <iconify-icon icon={doc.type === "PDF" ? "ri:file-pdf-line" : "ri:file-text-line"}></iconify-icon>
                                        <span>{doc.name}</span>
                                    </div>
                                </td>
                                <td>{doc.type}</td>
                                <td>{doc.size}</td>
                                <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                <td>
                                    <span className={`doc-status-tag ${doc.status.toLowerCase().replace(' ', '-')}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="doc-actions">
                                        <button title="View"><iconify-icon icon="ri:eye-line"></iconify-icon></button>
                                        <button title="Download"><iconify-icon icon="ri:download-line"></iconify-icon></button>
                                        <button title="Delete" className="delete"><iconify-icon icon="ri:delete-bin-line"></iconify-icon></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="required-docs">
                <h3 className="sub-section-title">Required Documents</h3>
                <div className="req-docs-list">
                    {requiredActions.length > 0 ? requiredActions.map(action => (
                        <div key={action.id} className="req-doc-item">
                            <div className="req-doc-info">
                                <h4>{action.title}</h4>
                                <p>{action.description}</p>
                            </div>
                            <button className="btn-upload-req" onClick={() => setBanner("Opening upload dialog...")}>Upload</button>
                        </div>
                    )) : (
                        <p style={{ padding: '20px', opacity: 0.5 }}>No additional documents required at this time.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Documents;
