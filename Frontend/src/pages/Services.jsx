import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { Swiper, SwiperSlide } from "swiper/react"; // Reusing Swiper for testimonials if needed
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./Services.css"; // The CSS file we just created
import Header from "../components/Header";
import Footer from "../components/Footer";

import supportBg from "../assets/images/support-bg.webp";
import story1 from "../assets/images/story-1.webp";
import consultingImg from "../assets/images/university_consulting_session_1770056274181.png";
import passportImg from "../assets/images/medium-shot-smiley-woman-with-passport.jpg.jpeg";
import libraryImg from "../assets/images/diverse_students_library_1770056302151.png";
import travelImg from "../assets/images/people-traveling-without-covid-worries.jpg.jpeg";
import digitalPortal from "../assets/images/digital_admissions_portal_1770056288503.png";
import scholarStory from "../assets/images/path-3.webp";

gsap.registerPlugin(ScrollTrigger);

// ROBUST FAQ COMPONENT TO FIX "DISAPPEARING" ISSUE
const FAQItem = ({ item, isOpen, onClick, idx }) => {
    const answerRef = useRef(null);

    // Use a wrapper for the scroll animation to avoid React clobbering the 'in-view' class
    return (
        <div className="anim-hidden anim-up" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div
                className={`faq-item ${isOpen ? "active" : ""}`}
                onClick={onClick}
            >
                <div className="faq-question">
                    <span>{item.q}</span>
                    <iconify-icon
                        icon={isOpen ? "line-md:minus" : "line-md:plus"}
                        width="24"
                        style={{ color: "black" }} // Force black color
                    ></iconify-icon>
                </div>
                <div
                    className="faq-answer-wrapper"
                    style={{
                        height: isOpen ? answerRef.current?.scrollHeight : 0,
                        overflow: 'hidden',
                        transition: 'height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        opacity: isOpen ? 1 : 0.6
                    }}
                >
                    <div ref={answerRef} className="faq-answer">
                        <p style={{ paddingTop: '16px', margin: 0 }}>{item.a}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Complex SVG Background Component for "Elite" Aesthetic
const ComplexBackground = () => (
    <div className="bg-abstract-wrap" style={{ opacity: 0.6, zIndex: 0, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1400 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: 'var(--primary-blue)', stopOpacity: 0.05 }} />
                    <stop offset="100%" style={{ stopColor: 'var(--primary-orange)', stopOpacity: 0.05 }} />
                </linearGradient>
            </defs>
            <path d="M0,0 L1400,0 L1400,1000 L0,1000 Z" fill="url(#grad1)" style={{ mixBlendMode: 'multiply' }} />
            <path d="M100,100 Q400,50 600,300 T1200,400" fill="none" stroke="rgba(4, 16, 33, 0.1)" strokeWidth="2" />
            <path d="M-50,600 Q300,500 500,800 T1000,900" fill="none" stroke="rgba(4, 16, 33, 0.1)" strokeWidth="2" />

            {/* Dense Grid Lines */}
            {[...Array(20)].map((_, i) => (
                <line key={`h-${i}`} x1={0} y1={i * 50} x2={1400} y2={i * 50 + 200} stroke="rgba(4, 16, 33, 0.03)" strokeWidth="1" />
            ))}
            {[...Array(20)].map((_, i) => (
                <line key={`v-${i}`} x1={i * 70} y1={0} x2={i * 70 + 200} y2={1000} stroke="rgba(4, 16, 33, 0.03)" strokeWidth="1" />
            ))}

            {/* Tech Nodes */}
            {[...Array(10)].map((_, i) => (
                <circle key={`n-${i}`} cx={Math.random() * 1400} cy={Math.random() * 1000} r="3" fill="var(--primary-orange)" opacity="0.4" />
            ))}
        </svg>
    </div>
);

function Services() {
    const [faqActive, setFaqActive] = useState(null);

    useEffect(() => {
        // CSS Animation Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        document.querySelectorAll('.anim-hidden').forEach((el) => observer.observe(el));

        // Lenis Smooth Scroll
        const lenis = new Lenis({
            duration: 0.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        return () => {
            observer.disconnect();
            lenis.destroy();
        };
    }, []);

    return (
        <div className="services-page">
            <Header />

            {/* ========== HERO SECTION (Fixed Height 100vh) ========== */}
            <section className="services-hero">
                <img
                    src="https://storage.googleapis.com/banani-generated-images/generated-images/8e06b8c3-13e7-472e-ac80-80530381ae4f.jpg"
                    className="services-hero__bg"
                    alt="Graduation Celebration"
                />
                <div className="services-hero__overlay"></div>
                <div className="container services-hero__content">
                    <div className="anim-hidden anim-up">
                        <span className="services-hero__badge">World-Class Support</span>
                        <h1 className="services-hero__title">
                            <span className="services-hero__highlight">International</span> Education Services
                        </h1>
                        <p className="services-hero__desc">
                            We navigate the complexities of global education so you don't have to.
                            From university selection to visa approval, MATSOLS is your dedicated partner in academic success.
                        </p>
                        <div className="services-hero__cta">
                            <Link to="/free-consultation" className="btn btn-primary btn-orange">Explore Services</Link>
                            <Link to="/free-consultation" className="btn btn-glass">Talk to an Expert</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Offerings Grid */}
            <section id="offerings" className="section-offerings" style={{ position: 'relative', overflow: 'hidden' }}>
                <ComplexBackground />
                <div className="container">
                    <div className="section-header anim-hidden anim-up">
                        <div className="section-badge center-badge" style={{ margin: '0 auto 16px' }}>WHAT WE OFFER</div>
                        <h2 className="section-title">Comprehensive Solutions</h2>
                        <p className="section-subtitle centered">Tailored support for every stage of your journey.</p>
                    </div>

                    <div className="offerings-grid">
                        {/* Card 1: University Application */}
                        <div className="offering-card anim-hidden anim-left">
                            <img src={consultingImg} alt="University Application" className="offering-img" />
                            <div className="offering-content">
                                <div className="offering-icon">
                                    <iconify-icon icon="ri:school-line"></iconify-icon>
                                </div>
                                <h3 className="offering-title">University Applications</h3>
                                <p className="offering-desc">
                                    Strategic guidance to get you accepted into top-tier universities worldwide. We handle the paperwork, you focus on your future.
                                </p>
                                <ul className="offering-list">
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Profile Evaluation</li>
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> SOP & Essay Editing</li>
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Application Submission</li>
                                </ul>
                                <Link to="/free-consultation" className="offering-btn btn-orange">Start Application</Link>
                            </div>
                        </div>

                        {/* Card 2: Visa Support */}
                        <div className="offering-card anim-hidden anim-right">
                            <img src={passportImg} alt="Visa Support" className="offering-img" />
                            <div className="offering-content">
                                <div className="offering-icon">
                                    <iconify-icon icon="ri:passport-line"></iconify-icon>
                                </div>
                                <h3 className="offering-title">Visa & Immigration</h3>
                                <p className="offering-desc">
                                    Navigating complex visa requirements with precision. Our experts strive for a 98% success rate in visa approvals.
                                </p>
                                <ul className="offering-list">
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Document Verification</li>
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Interview Preparation</li>
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Post-Study Work Advice</li>
                                </ul>
                                <Link to="/free-consultation" className="offering-btn btn-dark">Get Visa Advice</Link>
                            </div>
                        </div>

                        {/* Card 3: Scholarships */}
                        <div className="offering-card anim-hidden anim-left">
                            <img src={libraryImg} alt="Scholarships" className="offering-img" />
                            <div className="offering-content">
                                <div className="offering-icon">
                                    <iconify-icon icon="ri:money-dollar-circle-line"></iconify-icon>
                                </div>
                                <h3 className="offering-title">Scholarships & Funding</h3>
                                <p className="offering-desc">
                                    Unlock financial aid opportunities. We help you identify and apply for scholarships to make your education affordable.
                                </p>
                                <ul className="offering-list">
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Merit-Based Grants</li>
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Financial Aid Planning</li>
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Budgeting Assistance</li>
                                </ul>
                                <Link to="/scholarships" className="offering-btn btn-orange">Find Scholarships</Link>
                            </div>
                        </div>

                        {/* Card 4: Accommodation */}
                        <div className="offering-card anim-hidden anim-right">
                            <img src={travelImg} alt="Accommodation" className="offering-img" />
                            <div className="offering-content">
                                <div className="offering-icon">
                                    <iconify-icon icon="ri:home-smile-line"></iconify-icon>
                                </div>
                                <h3 className="offering-title">Accommodation & Travel</h3>
                                <p className="offering-desc">
                                    Settling into a new country made easy. We assist with finding safe housing and coordinating your travel logistics.
                                </p>
                                <ul className="offering-list">
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Housing Search</li>
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Flight Booking assistance</li>
                                    <li><iconify-icon icon="line-md:confirm-circle" style={{ color: 'var(--primary-orange)' }}></iconify-icon> Pre-departure Briefing</li>
                                </ul>
                                <Link to="/free-consultation" className="offering-btn btn-dark">Get info about housing</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Flow */}
            <section className="section-process-flow" style={{ position: 'relative' }}>
                <div className="bg-abstract-wrap">
                    <svg viewBox="0 0 1400 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
                        <defs>
                            <pattern id="processGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,134,60,0.15)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#processGrid)" />
                        <path d="M-200,600 Q200,800 600,400 T1400,700" fill="none" stroke="var(--primary-orange)" strokeWidth="2" opacity="0.1" strokeDasharray="10 20" />
                        <circle cx="1200" cy="800" r="300" fill="rgba(255,134,60,0.05)" filter="blur(80px)" />
                    </svg>
                </div>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="anim-hidden anim-up">
                        <h2 className="section-title" style={{ color: 'white' }}>How Our Services Work</h2>
                        <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>A streamlined 4-step process to your destination.</p>
                    </div>

                    <div className="process-steps">
                        <div className="process-step anim-hidden anim-up">
                            <div className="step-number">01</div>
                            <div className="step-icon"><iconify-icon icon="ri:chat-1-line"></iconify-icon></div>
                            <h3 className="step-title">FREE Consultation</h3>
                            <p className="step-desc">Book a high-impact session to define your academic roadmap and career trajectory.</p>
                        </div>
                        <div className="process-step anim-hidden anim-up" style={{ animationDelay: '0.1s' }}>
                            <div className="step-number">02</div>
                            <div className="step-icon"><iconify-icon icon="ri:file-list-3-line"></iconify-icon></div>
                            <h3 className="step-title">Strategy & Match</h3>
                            <p className="step-desc">Advanced profiling to match you with top-tier universities based on the latest admission data.</p>
                        </div>
                        <div className="process-step anim-hidden anim-up" style={{ animationDelay: '0.2s' }}>
                            <div className="step-number">03</div>
                            <div className="step-icon"><iconify-icon icon="ri:send-plane-fill"></iconify-icon></div>
                            <h3 className="step-title">Application</h3>
                            <p className="step-desc">Precise submission of error-free applications, SOPs, and document dossiers before deadlines.</p>
                        </div>
                        <div className="process-step anim-hidden anim-up" style={{ animationDelay: '0.3s' }}>
                            <div className="step-number">04</div>
                            <div className="step-icon"><iconify-icon icon="ri:flight-takeoff-line"></iconify-icon></div>
                            <h3 className="step-title">Visa & Fly</h3>
                            <p className="step-desc">Legal-backed visa processing with a 98% success rate, followed by pre-departure orientation.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="section-trust">
                <div className="container">
                    <div className="trust-split">
                        <div className="trust-media anim-hidden anim-left">
                            <img src={story1} alt="Students Trust Us" className="trust-img" />
                        </div>
                        <div className="trust-content anim-hidden anim-right">
                            <div className="section-badge">WHY CHOOSE US</div>
                            <h2 className="section-title" style={{ color: 'white' }}>Why Students Trust MATSOLS Services</h2>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '30px 0' }}>
                                <li style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '18px' }}>
                                    <iconify-icon icon="ri:checkbox-circle-fill" style={{ color: 'var(--primary-orange)', fontSize: '24px' }}></iconify-icon>
                                    <span><strong>98% Visa Success Rate</strong> - Highly experienced legal team.</span>
                                </li>
                                <li style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '18px' }}>
                                    <iconify-icon icon="ri:checkbox-circle-fill" style={{ color: 'var(--primary-orange)', fontSize: '24px' }}></iconify-icon>
                                    <span><strong>Personalized Mentor</strong> - Dedicated support for every student.</span>
                                </li>
                                <li style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '18px' }}>
                                    <iconify-icon icon="ri:checkbox-circle-fill" style={{ color: 'var(--primary-orange)', fontSize: '24px' }}></iconify-icon>
                                    <span><strong>Transparency</strong> - No hidden fees, honest guidance always.</span>
                                </li>
                            </ul>

                            <div className="trust-stats-bar">
                                <div className="stat-item">
                                    <span className="stat-number">96%</span>
                                    <span className="stat-label">Success</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">875+</span>
                                    <span className="stat-label">Students Placed</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">1.5k+</span>
                                    <span className="stat-label">Consultations</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">19+</span>
                                    <span className="stat-label">Years Exp.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delivery Process Details */}
            <section className="section-delivery">
                <div className="container">
                    <div className="section-header anim-hidden anim-up">
                        <h2 className="section-title">Our Service Delivery Process</h2>
                        <p className="section-subtitle centered">A deep dive into how we ensure your success.</p>
                    </div>

                    {/* Row 1 */}
                    <div className="delivery-row anim-hidden anim-up">
                        <div className="delivery-img-wrapper">
                            <img src={consultingImg} alt="Meeting" className="delivery-img" />
                        </div>
                        <div className="delivery-content">
                            <h3 className="offering-title">Step 1: Understanding Needs</h3>
                            <p className="offering-desc">
                                We begin with a thorough assessment of your academic background, career aspirations, and financial preferences. Our counselors take time to understand YOU, not just your grades.
                            </p>
                            <Link to="/about" className="btn-text" style={{ marginTop: '15px' }}>Learn more about profiling &rarr;</Link>
                        </div>
                    </div>

                    {/* Row 2 Reverse */}
                    <div className="delivery-row reverse anim-hidden anim-up">
                        <div className="delivery-img-wrapper">
                            <img src={libraryImg} alt="Counseling" className="delivery-img" />
                        </div>
                        <div className="delivery-content">
                            <h3 className="offering-title">Step 2: Counseling & Shortlisting</h3>
                            <p className="offering-desc">
                                Based on our assessment, we curate a list of universities where you have the highest probability of acceptance and scholarship success. We strategize the best fit for your future.
                            </p>
                            <Link to="/universities" className="btn-text" style={{ marginTop: '15px' }}>View University Partners &rarr;</Link>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="delivery-row anim-hidden anim-up">
                        <div className="delivery-img-wrapper">
                            <img src={digitalPortal} alt="Application" className="delivery-img" />
                        </div>
                        <div className="delivery-content">
                            <h3 className="offering-title">Step 3: Application & Lodgment</h3>
                            <p className="offering-desc">
                                Our team assists in drafting powerful SOPs, compiling documents, and submitting your application before deadlines. We track every status update for you.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section (Reused Code Logic) */}
            <section className="services-faq" style={{ position: 'relative' }}>
                <div className="bg-abstract-wrap">
                    <svg viewBox="0 0 1400 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
                        <path d="M1200,100 Q1400,300 1100,500 T900,900" fill="none" stroke="rgba(0,64,137,0.05)" strokeWidth="60" strokeLinecap="round" />
                        <path d="M-100,200 Q300,400 100,700 T500,1000" fill="none" stroke="rgba(0,64,137,0.03)" strokeWidth="40" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="container faq-container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="section-header anim-hidden anim-up">
                        <h2 className="section-title">Common Questions</h2>
                        <p className="section-subtitle centered">Clarifying your doubts.</p>
                    </div>
                    <div className="faq-list">
                        {[
                            {
                                q: "Do you charge for the initial consultation?",
                                a: "No, our initial consultation is completely free. We want to understand your goals first before we begin the journey together.",
                            },
                            {
                                q: "Can you guarantee admission?",
                                a: "While no one can ethically guarantee admission, our success rate is over 95% because we only recommend realistic and strategic pathways tailored to your profile.",
                            },
                            {
                                q: "What countries do you cover?",
                                a: "We specialize in the UK, USA, Canada, Australia, Malta, and Turkey, covering the most popular global education hubs.",
                            },
                            {
                                q: "How long does the visa process take?",
                                a: "It varies by country, but typically ranges from 2 weeks to 3 months. We start the process early to ensure you arrive on time.",
                            },
                        ].map((item, idx) => (
                            <FAQItem
                                key={idx}
                                item={item}
                                idx={idx}
                                isOpen={faqActive === idx}
                                onClick={() => setFaqActive(faqActive === idx ? null : idx)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="services-final-cta">
                <div className="container anim-hidden anim-zoom">
                    <h2 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: '800' }}>Ready to Start Your Study Abroad Journey?</h2>
                    <p style={{ fontSize: '20px', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' }}>
                        Join thousands of students who have trusted MATSOLS to build their global careers.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Link to="/free-consultation" className="btn" style={{ background: 'white', color: 'var(--primary-orange)' }}>
                            Talk to our Advisor
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Services;
