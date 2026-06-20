import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./CourseMatching.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Local Project Assets
import path1 from "../assets/images/smiling-students-standing-with-notepad.jpg.jpeg";
import path2 from "../assets/images/diverse_students_library_1770056302151.png";
import path3 from "../assets/images/university_consulting_session_1770056274181.png";
import heroBg from "../assets/images/glamorous-female-student-red-jacket-sitting-yard-front-college-with-computer.jpg.jpeg";
import story1 from "../assets/images/story-1.webp";
import story3 from "../assets/images/story-3.webp";
import supportBg from "../assets/images/support-bg.webp";

gsap.registerPlugin(ScrollTrigger);

function CourseMatching() {
  const [faqActive, setFaqActive] = useState(null);


  useEffect(() => {

    // CSS Animation Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    }, { threshold: 0.1 });

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

  const disciplines = [
    { name: "Business", icon: "lucide:briefcase" },
    { name: "Engineering", icon: "lucide:settings" },
    { name: "IT", icon: "lucide:monitor" },
    { name: "Medicine", icon: "lucide:heart-pulse" },
    { name: "Law", icon: "lucide:scale" },
    { name: "Arts & Design", icon: "lucide:palette" },
    { name: "Psychology", icon: "lucide:brain" },
    { name: "Nursing", icon: "lucide:stethoscope" },
    { name: "Accounting", icon: "lucide:calculator" },
    { name: "Education", icon: "lucide:book-open" },
    { name: "Hospitality", icon: "lucide:building" },
    { name: "Media", icon: "lucide:camera" },
  ];

  const faqData = [
    { q: "How do you determine which courses fit me best?", a: "We analyze your academic history, career goals, budget, and personal preferences to match you with programs that have high success rates for students with similar profiles." },
    { q: "Is this service available for postgraduate students?", a: "Yes, we handle both undergraduate and postgraduate course matching, including specialized Master's and PhD programs." },
    { q: "Do you have partnerships with top-tier universities?", a: "We work with over 100+ institutions globally, ranging from prestigious research universities to specialized vocational colleges." },
  ];

  return (
    <div className="cm-page">
      <Header />

      {/* HERO SECTION */}
      <section className="cm-hero">
        <div className="cm-hero__bg" style={{backgroundImage: `url(${heroBg})`}}></div>
        <div className="cm-hero__overlay"></div>
        <div className="cm-hero__content">
          <h1 className="cm-hero__title anim-hidden anim-up">
            Your Degree Should Work for<br />
            Your Future - <span>Not Just Today</span>
          </h1>
          <p className="cm-hero__subtitle anim-hidden anim-up delay-100">
            Personalized course recommendations based on your unique profile and career goals.
          </p>
          <div className="cm-hero__actions anim-hidden anim-up delay-200">
            <Link
              className="btn btn-primary"
              to="/free-consultation"
              state={{ returnTo: "/what-we-offer/course-matching" }}
            >
              Start Matching
            </Link>
          </div>
        </div>
      </section>

      {/* OUR APPROACH SECTION */}
      <section className="cm-approach cm-container">
        <h2 className="cm-approach__title anim-hidden anim-up">Our Approach</h2>
        
        <div className="cm-approach__row anim-hidden anim-left">
          <div className="cm-approach__image-wrap">
            <img src={path1} alt="Counseling" />
          </div>
          <div className="cm-approach__text">
            <h3>One-to-One Counseling</h3>
            <p>Our experts provide personalized guidance through one-on-one sessions, identifying your strengths and academic interests.</p>
          </div>
        </div>

        <div className="cm-approach__row reverse anim-hidden anim-right">
          <div className="cm-approach__image-wrap">
            <img src={path2} alt="Recommendations" />
          </div>
          <div className="cm-approach__text">
            <h3>Career-Aligned Recommendations</h3>
            <p>We suggest courses that directly align with your long-term career aspirations and market requirements.</p>
          </div>
        </div>

        <div className="cm-approach__row anim-hidden anim-left">
          <div className="cm-approach__image-wrap">
            <img src={path3} alt="International" />
          </div>
          <div className="cm-approach__text">
            <h3>International Destinations</h3>
            <p>Explore courses across top global study destinations, from the UK and USA to Canada and Australia.</p>
          </div>
        </div>

        <div className="cm-approach__row reverse anim-hidden anim-right">
          <div className="cm-approach__image-wrap">
            <img src={supportBg} alt="Trend Analysis" />
          </div>
          <div className="cm-approach__text">
            <h3>Market Trend Analysis</h3>
            <p>Data-driven insights into emerging job markets to ensure your degree remains valuable after graduation.</p>
          </div>
        </div>
      </section>

      {/* POPULAR DISCIPLINES */}
      <section className="cm-disciplines">
        <div className="cm-container">
          <h2 className="cm-disciplines__title anim-hidden anim-up">Popular Disciplines</h2>
          <div className="cm-disciplines__grid">
            {disciplines.map((d, i) => (
              <div key={i} className={`cm-discipline-card anim-hidden anim-up delay-${i % 4 * 100}`}>
                <div className="cm-discipline-icon">
                  <iconify-icon icon={d.icon}></iconify-icon>
                </div>
                <span className="cm-discipline-name">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE EXAMINE */}
      <section className="cm-examine">
        <div className="cm-container cm-examine__grid">
          <div className="cm-examine__image anim-hidden anim-left">
            <img src={supportBg} alt="Team" />
          </div>
          <div className="cm-examine__content anim-hidden anim-right">
            <h2>What We Examine</h2>
            <div className="cm-examine__list">
              <div className="cm-examine-card">
                <div className="cm-examine-bullet"></div>
                <div className="cm-examine-info">
                  <h4>Academic Background</h4>
                  <p>Deep dive into your qualifications and scoring history.</p>
                </div>
              </div>
              <div className="cm-examine-card">
                <div className="cm-examine-bullet"></div>
                <div className="cm-examine-info">
                  <h4>Financial Goals</h4>
                  <p>Matching with your budget and available scholarship opportunities.</p>
                </div>
              </div>
              <div className="cm-examine-card">
                <div className="cm-examine-bullet"></div>
                <div className="cm-examine-info">
                  <h4>Personal Preferences</h4>
                  <p>Campus life, location, and cultural fit adjustments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="cm-stats">
        <div className="cm-container cm-stats__grid">
          <div className="cm-stat-item anim-hidden anim-up">
            <h2>85%</h2>
            <p>Success Rate</p>
          </div>
          <div className="cm-stat-item anim-hidden anim-up delay-100">
            <h2>500k+</h2>
            <p>Applications</p>
          </div>
          <div className="cm-stat-item anim-hidden anim-up delay-200">
            <h2>100+</h2>
            <p>Universities</p>
          </div>
          <div className="cm-stat-item anim-hidden anim-up delay-300">
            <h2>10k+</h2>
            <p>Students</p>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="cm-stories cm-container">
        <h2 className="cm-stories__title anim-hidden anim-up">Career Success Stories</h2>
        <div className="cm-stories__grid">
          <div className="cm-story-card anim-hidden anim-up delay-100">
            <img src={story1} alt="Sarah" className="cm-story-avatar" />
            <p>"The course matching process was simple and efficient. I found exactly what I needed."</p>
            <div className="cm-story-info">
              <h4>Sarah J.</h4>
              <span>Manchester Met</span>
            </div>
          </div>
          <div className="cm-story-card anim-hidden anim-up delay-200">
            <img src={story1} alt="Michael" className="cm-story-avatar" />
            <p>"Found a course that aligned perfectly with my career goals. Highly recommended!"</p>
            <div className="cm-story-info">
              <h4>Michael T.</h4>
              <span>Uni of Leeds</span>
            </div>
          </div>
          <div className="cm-story-card anim-hidden anim-up delay-300">
            <img src={story3} alt="Elena" className="cm-story-avatar" />
            <p>"Their insights into the international job market were a game-changer for me."</p>
            <div className="cm-story-info">
              <h4>Elena R.</h4>
              <span>RMIT University</span>
            </div>
          </div>
        </div>
      </section>

      {/* MATCHING PROCESS */}
      <section className="cm-process">
        <div className="cm-container">
          <h2 className="cm-process__title anim-hidden anim-up">Our Matching Process</h2>
          <div className="cm-process__grid">
            <div className="cm-process-step anim-hidden anim-up delay-100">
              <div className="cm-process-icon"><iconify-icon icon="lucide:message-circle"></iconify-icon></div>
              <span>Consultation</span>
            </div>
            <div className="cm-process-step anim-hidden anim-up delay-200">
              <div className="cm-process-icon"><iconify-icon icon="lucide:user"></iconify-icon></div>
              <span>Profile Analysis</span>
            </div>
            <div className="cm-process-step anim-hidden anim-up delay-300">
              <div className="cm-process-icon"><iconify-icon icon="lucide:check-circle"></iconify-icon></div>
              <span>Course Selection</span>
            </div>
            <div className="cm-process-step anim-hidden anim-up delay-400">
              <div className="cm-process-icon"><iconify-icon icon="lucide:award"></iconify-icon></div>
              <span>Final Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="cm-faq cm-container">
        <h2 className="cm-faq__title anim-hidden anim-up">Common Questions</h2>
        <div className="cm-faq__list">
          {faqData.map((f, i) => (
            <div key={i} className={`cm-faq-item anim-hidden anim-up delay-${i * 100}`}>
              <div className="cm-faq-question" onClick={() => setFaqActive(faqActive === i ? null : i)}>
                {f.q}
                <iconify-icon icon={faqActive === i ? "lucide:chevron-up" : "lucide:chevron-down"}></iconify-icon>
              </div>
              {faqActive === i && <div className="cm-faq-answer">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cm-cta">
        <div className="cm-cta__bg" style={{backgroundImage: `url(${heroBg})`}}></div>
        <div className="cm-cta__overlay"></div>
        <div className="cm-container cm-cta__content">
          <h2 className="anim-hidden anim-up">Ready to Find Your Perfect Course?</h2>
          <p className="anim-hidden anim-up delay-100">Start your journey today with our expert guidance and personalized matching.</p>
          <div className="cm-cta__btns anim-hidden anim-up delay-200">
            <Link
              className="btn cm-btn-support"
              to="/free-consultation"
              state={{ returnTo: "/what-we-offer/course-matching" }}
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default CourseMatching;
