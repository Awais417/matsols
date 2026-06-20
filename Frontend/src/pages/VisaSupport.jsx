import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./VisaSupport.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Assets
import heroBg from "../assets/images/people-traveling-without-covid-worries.jpg.jpeg";
import supportBg from "../assets/images/support-bg.webp";
import passportImg from "../assets/images/medium-shot-smiley-woman-with-passport.jpg.jpeg";
import story1 from "../assets/images/story-1.webp";
import story3 from "../assets/images/story-3.webp";
import why1 from "../assets/images/diverse_students_library_1770056302151.png";
import why2 from "../assets/images/digital_admissions_portal_1770056288503.png";
import why3 from "../assets/images/university_consulting_session_1770056274181.png";
import why4 from "../assets/images/low-angle-cheerful-team-students-passed-test-by-preparing-all-together.jpg.jpeg";
import heroAvatar from "../assets/images/hero-avatar.webp";

gsap.registerPlugin(ScrollTrigger);

const faqData = [
  { q: "How long does the visa process take?", a: "Processing times vary by country (typically 3-6 weeks). We recommend starting at least 3 months prior to intake." },
  { q: "What support do you provide for rejected cases?", a: "We provide detailed case analysis and help you re-apply with corrected documentation and stronger justifications." },
  { q: "Do you provide on-ground airport support?", a: "Yes, our pre-departure and local support teams can assist with airport pickup and initial local integration." },
];

const FAQItem = ({ item, isActive, onClick, idx }) => {
  const answerRef = useRef(null);
  return (
    <div className="anim-hidden anim-up" style={{ animationDelay: `${idx * 0.1}s` }}>
      <div className={`vs-faq-item ${isActive ? 'active' : ''}`}>
        <div className="vs-faq-question" onClick={onClick}>
          {item.q}
          <iconify-icon icon={isActive ? "ri:subtract-line" : "ri:add-line"}></iconify-icon>
        </div>
        <div
          className="vs-faq-answer-wrapper"
          style={{
            height: isActive ? (answerRef.current?.scrollHeight || 'auto') : 0,
            overflow: 'hidden',
            transition: 'height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
            opacity: isActive ? 1 : 0
          }}
        >
          <div ref={answerRef} className="vs-faq-answer">
            {item.a}
          </div>
        </div>
      </div>
    </div>
  );
};

