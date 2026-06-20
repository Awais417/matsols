import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apiService } from '../services/api';
import { useEffect, useState, useMemo } from 'react';
import DOMPurify from "dompurify";
import './Degrees.css';

const renderTextWithLinks = (text) => {
    if (!text) return null;

    // Improved Regex for URLs and Emails (excludes trailing punctuation)
    const urlPattern = /((?:https?:\/\/|www\.)[^\s]*[^\s.,!?:;])/;
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    // Custom Hyperlink Pattern: (text(hyperlink:url))
    const customLinkPattern = /\((.+?)\(hyperlink:(.+?)\)\)/;

    // Combine patterns for splitting
    const combinedPattern = /((?:(?:https?:\/\/|www\.)[^\s]*[^\s.,!?:;])|(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(?:\(.+?\(hyperlink:.+?\)\)))/g;

    const parts = text.split(combinedPattern);

    return parts.map((part, i) => {
        if (customLinkPattern.test(part)) {
            const match = customLinkPattern.exec(part);
            if (match) {
                const linkText = match[1];
                const linkUrl = match[2];
                return (
                    <a key={i} href={linkUrl} target="_blank" rel="noopener noreferrer" className="content-link">
                        {linkText}
                    </a>
                );
            }
        }
        if (urlPattern.test(part)) {
            const href = part.startsWith('http') ? part : `https://${part}`;
            return (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="content-link">
                    {part}
                </a>
            );
        }
        if (emailPattern.test(part)) {
            return (
                <a
                    key={i}
                    href={`mailto:${part}`}
                    className="content-link"
                    onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `mailto:${part}`;
                    }}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

const parseExtraInfo = (value) => {
    try {
        const parsed = JSON.parse(value || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const FormattedContent = ({ content, type }) => {
    if (type === 'linked-scholarships') {
        const scholarships = Array.isArray(content) ? content : [];
        if (scholarships.length === 0) return <p>No scholarships linked to this degree yet.</p>;

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {scholarships.map((item) => (
                    <div key={item.id} style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                            {item.amount || 'Scholarship'}
                        </div>
                        <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: '700', marginTop: '4px' }}>
                            {item.title}
                        </div>
                        {parseExtraInfo(item.additionalInfo).slice(0, 3).map((entry, idx) => (
                            <div key={`${item.id}-extra-${idx}`} style={{ fontSize: '12px', color: '#334155', marginTop: '6px' }}>
                                <strong>{entry.label}:</strong> {entry.value}
                            </div>
                        ))}
                        {item.deadline && (
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                                Deadline: {item.deadline}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'specs') {
        let specs = [];
        try {
            specs = JSON.parse(content);
        } catch (e) {
            return <p>{content}</p>;
        }

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {specs.map((info, idx) => (
                    <div key={idx} style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>{info.label}</div>
                        <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: '700', marginTop: '4px' }}>{info.value}</div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'faqs') {
        let faqs = [];
        try {
            const parsed = JSON.parse(content || "[]");
            if (Array.isArray(parsed)) {
                faqs = parsed.filter((item) => item && (item.question || item.answer));
            }
        } catch {
            faqs = [];
        }

        if (faqs.length > 0) {
            return (
                <div className="formatted-content content-type-faqs">
                    {faqs.map((faq, idx) => {
                        const cleanAnswer = DOMPurify.sanitize(faq.answer || "", {
                            ALLOWED_TAGS: [
                                "p", "br", "strong", "b", "em", "i", "u", "s",
                                "ul", "ol", "li", "blockquote", "code", "pre",
                                "h1", "h2", "h3", "h4", "a", "span", "div"
                            ],
                            ALLOWED_ATTR: ["href", "target", "rel", "class", "style"]
                        });
                        return (
                            <div key={`faq-${idx}`} style={{ marginBottom: "18px" }}>
                                <div className="content-question">{faq.question || `Question ${idx + 1}`}</div>
                                <div className="content-paragraph" dangerouslySetInnerHTML={{ __html: cleanAnswer || "<p></p>" }} />
                            </div>
                        );
                    })}
                </div>
            );
        }
    }

    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content || "");
    if (looksLikeHtml) {
        const cleanHtml = DOMPurify.sanitize(content || "", {
            ALLOWED_TAGS: [
                "p", "br", "strong", "b", "em", "i", "u", "s",
                "ul", "ol", "li", "blockquote", "code", "pre",
                "h1", "h2", "h3", "h4", "a", "span", "div"
            ],
            ALLOWED_ATTR: ["href", "target", "rel", "class", "style"]
        });
        return <div className="formatted-content" dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
    }

    const lines = content.split('\n');

    return (
        <div className={`formatted-content content-type-${type}`}>
            {lines.map((line, index) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={index} className="content-spacer" />;

                // Year Headers (e.g., YEAR 1, YEAR 2)
                if (/^YEAR\s+\d+/i.test(trimmed)) {
                    return <h3 key={index} className="content-year-header">{trimmed}</h3>;
                }

                // Module Headers (e.g., Module A, Module 1)
                if (/^(Module\s+[A-Z\d]|Assessment\s+\d+)/i.test(trimmed)) {
                    return <h4 key={index} className="content-module-header">{trimmed}</h4>;
                }

                // Questions (FAQs)
                if (trimmed.endsWith('?') && type === 'faqs') {
                    return <div key={index} className="content-question">{renderTextWithLinks(trimmed)}</div>;
                }

                // Bullet points
                if (trimmed.startsWith('●') || trimmed.startsWith('-') || trimmed.startsWith('•')) {
                    return (
                        <div key={index} className="content-bullet">
                            <span className="bullet-dot"></span>
                            <span className="bullet-text">{renderTextWithLinks(trimmed.replace(/^[●•-]\s*/, ''))}</span>
                        </div>
                    );
                }

                // Credits or special labels
                if (/(\d+\s*Credits|Credits:)/i.test(trimmed)) {
                    return <div key={index} className="content-credit-badge">{trimmed}</div>;
                }

                return <p key={index} className="content-paragraph">{renderTextWithLinks(trimmed)}</p>;
            })}
        </div>
    );
};

const DegreeDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [degree, setDegree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('');
    const [linkedScholarships, setLinkedScholarships] = useState([]);

    useEffect(() => {
        const fetchDegree = async () => {
            try {
                const data = await apiService.getDegreeDetail(slug);
                if (data) {
                    setDegree(data);
                } else {
                    navigate('/degrees');
                }
            } catch (error) {
                console.error('Error fetching degree:', error);
                navigate('/degrees');
            } finally {
                setLoading(false);
            }
        };
        fetchDegree();
    }, [slug, navigate]);

    useEffect(() => {
        const fetchLinkedScholarships = async () => {
            if (!degree?.id) return;
            const data = await apiService.getScholarships({ degreeId: degree.id, status: 'Active' });
            setLinkedScholarships(Array.isArray(data) ? data : []);
        };
        fetchLinkedScholarships();
    }, [degree?.id]);

    const sections = useMemo(() => [
        { id: 'about', label: 'About Course', content: degree?.about, icon: 'lucide:info' },
        { id: 'key-info', label: 'Key Information', content: degree?.keyInformation, icon: 'lucide:help-circle' },
        { id: 'overview', label: 'Programme Overview', content: degree?.overview, icon: 'lucide:layout' },
        { id: 'structure', label: 'Course Structure', content: degree?.structure, icon: 'lucide:list-tree' },
        { id: 'admission', label: 'Admission Requirements', content: degree?.admissionRequirements, icon: 'lucide:check-circle' },
        { id: 'fees', label: 'Fees & Funding', content: degree?.fees, icon: 'lucide:banknote' },
        { id: 'scholarships', label: 'Scholarships', content: degree?.scholarships, icon: 'lucide:award' },
        { id: 'visa', label: 'Visa Information', content: degree?.visaInfo, icon: 'lucide:file-text' },
        { id: 'work-permit', label: 'Work Permit', content: degree?.workPermit, icon: 'lucide:briefcase' },
        { id: 'tuition', label: 'Tuition Fee / Year', content: degree?.tuitionFee, icon: 'lucide:credit-card' },
        { id: 'duration', label: 'Duration of Degree', content: degree?.duration, icon: 'lucide:clock' },
        { id: 'apply-date', label: 'Apply & Start Date', content: degree?.applyDate, icon: 'lucide:calendar' },
        { id: 'intake', label: 'Intake Months', content: degree?.intake, icon: 'lucide:calendar-check' },
        { id: 'location', label: 'Campus Location', content: degree?.campusLocation, icon: 'lucide:map-pin' },
        { id: 'taught-in', label: 'Taught In', content: degree?.taughtIn, icon: 'lucide:languages' },
        { id: 'affiliation', label: 'University Affiliation', content: degree?.universityAffiliation, icon: 'lucide:school' },
        { id: 'progression', label: 'Progressions & Careers', content: degree?.progression, icon: 'lucide:trending-up' },
        { id: 'linked-scholarships', label: 'Linked Scholarships', content: linkedScholarships, icon: 'lucide:award' },
        { id: 'specs', label: 'Key Specifications', content: degree?.additionalInfo, icon: 'lucide:settings' },
        { id: 'faqs', label: 'General Info & FAQs', content: degree?.faqs, icon: 'lucide:message-circle' }
    ].filter(s => {
        if (s.id === 'linked-scholarships') return Array.isArray(s.content) && s.content.length > 0;
        return s.content && s.content !== "Not specified" && s.content.trim() !== "" && s.content !== "[]";
    }), [degree, linkedScholarships]);

    useEffect(() => {
        if (sections.length > 0 && !activeSection) {
            setActiveSection(sections[0].id);
        }
    }, [degree, navigate, sections, activeSection]);

    if (loading || !degree) return null;

    const currentSection = sections.find(s => s.id === activeSection) || sections[0];

    return (
        <div className="degrees-page">
            <Header />

            {/* Header / Hero */}
            <div className="detail-hero">
                <div className="degrees-container relative z-10">
                    <Link to="/degrees" className="detail-back-link">
                        <iconify-icon icon="lucide:arrow-left"></iconify-icon>
                        Back to Courses
                    </Link>
                    <div className="max-w-4xl">
                        <span className="degree-badge">
                            {degree.level} PROGRAMME
                        </span>
                        <h1 className="detail-title">
                            {degree.name}
                        </h1>
                        <div className="detail-meta">
                            {degree.campusLocation && degree.campusLocation !== "Not specified" && (
                                <div className="meta-item">
                                    <iconify-icon icon="lucide:map-pin"></iconify-icon>
                                    Location: {degree.campusLocation}
                                </div>
                            )}
                            {degree.duration && degree.duration !== "Not specified" && (
                                <div className="meta-item">
                                    <iconify-icon icon="lucide:clock"></iconify-icon>
                                    Duration: {degree.duration}
                                </div>
                            )}
                            <div className="meta-item deadline-meta" style={{ color: '#06b6d4', fontWeight: '600' }}>
                                <iconify-icon icon="lucide:calendar-clock"></iconify-icon>
                                Deadline: {degree.applicationDeadline || 'Contact for Details'}
                            </div>
                            {degree.code && degree.code !== "Not specified" && (
                                <div className="meta-item">
                                    <iconify-icon icon="lucide:hash"></iconify-icon>
                                    {degree.code}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="degrees-container">
                <div className="detail-content">
                    {/* Sticky Sidebar Navigation */}
                    <aside className="detail-sidebar">
                        <div className="sidebar-nav">
                            <h4 className="nav-title">Course Navigation</h4>
                            <div className="nav-links">
                                {sections.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSection(s.id)}
                                        className={`sidebar-btn ${activeSection === s.id ? 'active' : ''}`}
                                    >
                                        <iconify-icon icon={s.icon}></iconify-icon>
                                        <span>{s.label}</span>
                                    </button>
                                ))}
                            </div>
                            <Link to="/free-consultation" className="btn btn-primary apply-btn">
                                Apply Now
                            </Link>
                        </div>
                    </aside>

                    {/* Content Blocks */}
                    <div className="detail-sections">
                        {currentSection && (
                            <div className="tab-pane active fade-in">
                                <div className="section-title-wrap">
                                    <div className="section-icon">
                                        <iconify-icon icon={currentSection.icon}></iconify-icon>
                                    </div>
                                    <h2 className="section-name">{currentSection.label}</h2>
                                </div>
                                <div className="section-body">
                                    <FormattedContent content={currentSection.content} type={currentSection.id} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DegreeDetail;
