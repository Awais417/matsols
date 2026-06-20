import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './Dashboard.css';

const StudentUniversitySearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUnis = async () => {
            try {
                const data = await apiService.getUniversities();
                setUniversities(data);
            } catch (error) {
                console.error("Error fetching universities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUnis();
    }, []);

    const filteredUnis = universities.filter(uni =>
        (uni.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (uni.country?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const handleUniClick = (id) => {
        navigate(`/dashboard/universities/${id}`);
    };

    return (
        <div className="student-uni-search fade-in">
            <div className="section-header">
                <p className="section-subtitle">Find and track universities for your applications.</p>
                <div className="uni-search-bar">
                    <iconify-icon icon="ri:search-line"></iconify-icon>
                    <input
                        type="text"
                        placeholder="Search by name or country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="uni-grid">
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
                        <iconify-icon icon="line-md:loading-twotone-loop" style={{ fontSize: '48px', color: 'var(--primary-orange)' }}></iconify-icon>
                        <p style={{ marginTop: '10px', opacity: 0.6 }}>Loading universities...</p>
                    </div>
                ) : filteredUnis.map(uni => (
                    <div
                        key={uni.id}
                        className="uni-card-compact"
                        onClick={() => handleUniClick(uni.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="uni-card-main">
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                                <img
                                    src={uni.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name)}&background=random&color=fff`}
                                    alt={uni.name}
                                    className="uni-logo-small"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div className="uni-details">
                                <h3 className="uni-name-small">{uni.name}</h3>
                                <div className="uni-tags">
                                    <span className="tag country">{uni.country}</span>
                                    <span className="tag courses">{uni.status || 'Active'} Partner</span>
                                </div>
                            </div>
                        </div>
                        <div className="uni-actions">
                            <button className="btn-action save" onClick={(e) => { e.stopPropagation(); /* Save logic */ }}>
                                <iconify-icon icon="ri:heart-line"></iconify-icon>
                                Save
                            </button>
                            <button className="btn-action apply" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/universities/${uni.id}`); }}>
                                Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUnis.length === 0 && (
                <div className="no-results">
                    <iconify-icon icon="ri:search-eye-line" style={{ fontSize: '48px', opacity: 0.3 }}></iconify-icon>
                    <p>No universities found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
};

export default StudentUniversitySearch;
