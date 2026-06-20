import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './Dashboard.css';

const StudentUniversityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [university, setUniversity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUni = async () => {
            try {
                const data = await apiService.getUniversityById(id);
                setUniversity(data);
            } catch (err) {
                console.error("Error fetching university details", err);
                setError("Failed to load university details.");
            } finally {
                setLoading(false);
            }
        };
        fetchUni();
    }, [id]);

    if (loading) {
        return (
            <div className="uni-detail-loading" style={{ textAlign: 'center', padding: '100px 0' }}>
                <iconify-icon icon="line-md:loading-twotone-loop" style={{ fontSize: '48px', color: 'var(--primary-orange)' }}></iconify-icon>
                <p style={{ marginTop: '10px', opacity: 0.6 }}>Loading university details...</p>
            </div>
        );
    }

    if (error || !university) {
        return (
            <div className="uni-detail-error" style={{ textAlign: 'center', padding: '100px 0' }}>
                <iconify-icon icon="ri:error-warning-line" style={{ fontSize: '48px', color: '#ef4444' }}></iconify-icon>
                <p style={{ marginTop: '10px', color: '#ef4444' }}>{error || "University not found."}</p>
                <button className="btn-outline" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="uni-detail-page fade-in">
            <div className="detail-header-nav" style={{ marginBottom: '20px' }}>
                <button
                    className="btn-back"
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#0f172a',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '700',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                        transition: 'all 0.2s'
                    }}
                >
                    <iconify-icon icon="ri:arrow-left-line"></iconify-icon>
                    Back to Search
                </button>
            </div>

            <div className="uni-detail-card" style={{ background: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #e2e8f0', marginTop: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div className="uni-detail-top" style={{ display: 'flex', gap: '35px', alignItems: 'center', marginBottom: '45px', borderBottom: '1px solid #f1f5f9', paddingBottom: '30px' }}>
                    <div style={{ width: '140px', height: '140px', borderRadius: '24px', overflow: 'hidden', background: 'white', border: '1px solid #e2e8f0', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <img
                            src={university.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name)}&background=random&color=fff`}
                            alt={university.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="uni-detail-info">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--primary-orange)', background: 'rgba(255,134,60,0.1)', padding: '4px 12px', borderRadius: '6px' }}>
                                {university.country}
                            </span>
                            {university.rank && (
                                <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', tracking: '0.05em', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '4px 12px', borderRadius: '6px' }}>
                                    World Rank {university.rank}
                                </span>
                            )}
                        </div>
                        <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', fontFamily: 'Playfair Display, serif' }}>{university.name}</h1>
                        <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '600px' }}>{university.description}</p>
                    </div>
                </div>

                <div className="uni-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '50px' }}>
                    <div className="uni-main-content">
                        <div className="content-section" style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <iconify-icon icon="ri:information-fill" style={{ color: 'var(--primary-orange)' }}></iconify-icon>
                                About the Institution
                            </h3>
                            <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                                {university.about || university.description || "Detailed overview coming soon."}
                            </div>
                        </div>

                        {university.campusLife && (
                            <div className="content-section" style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <iconify-icon icon="ri:earth-fill" style={{ color: 'var(--primary-orange)' }}></iconify-icon>
                                    Campus Life
                                </h3>
                                <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                                    {university.campusLife}
                                </div>
                            </div>
                        )}

                        {university.admissionCriteria && (
                            <div className="content-section" style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <iconify-icon icon="ri:checkbox-circle-fill" style={{ color: 'var(--primary-orange)' }}></iconify-icon>
                                    Admission Criteria
                                </h3>
                                <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                                    {university.admissionCriteria}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="uni-sidebar-actions">
                        <div style={{ background: '#0f172a', borderRadius: '24px', padding: '35px', color: 'white', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)', position: 'sticky', top: '20px' }}>
                            <h4 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '20px', fontWeight: '800' }}>Quick Actions</h4>
                            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '15px', padding: '18px', borderRadius: '14px', background: 'var(--primary-orange)', border: 'none', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 15px rgba(255,134,60,0.3)' }}>Start Application</button>
                            <button className="btn-secondary" style={{ width: '100%', padding: '18px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '16px' }}>Talk to an Advisor</button>

                            <hr style={{ margin: '30px 0', opacity: 0.1 }} />

                            {university.websiteUrl && (
                                <a
                                    href={university.websiteUrl.startsWith('http') ? university.websiteUrl : `https://${university.websiteUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#06b6d4', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', fontSize: '15px' }}
                                >
                                    Official Website
                                    <iconify-icon icon="ri:external-link-line"></iconify-icon>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentUniversityDetail;
