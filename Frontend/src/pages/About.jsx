import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./About.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

gsap.registerPlugin(ScrollTrigger);

function About() {

 // Mobile Dropdown State

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
    };
  }, []);

  return (
    <div className="about-page">
      <Header />

      {/* ========== HERO SECTION ========== */}
      <section className="about-hero">
        <img
          src="https://storage.googleapis.com/banani-generated-images/generated-images/8e06b8c3-13e7-472e-ac80-80530381ae4f.jpg"
          className="about-hero__bg"
          alt="Graduation Celebration"
        />
        <div className="about-hero__overlay"></div>
        <div className="about-hero__inner">
          <span className="about-hero__badge anim-hidden anim-up">Education Consultancy Services</span>
          <h1 className="about-hero__title anim-hidden anim-up delay-100">
            Transforming <span className="about-hero__highlight">Dreams</span>
            <br />into Degrees
          </h1>
          <p className="about-hero__subtitle anim-hidden anim-up delay-200">Where Ambition Meets Opportunity</p>
          <p className="about-hero__desc anim-hidden anim-up delay-300">
            Matrix Solutions International - Locally in UK, Globally in the World.
            Empowering students with quality higher education access since 2005.
          </p>
          <div className="about-hero__cta anim-hidden anim-up delay-400">
            <Link to="/free-consultation" className="about-hero__btn about-hero__btn--primary">
              Start Your Free Consultation Today
            </Link>
          </div>
        </div>
        <div className="about-hero__accent"></div>
        <div className="bg-abstract-wrap">
          <svg viewBox="0 0 1400 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
            <path d="M0,800 Q400,600 800,900 T1400,700" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="20 40" />
            <circle cx="1200" cy="200" r="250" fill="rgba(255,134,60,0.03)" filter="blur(60px)" />
          </svg>
        </div>
      </section>

      {/* Our Story */}
      <div className="container story-grid" style={{position:'relative'}}>
        <div className="bg-abstract-wrap" style={{top:'-100px', bottom:'-100px', opacity:0.6, zIndex: 0, pointerEvents: 'none'}}>
            <svg viewBox="0 0 1400 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="gradStory" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor:'var(--primary-blue)', stopOpacity:0.05}} />
                        <stop offset="100%" style={{stopColor:'var(--primary-orange)', stopOpacity:0.05}} />
                    </linearGradient>
                </defs>
                <path d="M0,0 L1400,0 L1400,1000 L0,1000 Z" fill="url(#gradStory)" style={{mixBlendMode: 'multiply'}} />
                <path d="M100,100 Q400,50 600,300 T1200,400" fill="none" stroke="rgba(4, 16, 33, 0.1)" strokeWidth="2" />
                <path d="M-50,600 Q300,500 500,800 T1000,900" fill="none" stroke="rgba(4, 16, 33, 0.1)" strokeWidth="2" />
                
                {/* Dense Grid Lines */}
                {[...Array(20)].map((_, i) => (
                    <line key={`h-${i}`} x1={0} y1={i * 50} x2={1400} y2={i * 50 + 200} stroke="rgba(4, 16, 33, 0.03)" strokeWidth="1" />
                ))}
                 {[...Array(20)].map((_, i) => (
                    <line key={`v-${i}`} x1={i * 70} y1={0} x2={i * 70 + 200} y2={1000} stroke="rgba(4, 16, 33, 0.03)" strokeWidth="1" />
                ))}
            </svg>
        </div>
        <div className="anim-hidden anim-up">
          <div style={{ color: "var(--primary-orange)", fontWeight: 700, textTransform: "uppercase", marginBottom: "16px" }}>Our Story</div>
          <h2 style={{ fontSize: "40px", fontWeight: 800, color: "var(--primary-blue)", marginBottom: "24px" }}>From Vision to Global Impact</h2>
          <p style={{ fontSize: "18px", color: "var(--text-light)", marginBottom: "24px", lineHeight: "1.7" }}>
            Founded in 2005 as part of Matrix Solutions International, MATSOLS was created with one bold belief: quality education should be accessible to every student with a dream.
          </p>
          <p style={{ fontSize: "18px", color: "var(--text-light)", marginBottom: "32px", lineHeight: "1.7" }}>
            Over the years, we've become a trusted bridge between students and top institutions worldwide.
          </p>
          <div style={{ marginBottom: "32px" }}>
            <span className="country-badge">🌍 United Kingdom</span>
            <span className="country-badge" style={{ background: "#fff0e6", color: "var(--primary-orange)" }}>🌍 United States</span>
            <span className="country-badge">🌍 Australia</span>
            <span className="country-badge" style={{ background: "#f8f9fa", color: "var(--text-light)" }}>...and beyond</span>
          </div>
          <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-dark)" }}>
            Our international platform combines knowledge, experience, and relationships to help you choose the right path - with confidence.
          </p>
        </div>
        <div>
          <img src="https://app.banani.co/map.png" alt="Global Presence Map" className="story-map" />
        </div>
      </div>

      {/* Mission & Values */}
      <section className="mission-section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 className="anim-hidden anim-up" style={{ fontSize: "36px", fontWeight: 800, marginBottom: "32px" }}>More Than Just Guidance</h2>
            <div className="mission-box anim-hidden anim-zoom delay-100">
              <p style={{ fontSize: "24px", fontWeight: 500, fontStyle: "italic", lineHeight: "1.4" }}>
                "To empower students with high-quality educational opportunities, personalised planning, and global access to world-class universities."
              </p>
            </div>
          </div>
          <div className="values-grid">
            <div className="value-card anim-hidden anim-pop delay-100">
              <div className="value-icon"><iconify-icon icon="lucide:shield-check"></iconify-icon></div>
              <h3 style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary-blue)", marginBottom: "16px" }}>Integrity</h3>
              <p style={{ color: "var(--text-light)", fontSize: "16px", lineHeight: "1.6" }}>We protect your data, your privacy, and your trust. Acting with honesty at every step.</p>
            </div>
            <div className="value-card anim-hidden anim-pop delay-200">
              <div className="value-icon"><iconify-icon icon="lucide:heart-handshake"></iconify-icon></div>
              <h3 style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary-blue)", marginBottom: "16px" }}>Respect</h3>
              <p style={{ color: "var(--text-light)", fontSize: "16px", lineHeight: "1.6" }}>Every student is unique - we tailor guidance that respects your goals and cultural context.</p>
            </div>
            <div className="value-card anim-hidden anim-pop delay-300">
              <div className="value-icon"><iconify-icon icon="lucide:trophy"></iconify-icon></div>
              <h3 style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary-blue)", marginBottom: "16px" }}>Excellence</h3>
              <p style={{ color: "var(--text-light)", fontSize: "16px", lineHeight: "1.6" }}>From your first enquiry to your final acceptance letter, we deliver unmatched support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="diff-section bg-white">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 className="anim-hidden anim-zoom" style={{ fontSize: "36px", fontWeight: 800, color: "var(--primary-blue)" }}>Your Journey, Backed by Experience</h2>
          </div>

          {/* Row 1 */}
          <div className="diff-row">
            <div className="diff-visual anim-hidden anim-left">
              <img src="https://storage.googleapis.com/banani-generated-images/generated-images/e28eca4b-17ca-4289-a644-368f46e36202.jpg" alt="Consultation" className="diff-img" />
            </div>
            <div className="diff-content anim-hidden anim-right">
              <div className="diff-icon-circle" style={{ background: "var(--primary-orange)" }}><iconify-icon icon="lucide:award"></iconify-icon></div>
              <h3 style={{ fontSize: "30px", fontWeight: 700, color: "var(--primary-blue)", marginBottom: "16px" }}>Exclusive Recruitment Rights</h3>
              <p style={{ fontSize: "18px", color: "var(--text-light)", lineHeight: "1.7" }}>We represent select institutions - sometimes as the only official partner in your region. This gives you priority access and streamlined application processes.</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="diff-row reverse">
            <div className="diff-visual anim-hidden anim-right">
              <img src="https://storage.googleapis.com/banani-generated-images/generated-images/51012a9e-af42-45c5-a192-cbf8e709b6c9.jpg" alt="Student Searching" className="diff-img" />
            </div>
            <div className="diff-content anim-hidden anim-left">
              <div className="diff-icon-circle" style={{ background: "var(--primary-blue)" }}><iconify-icon icon="lucide:compass"></iconify-icon></div>
              <h3 style={{ fontSize: "30px", fontWeight: 700, color: "var(--primary-blue)", marginBottom: "16px" }}>Tailored Course Matching</h3>
              <p style={{ fontSize: "18px", color: "var(--text-light)", lineHeight: "1.7" }}>Not generic options - courses built around your ambitions. We analyze your academic background and career goals to find the perfect fit.</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="diff-row">
            <div className="diff-visual anim-hidden anim-left">
              <img src="https://storage.googleapis.com/banani-generated-images/generated-images/3bb7ef02-4823-4bb0-971b-2ad3edf25a1b.jpg" alt="Diverse Students" className="diff-img" />
            </div>
            <div className="diff-content anim-hidden anim-right">
              <div className="diff-icon-circle" style={{ background: "var(--primary-orange)" }}><iconify-icon icon="lucide:key"></iconify-icon></div>
              <h3 style={{ fontSize: "30px", fontWeight: 700, color: "var(--primary-blue)", marginBottom: "16px" }}>Flexible Entry Solutions</h3>
              <p style={{ fontSize: "18px", color: "var(--text-light)", lineHeight: "1.7" }}>We open doors for students who may not fit 'traditional' requirements. We specialize in finding alternative pathways and foundation programs.</p>
            </div>
          </div>

          {/* Row 4 */}
          <div className="diff-row reverse">
            <div className="diff-visual anim-hidden anim-right">
              <img src="https://storage.googleapis.com/banani-generated-images/generated-images/54cce90d-d527-4059-8b09-67f3d5f467e7.jpg" alt="International Student" className="diff-img" />
            </div>
            <div className="diff-content anim-hidden anim-left">
              <div className="diff-icon-circle" style={{ background: "var(--primary-blue)" }}><iconify-icon icon="lucide:globe"></iconify-icon></div>
              <h3 style={{ fontSize: "30px", fontWeight: 700, color: "var(--primary-blue)", marginBottom: "16px" }}>Global yet Personal</h3>
              <p style={{ fontSize: "18px", color: "var(--text-light)", lineHeight: "1.7" }}>Large-scale reach with one-on-one mentorship every step of the way. You get the resources of a global agency with the personal touch of a dedicated mentor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="commitment-section">
        <div>
          <img src="https://storage.googleapis.com/banani-generated-images/generated-images/23a28555-f9f8-43e8-85ca-de1b8a0041c2.jpg" alt="Consultation" className="commitment-img anim-hidden anim-left" />
        </div>
        <div className="commitment-content anim-hidden anim-right">
          <h2 style={{ fontSize: "40px", fontWeight: 700, marginBottom: "24px" }}>Your Success Is Our Priority</h2>
          <p style={{ fontSize: "20px", opacity: 0.9, marginBottom: "40px", lineHeight: "1.6" }}>
            From initial consultation to enrolment - and even beyond - our team of experts supports you at every milestone.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "48px" }}>
            <div className="check-list-item anim-hidden anim-pop delay-100"><iconify-icon icon="lucide:check-circle" style={{ color: "white" }}></iconify-icon> Choosing your degree</div>
            <div className="check-list-item anim-hidden anim-pop delay-200"><iconify-icon icon="lucide:check-circle" style={{ color: "white" }}></iconify-icon> Filling application forms</div>
            <div className="check-list-item anim-hidden anim-pop delay-300"><iconify-icon icon="lucide:check-circle" style={{ color: "white" }}></iconify-icon> Preparing for interviews</div>
            <div className="check-list-item anim-hidden anim-pop delay-400"><iconify-icon icon="lucide:check-circle" style={{ color: "white" }}></iconify-icon> Navigating visas</div>
            <div className="check-list-item anim-hidden anim-pop delay-500"><iconify-icon icon="lucide:check-circle" style={{ color: "white" }}></iconify-icon> Pre-departure orientation</div>
          </div>
          <Link
            to="/free-consultation"
            className="btn btn-primary anim-hidden anim-zoom delay-600"
            style={{ alignSelf: "flex-start" }}
          >
            Talk to Your Education Expert Today
          </Link>
        </div>
      </section>

      {/* Statistics */}
      <section className="stats-section">
        <div className="stats-overlay"></div>
        <div className="container stats-grid">
          <div className="stat-box anim-hidden anim-zoom delay-100">
            <div style={{ marginBottom: "16px" }}><iconify-icon icon="lucide:calendar" style={{ fontSize: "48px" }}></iconify-icon></div>
            <div style={{ fontSize: "80px", fontWeight: 800, lineHeight: 1, marginBottom: "8px" }}>19+</div>
            <div style={{ fontSize: "20px", fontWeight: 600 }}>Years of Experience</div>
          </div>
          <div className="stat-box anim-hidden anim-zoom delay-200">
            <div style={{ marginBottom: "16px" }}><iconify-icon icon="lucide:users" style={{ fontSize: "48px" }}></iconify-icon></div>
            <div style={{ fontSize: "80px", fontWeight: 800, lineHeight: 1, marginBottom: "8px" }}>875+</div>
            <div style={{ fontSize: "20px", fontWeight: 600 }}>Students Helped</div>
          </div>
          <div className="stat-box anim-hidden anim-zoom delay-300">
            <div style={{ marginBottom: "16px" }}><iconify-icon icon="lucide:award" style={{ fontSize: "48px" }}></iconify-icon></div>
            <div style={{ fontSize: "80px", fontWeight: 800, lineHeight: 1, marginBottom: "8px" }}>96%</div>
            <div style={{ fontSize: "20px", fontWeight: 600 }}>Success Rate</div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{ padding: "100px 0", background: "white" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 className="anim-hidden anim-up" style={{ fontSize: "40px", fontWeight: 800, color: "var(--primary-blue)", marginBottom: "16px" }}>Meet Our Expert Team</h2>
            <p className="anim-hidden anim-up delay-100" style={{ fontSize: "19px", color: "var(--text-light)" }}>The people behind your success</p>
          </div>
          <div className="team-grid">
            <div className="team-card anim-hidden anim-pop delay-100">
              <div className="team-name">Claire Evans</div>
              <img src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYyMDB8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzYzNzQzODA5fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Claire Evans" className="team-img" />
              <div className="team-info"><p style={{ fontSize: "14px", color: "var(--primary-orange)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Education Consultant</p></div>
            </div>
            <div className="team-card anim-hidden anim-pop delay-200">
              <div className="team-name">Marley Willis</div>
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYyMDB8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzU4MTgzNjc2fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Marley Willis" className="team-img" />
              <div className="team-info"><p style={{ fontSize: "14px", color: "var(--primary-orange)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>International Programs</p></div>
            </div>
            <div className="team-card anim-hidden anim-pop delay-300">
              <div className="team-name">Casey Russo</div>
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYyMDB8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc1ODYxMDg1M3ww&ixlib=rb-4.1.0&q=80&w=1080" alt="Casey Russo" className="team-img" />
              <div className="team-info"><p style={{ fontSize: "14px", color: "var(--primary-orange)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Student Advisor</p></div>
            </div>
            <div className="team-card anim-hidden anim-pop delay-400">
              <div className="team-name">Ervin Gustavo</div>
              <img src="https://storage.googleapis.com/banani-generated-images/generated-images/3c1ba1e0-4954-4fa4-b6c5-6130b7c3041e.jpg" alt="Ervin Gustavo" className="team-img" />
              <div className="team-info"><p style={{ fontSize: "14px", color: "var(--primary-orange)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Admissions Specialist</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <h2 className="anim-hidden anim-zoom" style={{ fontSize: "36px", fontWeight: 800, color: "var(--primary-blue)", marginBottom: "16px" }}>Our Journey</h2>
            <p className="anim-hidden anim-up delay-100" style={{ color: "var(--text-light)", fontSize: "18px" }}>Growing together with our students since 2005</p>
          </div>
          <div className="timeline-flex">
            <div className="timeline-bar"></div>
            <div className="timeline-item anim-hidden anim-up delay-100">
              <div className="timeline-dot">2005</div>
              <h4 style={{ fontWeight: 700, color: "var(--primary-blue)" }}>Founded</h4>
              <p style={{ fontSize: "14px", color: "var(--text-light)" }}>Matrix Solutions Intl</p>
            </div>
            <div className="timeline-item anim-hidden anim-up delay-200">
              <div className="timeline-dot">2010</div>
              <h4 style={{ fontWeight: 700, color: "var(--primary-blue)" }}>Expanded</h4>
              <p style={{ fontSize: "14px", color: "var(--text-light)" }}>10+ Partner Universities</p>
            </div>
            <div className="timeline-item anim-hidden anim-up delay-300">
              <div className="timeline-dot">2015</div>
              <h4 style={{ fontWeight: 700, color: "var(--primary-blue)" }}>Growth</h4>
              <p style={{ fontSize: "14px", color: "var(--text-light)" }}>500+ Students Helped</p>
            </div>
            <div className="timeline-item anim-hidden anim-up delay-400">
              <div className="timeline-dot">2020</div>
              <h4 style={{ fontWeight: 700, color: "var(--primary-blue)" }}>Global</h4>
              <p style={{ fontSize: "14px", color: "var(--text-light)" }}>1,000+ Partners</p>
            </div>
            <div className="timeline-item anim-hidden anim-up delay-500">
              <div className="timeline-dot">2024</div>
              <h4 style={{ fontWeight: 700, color: "var(--primary-blue)" }}>Excellence</h4>
              <p style={{ fontSize: "14px", color: "var(--text-light)" }}>19 Years Serving You</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: "white", padding: "100px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 className="anim-hidden anim-zoom" style={{ fontSize: "36px", fontWeight: 800, color: "var(--primary-blue)" }}>What Students Say About MATSOLS</h2>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial-card anim-hidden anim-pop delay-100">
              <iconify-icon icon="bxs:quote-alt-left" style={{ fontSize: "40px", color: "#eee", position: "absolute", top: "20px", left: "20px" }}></iconify-icon>
              <p style={{ fontSize: "18px", lineHeight: "1.7", color: "var(--text-light)", position: "relative", zIndex: 1 }}>
                "The guidance I received was phenomenal. They helped me choose the right university and the visa process was smooth."
              </p>
              <div style={{ color: "var(--primary-orange)", margin: "16px 0" }}>★★★★★</div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <img src="https://images.unsplash.com/photo-1655977237812-ee6beb137203?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYyMDB8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMHBvcnRyYWl0fGVufDB8fHx8MTc1NzAwMjI3NXww&ixlib=rb-4.1.0&q=80&w=1080" alt="Student" className="testimonial-img" />
                <div style={{ marginTop: "24px" }}>
                  <div style={{ fontWeight: 700, color: "var(--primary-blue)" }}>Sarah Jenkins</div>
                  <div style={{ fontSize: "14px", color: "#777" }}>University of Leeds</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card anim-hidden anim-pop delay-200">
              <iconify-icon icon="bxs:quote-alt-left" style={{ fontSize: "40px", color: "#eee", position: "absolute", top: "20px", left: "20px" }}></iconify-icon>
              <p style={{ fontSize: "18px", lineHeight: "1.7", color: "var(--text-light)", position: "relative", zIndex: 1 }}>
                "MATSOLS made my dream of studying in Australia a reality. The team is very supportive and knowledgeable."
              </p>
              <div style={{ color: "var(--primary-orange)", margin: "16px 0" }}>★★★★★</div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <img src="https://images.unsplash.com/photo-1698356253803-838dceb68946?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYyMDB8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMG1hbGUlMjBwb3J0cmFpdHxlbnwwfHx8fDE3Njc4NzE5NjN8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Student" className="testimonial-img" />
                <div style={{ marginTop: "24px" }}>
                  <div style={{ fontWeight: 700, color: "var(--primary-blue)" }}>Michael Chen</div>
                  <div style={{ fontSize: "14px", color: "#777" }}>University of Sydney</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta-overlay"></div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <h2 className="anim-hidden anim-zoom" style={{ fontSize: "48px", fontWeight: 800, marginBottom: "24px" }}>Ready to Study Abroad? Let's Make It Real.</h2>
          <p className="anim-hidden anim-zoom delay-100" style={{ fontSize: "24px", opacity: 0.95, marginBottom: "48px" }}>Start your journey with expert guidance</p>
          <div className="anim-hidden anim-zoom delay-200" style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
            <Link to="/free-consultation" className="btn btn-white">
              Start With a Free Consultation
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