function VisaSupport() {
  const [faqActive, setFaqActive] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.anim-hidden').forEach((el) => observer.observe(el));

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

  const checklistData = [
    { title: "Passport Validity", icon: "ri:passport-line", desc: "Minimum 6 months validity required." },
    { title: "Financial Proofs", icon: "ri:bank-card-line", desc: "Bank statements & funding evidence." },
    { title: "Valid CAS/i20", icon: "ri:building-line", desc: "Official acceptance from institution." },
    { title: "Medical Health", icon: "ri:heart-pulse-line", desc: "TB test & health insurance coverage." },
    { title: "English Proficiency", icon: "ri:translate-2", desc: "IELTS/PTE original certificates." },
    { title: "Statement of Purpose", icon: "ri:file-list-3-line", desc: "Convincing visa intent letter." },
  ];


  return (
    <div className="vs-page">
      <Header />

      {/* HERO SECTION */}
      <section className="vs-hero">
        <div className="vs-hero__bg" style={{ backgroundImage: `url(${heroBg})` }}></div>
        <div className="vs-hero__overlay"></div>
        <div className="vs-hero__content">
          <h1 className="vs-hero__title anim-hidden anim-up">
            Applications Accepted.<br />
            <span>Now Let's Get You There.</span>
          </h1>
          <p className="vs-hero__subtitle anim-hidden anim-up delay-100">
            Advisory, MATSOLS & Dokumentations Guidance
          </p>
          <div className="vs-hero__actions anim-hidden anim-up delay-200">
            <Link to="/degrees" className="btn btn-primary">Our Programs</Link>
            <Link to="/free-consultation" className="btn btn-outline-white">Join Us</Link>
          </div>
        </div>
      </section>

      {/* WE ASSIST WITH */}
      <section className="vs-assist">
        <div className="vs-container vs-assist__grid">
          <div className="vs-assist__image anim-hidden anim-left">
            <img src={supportBg} alt="Consultation" />
          </div>
          <div className="vs-assist__content anim-hidden anim-right">
            <h2>We Assist With</h2>
            <div className="vs-assist__list">
              {[
                { title: "Visa Guidance & Checks", desc: "In-depth review of all documents to ensure 100% compliance with host country regulations." },
                { title: "Mock Interviews", desc: "Gain confidence with simulated visa interviews conducted by our senior compliance experts." },
                { title: "Pre-departure Support", desc: "Everything from accommodation booking to flight arrangements, we ensure you're ready." }
              ].map((item, i) => (
                <div key={i} className="vs-assist-card">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY PROFESSIONAL SUPPORT MATTERS */}
      <section className="vs-why">
        <div className="vs-container">
          <h2 className="vs-section-title anim-hidden anim-up">Why Professional Support Matters</h2>
          <div className="vs-why__grid">
            {[
              { title: "Document Verification", img: why1 },
              { title: "Expert Consultations", img: why2 },
              { title: "Seamless Application", img: why3 },
              { title: "Peace of Mind", img: why4 }
            ].map((item, i) => (
              <div key={i} className="vs-why-card anim-hidden anim-pop">
                <div className="vs-why-img-wrap">
                  <img src={item.img} alt={item.title} />
                </div>
                <div className="vs-why-info">
                  <h3>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCUMENTATION CHECKLIST */}
      <section className="vs-checklist">
        <div className="vs-container">
          <h2 className="vs-section-title anim-hidden anim-up">Documentation Checklist</h2>
          <div className="vs-checklist__grid">
            {checklistData.map((item, i) => (
              <div key={i} className="vs-checklist-card anim-hidden anim-up">
                <iconify-icon icon={item.icon} width="32"></iconify-icon>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR PROCESS */}
      <section className="vs-process">
        <div className="vs-container">
          <h2 className="vs-section-title anim-hidden anim-up">Our Process</h2>
          <div className="vs-process__grid">
            {[
              { step: "01. Intake", icon: "ri:user-add-line" },
              { step: "02. Analysis", icon: "ri:search-2-line" },
              { step: "03. Prep", icon: "ri:file-list-3-line" },
              { step: "04. Submit", icon: "ri:send-plane-fill" },
              { step: "05. Deliver", icon: "ri:checkbox-circle-line" }
            ].map((s, i) => (
              <div key={i} className="vs-process-step anim-hidden anim-up">
                <div className="vs-p-icon">
                  <div className="vs-p-circle">
                    <iconify-icon icon={s.icon} width="32" style={{ color: 'var(--primary-orange)' }}></iconify-icon>
                  </div>
                </div>
                <span>{s.step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="vs-privacy">
        <div className="vs-container anim-hidden anim-up">
          <iconify-icon icon="ri:shield-check-line" width="48" style={{ color: 'var(--primary-orange)' }}></iconify-icon>
          <h2>Your Privacy Is Our Priority</h2>
          <p>We handle all student data with banking-grade security and full confidentiality. Your dreams are safe with us.</p>
          <div className="vs-privacy__meta">
            <span>Secure Systems</span>
            <span>GDPR Compliant</span>
            <span>Trusted Counsel</span>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="vs-stories">
        <div className="vs-container">
          <h2 className="vs-section-title anim-hidden anim-up">Visa Success Stories</h2>
          <div className="vs-stories__grid">
            {[
              { name: "John D.", uni: "Manchester Met", text: "Got my visa in just 2 weeks! The documentation team was flawless." },
              { name: "Anita M.", uni: "RMIT University", text: "Their mock interview saved me. I felt so confident in front of the officer." },
              { name: "Sam K.", uni: "Malta Hub", text: "Complex case handled with ease. Truly grateful for their professional support." }
            ].map((story, i) => (
              <div key={i} className="vs-story-card anim-hidden anim-pop">
                <p>"{story.text}"</p>
                <div className="vs-s-info">
                  <img src={story1} alt={story.name} />
                  <div>
                    <h4>{story.name}</h4>
                    <span>{story.uni}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="vs-faq">
        <div className="vs-container">
          <h2 className="vs-section-title anim-hidden anim-up" style={{ color: 'white' }}>Visa FAQ</h2>
          <div className="vs-faq__list">
            {faqData.map((f, i) => (
              <FAQItem
                key={i}
                item={f}
                idx={i}
                isActive={faqActive === i}
                onClick={() => setFaqActive(faqActive === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="vs-cta">
        <div className="vs-container vs-cta__grid">
          <div className="vs-cta__img anim-hidden anim-left">
            <img src={passportImg} alt="Students" />
          </div>
          <div className="vs-cta__content anim-hidden anim-right">
            <h2>Ready to Secure Your Visa?</h2>
            <p>Our team of senior consultants is ready to evaluate your case and prepare your documentation for 100% success.</p>
            <div className="vs-cta__btns">
              <Link to="/free-consultation" className="btn btn-dark">Talk to our expert</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default VisaSupport;
