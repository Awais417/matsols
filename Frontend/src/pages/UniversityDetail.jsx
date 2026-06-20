import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PublicCtaLink from '../components/PublicCtaLink';
import './UniversitySearch.css';

const UniversityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [university, setUniversity] = useState(null);
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    const [linkedDegrees, setLinkedDegrees] = useState([]);

    useEffect(() => {
        const fetchUni = async () => {
            try {
                const [data, schData, degData] = await Promise.all([
                    apiService.getUniversityById(id),
                    apiService.getScholarships({ universityId: id, status: 'Active' }),
                    apiService.getAllDegrees(),
                ]);
                setUniversity(data);
                setScholarships(Array.isArray(schData) ? schData : []);
                const allDegrees = Array.isArray(degData) ? degData : [];
                const linked = allDegrees.filter((degree) => {
                    const uniId = degree?.universityId || degree?.university?.id;
                    return uniId && String(uniId) === String(id);
                });
                setLinkedDegrees(linked);
            } catch (err) {
                console.error("Error fetching university:", err);
                navigate('/universities');
            } finally {
                setLoading(false);
            }
        };
        fetchUni();
    }, [id, navigate]);

    if (loading) return (
        <div className="fuckin-loader-overlay">
            <div className="fuckin-loader"></div>
            <div className="loader-text">Loading Excellence...</div>
        </div>
    );

    if (!university) return null;

    const universitySpecs = (() => {
        try {
            const parsed = JSON.parse(university.additionalInfo || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    })();

    const parseScholarshipAdditionalInfo = (value) => {
        try {
            const parsed = JSON.parse(value || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    };

    return (
        <div className="export-wrapper">
            <div className="uni-discovery-page uni-detail-page" style={{ overflowX: 'hidden', paddingTop: 0 }}>
                <Header />

                <div className="detail-hero-section" style={{
                    backgroundImage: `url(${university.image || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1080'})`
                }}>
                    <div className="fluid-hero-container" style={{ position: 'relative', zIndex: 10 }}>
                        <div className="back-link-wrapper">
                            <Link to="/universities" className="back-link-modern">
                                <iconify-icon icon="ri:arrow-left-s-line"></iconify-icon>
                                <span>Back to Institutions</span>
                            </Link>
                        </div>

                        <div className="detail-hero-content">
                            <div className="detail-logo-wrapper">
                                <img src={university.image || 'https://placehold.co/180x180?text=Logo'} alt={university.name} />
                            </div>
                            <div className="detail-hero-text">
                                <div className="detail-badges">
                                    <span className="badge-country">
                                        <iconify-icon icon="ri:map-pin-user-line"></iconify-icon>
                                        {university.country}
                                    </span>
                                    {university.rank && (
                                        <span className="badge-rank">
                                            <iconify-icon icon="ri:trophy-line"></iconify-icon>
                                            World Rank #{university.rank}
                                        </span>
                                    )}
                                </div>
                                <h1 className="detail-title">{university.name}</h1>
                                <p className="detail-desc">{university.description}</p>

                                <div className="quick-stats-bar">
                                    <div className="stat-item">
                                        <span className="stat-label">Institution Type</span>
                                        <span className="stat-value">Public University</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Est. Year</span>
                                        <span className="stat-value">1965</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Students</span>
                                        <span className="stat-value">25,000+</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="uni-container detail-main-container">
                    <div className="detail-grid-layout">
                        <div className="detail-main-content">
                            <div className="tab-navigation">
                                {[
                                    { id: 'about', label: 'Overview', icon: 'ri:book-open-line' },
                                    { id: 'campus', label: 'Campus Life', icon: 'ri:community-line' },
                                    { id: 'admission', label: 'Admission', icon: 'ri:graduation-cap-line' },
                                    { id: 'specs', label: 'Key Stats', icon: 'ri:bar-chart-2-line' },
                                    { id: 'scholarships', label: 'Scholarships', icon: 'ri:medal-line' },
                                    { id: 'degrees', label: 'Degrees', icon: 'ri:booklet-line' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    >
                                        <iconify-icon icon={tab.icon} style={{ marginRight: '8px', verticalAlign: 'middle' }}></iconify-icon>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="tab-pane-card">
                                {activeTab === 'about' && (
                                    <div className="fade-in">
                                        <h3 className="tab-pane-title">About the Institution</h3>
                                        <p className="tab-pane-text">
                                            {university.about || "Detailed overview coming soon. This institution provides world-class education with a focus on global excellence."}
                                        </p>
                                    </div>
                                )}
                                {activeTab === 'campus' && (
                                    <div className="fade-in">
                                        <h3 className="tab-pane-title">Campus Experience</h3>
                                        <p className="tab-pane-text">
                                            {university.campusLife || "Campus life details are being updated. Expect a vibrant atmosphere with numerous student clubs, state-of-the-art facilities, and a diverse community."}
                                        </p>
                                    </div>
                                )}
                                {activeTab === 'admission' && (
                                    <div className="fade-in">
                                        <h3 className="tab-pane-title">Admission Requirements</h3>
                                        <p className="tab-pane-text">
                                            {university.admissionCriteria || "Admission details vary by program. Generally requires academic transcripts, English proficiency (IELTS/TOEFL), and a Statement of Purpose."}
                                        </p>
                                    </div>
                                )}
                                {activeTab === 'specs' && (
                                    <div className="fade-in">
                                        <h3 className="tab-pane-title">Institutional Specifications</h3>
                                        <div className="specs-grid">
                                            {universitySpecs.length > 0 ? (
                                                universitySpecs.map((info, idx) => (
                                                    <div key={idx} className="spec-item">
                                                        <div className="spec-label">{info.label}</div>
                                                        <div className="spec-value">{info.value}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ color: '#94a3b8' }}>No extra details available for this institution.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'scholarships' && (
                                    <div className="fade-in">
                                        <h3 className="tab-pane-title">Available Scholarships</h3>
                                        {scholarships.length === 0 ? (
                                            <p className="tab-pane-text">No active scholarships linked to this university yet.</p>
                                        ) : (
                                            <div className="specs-grid">
                                                {scholarships.map((item) => (
                                                    <div key={item.id} className="spec-item">
                                                        <div className="spec-label">{item.amount || 'Scholarship'}</div>
                                                        <div className="spec-value">{item.title}</div>
                                                        {parseScholarshipAdditionalInfo(item.additionalInfo).slice(0, 3).map((entry, idx) => (
                                                            <div key={`${item.id}-extra-${idx}`} style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                                                                <strong>{entry.label}:</strong> {entry.value}
                                                            </div>
                                                        ))}
                                                        {item.deadline && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Deadline: {item.deadline}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'degrees' && (
                                    <div className="fade-in">
                                        <h3 className="tab-pane-title">Linked Degrees</h3>
                                        {linkedDegrees.length === 0 ? (
                                            <p className="tab-pane-text">No degrees linked to this university yet.</p>
                                        ) : (
                                            <div className="degree-link-list">
                                                {linkedDegrees.map((degree) => (
                                                    <Link
                                                        key={degree.id || degree.slug}
                                                        to={`/degrees/${degree.slug}`}
                                                        className="degree-link-card"
                                                    >
                                                        <div className="degree-link-meta">{degree.level || "Degree"}</div>
                                                        <div className="degree-link-title">{degree.name}</div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="detail-sidebar">
                            <div className="sidebar-sticky-card">
                                <h4 className="sidebar-title">
                                    <iconify-icon icon="ri:send-plane-fill"></iconify-icon>
                                    Interested?
                                </h4>
                                <p className="sidebar-text">
                                    Start your journey today. Our expert advisors will guide you through the entire application process.
                                </p>
                                <PublicCtaLink to="/free-consultation" className="btn-sidebar-apply">
                                    Apply Now
                                </PublicCtaLink>
                                <PublicCtaLink to="/free-consultation" className="btn-sidebar-consult">
                                    Book Free Consultation
                                </PublicCtaLink>

                                <hr className="sidebar-divider" />

                                <div className="sidebar-info-list">
                                    <div className="sidebar-info-item">
                                        <iconify-icon icon="ri:map-pin-2-fill"></iconify-icon>
                                        <span>{university.location || university.country}</span>
                                    </div>
                                    {university.websiteUrl && (
                                        <a href={university.websiteUrl.startsWith('http') ? university.websiteUrl : `https://${university.websiteUrl}`}
                                            target="_blank" rel="noreferrer"
                                            className="sidebar-link">
                                            <iconify-icon icon="ri:global-line"></iconify-icon>
                                            Official Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                <div className="mobile-sticky-cta">
                    <PublicCtaLink to="/free-consultation" className="btn-apply pulse-glow">
                        Apply Now
                    </PublicCtaLink>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default UniversityDetail;
