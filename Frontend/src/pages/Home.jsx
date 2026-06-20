import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../index.css";
import path1 from "../assets/images/path-1.webp";
import path2 from "../assets/images/path-2.webp";
import path3 from "../assets/images/path-3.webp";
import heroBg from "../assets/images/hero-bg.webp";
import heroVideo from "../assets/videos/bg-video-compressed.mp4";
import heroAvatar from "../assets/images/hero-avatar.webp";
import story1 from "../assets/images/story-1.webp";
import story3 from "../assets/images/story-3.webp";
import supportBg from "../assets/images/support-bg.webp";
import blueprintBg from "../assets/images/blueprint-bg.png";
import titan1 from "../assets/images/path-1.webp";
import titan2 from "../assets/images/path-2.webp";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PublicCtaLink from "../components/PublicCtaLink";
import { apiService } from "../services/api";

import ukDest from "../assets/destinations/uk.png";
import istanbulDest from "../assets/destinations/istanbul.png";
import maltaDest from "../assets/destinations/malta.png";

import manchesterMet from "../assets/ubi-logos/1200px-Manchester_Metropolitan_University_logo.svg.png.webp";
import cardiff from "../assets/ubi-logos/Cardiff-Uni.png.webp";
import lancaster from "../assets/ubi-logos/Lancaster-Uni.png.webp";
import queenMary from "../assets/ubi-logos/Queen-Mary-Uni-of-london.png.webp";
import rmit from "../assets/ubi-logos/RMIT.png.webp";
import birmingham from "../assets/ubi-logos/Uni-of-Birmingham.png.webp";
import leeds from "../assets/ubi-logos/Uni-of-Leeds.png.webp";
import manchester from "../assets/ubi-logos/Uni-of-Manchester.png.webp";
import westernAus from "../assets/ubi-logos/Uni-of-Western-Aus.png.webp";
import bristol from "../assets/ubi-logos/University-of-Bristol-Logo-April-24.png.webp";
import unsw from "../assets/ubi-logos/unsw-australia-university-of-new-south-wales-logo.png";
import sheffieldHallam from "../assets/ubi-logos/shu-logo.svg";
import { initialUpdates } from "../data/updatesData";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [faqActive, setFaqActive] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true); // DEFAULT TO MUTED FOR CHROME AUTOPLAY GUARANTEE
  const [videoKey, setVideoKey] = useState(Date.now()); // Hard-reload key
  const bentoRef = useRef(null);
  const destRef = useRef(null);
  const processRef = useRef(null);
  const pathRef = useRef(null);
  const partnersRef = useRef(null);
  const heroRef = useRef(null);
  const heroVideoRef = useRef(null);

  const [updates, setUpdates] = useState([]);
  const [consultForm, setConsultForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    programInterest: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await apiService.getUpdates({ publishedOnly: true });
      if (data) setUpdates(data);
    };
    fetchData();
  }, []);

  const now = new Date();
  const isExpiredUpdate = (item) =>
    Boolean(item?.expiryDate && new Date(item.expiryDate) <= now);
  const importantEvents =
    updates && Array.isArray(updates)
      ? updates.filter(
        (u) => u.isImportant,
      )
      : [];
  const stdEvents =
    updates && Array.isArray(updates)
      ? updates.filter(
        (u) => !u.isImportant,
      )
      : [];
  const renderExcerpt = (value) => ({ __html: value || "" });

  const handleConsultationSubmit = (e) => {
    e.preventDefault();
    const payload = {
      fullName: consultForm.fullName.trim(),
      email: consultForm.email.trim(),
      phone: consultForm.phone.trim(),
      country: consultForm.country.trim(),
      programInterest: consultForm.programInterest.trim(),
    };

    if (
      !payload.fullName ||
      !payload.email ||
      !payload.phone ||
      !payload.country ||
      !payload.programInterest
    ) {
      return;
    }

    sessionStorage.setItem("matsols_chat_prefill", JSON.stringify(payload));
    navigate("/free-consultation", {
      state: {
        prefillIntake: payload,
        backgroundLocation: location,
      },
    });
  };

  const hasBeenAutoUnmuted = useRef(false);

  // Reset mobile submenu when main menu is closed

  // Why Choose Redesign Refs
  const whyChooseRef = useRef(null);
  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const col3Ref = useRef(null);

  useEffect(() => {
    // CSS Animation Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px 0px 0px", // Trigger immediately when element enters viewport
      },
    );

    document
      .querySelectorAll(".anim-hidden")
      .forEach((el) => observer.observe(el));

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

    // Interaction-Based Hero Audio Unmuting (Browser-Tailored)
    const heroVid = heroVideoRef.current;
    if (heroVid) {
      heroVid.volume = 0.7;
    }

    // Robust Brave Detection
    const isBrave = !!(
      navigator.brave && typeof navigator.brave.isBrave === "function"
    );
    const isChrome =
      /Chrome/.test(navigator.userAgent) &&
      /Google Inc/.test(navigator.vendor) &&
      !isBrave;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handleInteraction = (e) => {
      if (heroVideoRef.current) {
        // If already unmuted, cleanup
        if (!heroVideoRef.current.muted) {
          interactiveEvents.forEach((evt) =>
            window.removeEventListener(evt, handleInteraction),
          );
          return;
        }

        // Programmatic unmute attempt
        heroVideoRef.current.muted = false;
        setIsVideoMuted(false);

        heroVideoRef.current
          .play()
          .then(() => {
            console.log(
              "Hero: Unmuted success via " +
              (e ? e.type : "manual interaction"),
            );
            interactiveEvents.forEach((evt) =>
              window.removeEventListener(evt, handleInteraction),
            );
          })
          .catch((err) => {
            console.log("Hero: Unmuted block on interaction", err);
            if (heroVideoRef.current) {
              heroVideoRef.current.muted = true;
              setIsVideoMuted(true);
              // Show a toast or subtle hint if needed
            }
          });
      }
    };

    // Strategy Execution
    if (heroVid) {
      if (!isChrome && !isMobile) {
        // BRAVE/SAFARI/OTHERS: "WARM START" HACK (Muted Load -> 100ms Delay -> Unmute)
        heroVid.muted = true;
        setIsVideoMuted(true);
        heroVid
          .play()
          .then(() => {
            // Wait 100ms for browser to "accept" the media session, then unmute
            setTimeout(() => {
              if (heroVideoRef.current && heroVideoRef.current.muted) {
                heroVideoRef.current.muted = false;
                setIsVideoMuted(false);
                heroVideoRef.current.play().catch(() => {
                  console.log(
                    "Hero: Warm-start unmute blocked, reverting to gesture bridge",
                  );
                  heroVideoRef.current.muted = true;
                  setIsVideoMuted(true);
                });
              }
            }, 100);
          })
          .catch(() => {
            console.log("Hero: Initial play blocked even while muted");
          });
      } else {
        // Google Chrome (Standard) & Mobile: Visuals-First (Muted)
        heroVid.muted = true;
        setIsVideoMuted(true);
        heroVid.play().catch(() => { });
      }
    }

    // Interaction Bridge (No scroll, only physical gestures)
    const interactiveEvents = ["click", "touchstart"];
    interactiveEvents.forEach((evt) =>
      window.addEventListener(evt, handleInteraction),
    );

    // GSAP Animations
    const ctx = gsap.context(() => {
      // Bento Animation - REMOVED GSAP ENTRY for CSS

      // Abstract Background Parallax Scrub
      gsap.fromTo(
        ".bento-abstract-container svg",
        { y: -30 },
        {
          y: 30,
          scrollTrigger: {
            trigger: ".section-bento",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );

      // Success Circle Animation (96%)
      // Path length is ~283 (2 * PI * 45)
      // 96% of 283 is 271.68. Offset should be 283 - 271.68 = 11.32
      // Success Circle Animation (Reactive Draw)
      gsap.to(".animate-success-circle", {
        strokeDashoffset: 11.32,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".success-circle-container",
          start: "top 75%",
          end: "top 45%",
          scrub: 1.5,
        },
      });

      // Pathway Bar Animation (Reactive Scale)
      gsap.fromTo(
        ".animate-pathway-bar",
        { width: "0%" },
        {
          width: "92%",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: ".b-wide",
            start: "top 80%",
            end: "top 40%",
            scrub: 2,
          },
        },
      );

      // Destinations Header & Cards - REMOVED GSAP ENTRY for CSS

      // 3. Process Section - High-Fidelity Terminal Overhaul (Desktop Only)
      let mm = gsap.matchMedia();

      mm.add("(min-width: 1025px)", () => {
        const pc = document.querySelector(".process-content");
        const blueprintCards = gsap.utils.toArray(".blueprint-card");
        const blueprintItems = gsap.utils.toArray(".step-item");

        if (pc && processRef.current) {
          // Master Pin Timeline: Stabilized offset and indices
          const blueprintCards = gsap.utils.toArray(".blueprint-card");
          const blueprintItems = gsap.utils.toArray(".step-item");

          ScrollTrigger.create({
            trigger: processRef.current,
            pin: true,
            start: "top top", // Pin immediately at top
            end: "+=300%", // Longer scrub area for smoother pace
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              // Smooth indices calculation with buffer
              const totalItems = blueprintItems.length;
              const activeRange = 0.85; // Complete items by 85% scroll
              const idx = Math.min(
                Math.floor((p / activeRange) * totalItems),
                totalItems - 1
              );

              // Update classes only on change to prevent flicker
              blueprintItems.forEach((item, i) => {
                const isActive = i === idx;
                if (item.classList.contains("active") !== isActive) {
                  item.classList.toggle("active", isActive);
                }
              });
              blueprintCards.forEach((card, i) => {
                const isActive = i === idx;
                if (card.classList.contains("active") !== isActive) {
                  card.classList.toggle("active", isActive);
                }
              });
            },
          });
        }

        /* // Technical Parallax Grid (Commented out - target not found)
        mainTl.to(
          ".blueprint-grid",
          {
            yPercent: -8,
            rotateZ: -1.5,
            ease: "none",
          },
          0,
        ); */
      });

      // Process Section Header (Scoped Physical Scrub)
      gsap.fromTo(
        ".process-header",
        { y: 30, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          ease: "power4.out",
          scrollTrigger: {
            trigger: processRef.current,
            start: "top 60%",
            end: "top 40%",
            scrub: 0.8,
          },
        },
      );

      /* // MATSOLS Pillar Section Header (Commented out - target not found)
      gsap.fromTo(
        ".animate-matsols-header",
        { y: -30, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".animate-matsols-header",
            start: "top 75%",
            toggleActions: "play none none none",
          }
        }
      ); */

      // MATSOLS Pillar Section (Instant Reveal)
      gsap.utils.toArray(".animate-matsols-card").forEach((card, i) => {
        // Row 1 (i < 3) from Left, Row 2 (i >= 3) from Right
        const posX = i < 3 ? -60 : 60;
        gsap.fromTo(
          card,
          { x: posX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // Section Titles for Grid Sections (Instant Reveal & Visibility Hardening)
      gsap.fromTo(
        ".offers-header .section-title",
        { y: 30, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".section-offers",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
      gsap.fromTo(
        ".offers-header .section-subtitle",
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".section-offers",
            start: "top 75%",
            toggleActions: "play none none none",
          },
        },
      );

      // MATSOLS Offers Section (Removed GSAP to favour CSS)

      /* // Global Impact Section Header (Commented out - target not found)
      gsap.fromTo(
        ".impact-header .section-title",
        { y: -30, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".impact-header",
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
      gsap.fromTo(
        ".impact-header .section-subtitle",
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".impact-header",
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      ); */

      // Impact Deck Section (Instant Reveal)
      gsap.utils.toArray(".impact-card").forEach((card, i) => {
        // Row 1 (i < 3) from Bottom, Row 2 (i >= 3) from Top
        const directionY = i < 3 ? 60 : -60;
        gsap.fromTo(
          card,
          { y: directionY, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      /* // MATSOLS Title Drawing Animation (Commented out - target not found)
      const matsolsTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".section-why-choose",
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
      matsolsTl.fromTo(
        ".section-why-choose .section-title .char",
        {
          opacity: 0,
          y: 20,
          clipPath: "inset(0 0 100% 0)",
        },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.35,
          stagger: 0.02,
          ease: "power4.out",
        }
      ); */

      // --- NEW WHY CHOOSE PARALLAX (Stair Layout) ---
      // Column 1 - moves up detailed
      if (col1Ref.current && whyChooseRef.current) {
        gsap.to(col1Ref.current, {
          y: -150,
          ease: "none",
          scrollTrigger: {
            trigger: whyChooseRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Column 2 - moves up slower
      if (col2Ref.current && whyChooseRef.current) {
        gsap.to(col2Ref.current, {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: whyChooseRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Floating Abstract Elements
      const bgCircle = whyChooseRef.current?.querySelector(
        ".why-matsols-bg-circle",
      );
      if (bgCircle) {
        gsap.to(bgCircle, {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: whyChooseRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Section Subtitle Reveals (REMOVED generic conflicting selector)
      // Generic .why-choose-header .section-subtitle animation was removed to prevent collisions.
      // Individual sections now handle their own header reveals above.

      // === HERO SCROLL-TRIGGERED FORWARD-ONLY SCRUB ===
      // Animation progress follows scroll but NEVER reverses

      const heroAnimTl = gsap.timeline({ paused: true });

      // 1. Title reveal (Forward Only)
      heroAnimTl.fromTo(
        ".hero-parallax-content",
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
      );

      // 2. Main Heading reveal
      heroAnimTl.fromTo(
        ".hero-title .char",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.02, ease: "power4.out" },
        "-=0.7",
      );

      // 3. Description & Buttons reveal (Compressed overlaps)
      heroAnimTl.fromTo(
        [".hero-desc", ".hero-btns"],
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" },
        "-=0.6",
      );

      // 4. Stats cluster: Orbital reveal (One-Shot, back ease)
      heroAnimTl.fromTo(
        ".stat-1",
        { y: 60, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.5",
      );
      heroAnimTl.fromTo(
        ".stat-2",
        { y: 60, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.55",
      );
      heroAnimTl.fromTo(
        ".stat-3",
        { y: 60, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.55",
      );
      heroAnimTl.fromTo(
        ".stat-4",
        { y: 60, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.55",
      );

      // Removed pinning logic to fix section overlap
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top 20%",
        onEnter: () => heroAnimTl.play(),
        once: true,
      });

      // Hero Scroll Animation Trigger - REMOVED GENERIC UNMUTING BRIDGE IN FAVOUR OF AGGRESSIVE LISTENERS
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top 20%",
        onEnter: () => heroAnimTl.play(),
        once: true,
      });

      /* // AI Matchmaking Animation (Commented out - target not found)
      gsap.fromTo(
        ".ai-content-side",
        { x: -80, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          x: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".section-ai",
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
  
      gsap.from(".ai-visual-side", {
        scrollTrigger: {
          trigger: ".section-ai",
          start: "top 75%",
          toggleActions: "play none none none",
        },
        x: 80,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
  
      gsap.from(".neural-node", {
        scrollTrigger: {
          trigger: ".section-ai",
          start: "top 75%",
          toggleActions: "play none none none",
        },
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.01,
        ease: "power2.out",
      }); */

      // Success Stories Animation (Instant Reveal)
      gsap.fromTo(
        ".stories-header",
        { y: -30, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".section-stories",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.from(".stories-carousel-wrapper", {
        scrollTrigger: {
          trigger: ".section-stories",
          start: "top 75%",
          toggleActions: "play none none none",
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      // Updates & Insights Header Reveal (Visibility Hardened)
      gsap.fromTo(
        ".insights-header .section-title",
        { y: 30, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".section-insights",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
      gsap.fromTo(
        ".insights-header .section-subtitle",
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".section-insights",
            start: "top 75%",
            toggleActions: "play none none none",
          },
        },
      );

      /* // Updates & Insights Extra Graphics (Commented out - target not found)
      gsap.to(".moving-shape", {
        x: "random(-150, 150)",
        y: "random(-150, 150)",
        rotate: "random(-45, 45)",
        scale: "random(0.8, 1.2)",
        duration: 10,
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 1.5,
          from: "random"
        },
        ease: "sine.inOut"
      });
  
      gsap.to(".moving-outline", {
        strokeDashoffset: 2000,
        duration: 30,
        repeat: -1,
        ease: "none"
      });
  
      gsap.to(".bg-drifting-node", {
        x: "random(-200, 200)",
        y: "random(-200, 200)",
        opacity: "random(0.1, 0.5)",
        scale: "random(0.5, 1.5)",
        duration: "random(4, 10)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.5,
          from: "random"
        }
      }); */

      // FAQ Header Reveal (Instant Reveal & Visibility Hardening)
      gsap.fromTo(
        ".section-faq .section-title",
        { y: 30, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".section-faq",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
      gsap.fromTo(
        ".section-faq .section-subtitle",
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".section-faq",
            start: "top 75%",
            toggleActions: "play none none none",
          },
        },
      );

      // FAQ Items (Instant Reveal)
      gsap.utils.toArray(".faq-item").forEach((item, i) => {
        gsap.fromTo(
          item,
          { x: i % 2 === 0 ? 50 : -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            delay: i * 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // Path Section Universal Scrub Overhaul
      // 1. Path Header (Instant Reveal & Visibility Hardening)
      gsap.fromTo(
        ".path-header h2",
        { y: 30, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".path-header",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
      /* // Path Header Subtitle (Commented out - target not found)
      gsap.fromTo(
        ".path-header .section-subtitle",
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".path-header",
            start: "top 75%",
            toggleActions: "play none none none",
          }
        }
      ); */

      // 2. Path Zigzag Animation (Dynamic Length)
      const zigzagPath = document.querySelector(".zigzag-path");
      if (zigzagPath) {
        const length = zigzagPath.getTotalLength();
        gsap.fromTo(
          zigzagPath,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            scrollTrigger: {
              trigger: pathRef.current,
              start: "top center",
              end: "bottom top",
              scrub: 1.2,
            },
          },
        );
      }

      // 3. Path Steps Universal Scrub (Fade & Slide)
      gsap.utils.toArray(".path-step").forEach((step, i) => {
        const content = step.querySelector(".step-content");
        const image = step.querySelector(".step-image");

        // Content (Instant Reveal)
        gsap.fromTo(
          content,
          { x: i % 2 === 0 ? 50 : -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: step,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );

        // Image (Instant Reveal)
        gsap.fromTo(
          image,
          { scale: 0.8, opacity: 0, rotate: i % 2 === 0 ? -5 : 5 },
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: step,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );

        // Sub-buttons (Instant Pop)
        gsap.from(step.querySelector(".btn-path"), {
          x: i % 2 === 0 ? 30 : -30,
          opacity: 0,
          duration: 0.4,
          scrollTrigger: {
            trigger: step,
            start: "top 75%",
            toggleActions: "play none none none",
          },
          ease: "back.out(2)",
        });
      });

      /* // Lead Magnet (Commented out - target not found)
      gsap.fromTo(
        ".magnet-left",
        { x: -60, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          x: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".section-lead-magnet",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
  
      gsap.from(".magnet-form-wrap", {
        scrollTrigger: {
          trigger: ".section-lead-magnet",
          start: "top 75%",
          toggleActions: "play none none none",
        },
        x: 60,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      }); */

      // Partners Section Reveal (Top-Masked Drop)
      gsap.fromTo(
        ".partners-header",
        { y: -40, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          ease: "power4.out",
          scrollTrigger: {
            trigger: partnersRef.current,
            start: "top 70%",
            end: "top 50%",
            scrub: 0.8,
          },
        },
      );

      // [REVERTED] Partners Stagger Animation removed as per user request for static/instant marquee feel.
    });

    return () => {
      interactiveEvents.forEach((evt) =>
        window.removeEventListener(evt, handleInteraction),
      );
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <div className="export-wrapper">
      <Header />

      {/* Hero - Awwwards Parallax Redesign */}
      <header className="hero" ref={heroRef}>
        <video
          ref={heroVideoRef}
          className="hero-video-bg"
          src={heroVideo}
          autoPlay
          loop
          muted={isVideoMuted}
          playsInline
        ></video>
        <div className="hero-overlay"></div>

        <div className="hero-content hero-parallax-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <div className="line">
                <span className="word">
                  {"Unleash".split("").map((char, i) => (
                    <span key={i} className="char">
                      {char}
                    </span>
                  ))}
                </span>
                <span className="word">
                  {"Your".split("").map((char, i) => (
                    <span key={i} className="char">
                      {char}
                    </span>
                  ))}
                </span>
              </div>
              <div className="line highlighted">
                <span className="word">
                  {"Global".split("").map((char, i) => (
                    <span key={i} className="char">
                      {char}
                    </span>
                  ))}
                </span>
                <span className="word">
                  {"Future.".split("").map((char, i) => (
                    <span key={i} className="char">
                      {char}
                    </span>
                  ))}
                </span>
              </div>
            </h1>
            <p className="hero-desc">
              Every student's journey begins with a personalized strategy. We
              guide you through global university admissions to help design a
              future that aligns with your career goals.
            </p>
            <div className="hero-btns">
              <Link to="/register" className="btn btn-primary">
                Start Your Journey
              </Link>
              <Link to="/degrees" className="btn btn-outline">
                Explore Programs
              </Link>
            </div>
          </div>

          {/* Stats Cluster (Circular Orientation) */}
          <div className="hero-stats-cluster">
            <div className="stat-badge stat-1">
              <div className="stat-indicator green"></div>
              <div className="stat-content">
                <span className="stat-number">13,000+</span>
                <span className="stat-label">Students Placed</span>
              </div>
            </div>
            <div className="stat-badge stat-2">
              <div className="stat-indicator orange"></div>
              <div className="stat-content">
                <span className="stat-number">98%</span>
                <span className="stat-label">Visa Success Rate</span>
              </div>
            </div>
            <div className="stat-badge stat-3">
              <div className="stat-indicator blue"></div>
              <div className="stat-content">
                <span className="stat-number">70+</span>
                <span className="stat-label">Partner Universities</span>
              </div>
            </div>
            <div className="stat-badge stat-4">
              <div className="stat-indicator gold"></div>
              <div className="stat-content">
                <span className="stat-number">40+</span>
                <span className="stat-label">Countries Worldwide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Controls - Bottom Right */}
        <div className="hero-video-controls">
          <button
            className="video-control-btn"
            onClick={() => {
              if (heroVideoRef.current) {
                if (isVideoPlaying) {
                  heroVideoRef.current.pause();
                } else {
                  heroVideoRef.current.play();
                }
                setIsVideoPlaying(!isVideoPlaying);
              }
            }}
            aria-label={isVideoPlaying ? "Pause video" : "Play video"}
          >
            <iconify-icon
              icon={isVideoPlaying ? "ri:pause-fill" : "ri:play-fill"}
            ></iconify-icon>
          </button>
          <button
            className="video-control-btn"
            onClick={() => {
              if (heroVideoRef.current) {
                heroVideoRef.current.muted = !isVideoMuted;
                setIsVideoMuted(!isVideoMuted);
              }
            }}
            aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
          >
            <iconify-icon
              icon={isVideoMuted ? "ri:volume-mute-fill" : "ri:volume-up-fill"}
            ></iconify-icon>
          </button>
        </div>
      </header>

      {/* Student Category Selection Section hidden per request */}

      {/* Partners Section (Replaced Marquee) */}
      <section className="section-partners" ref={partnersRef}>
        <div className="container">
          <div className="partners-header">
            <h2 className="section-title">
              Global Partner{" "}
              <span className="text-gradient">Universities.</span>
            </h2>
            <p className="section-subtitle">
              Collaborating with the world's most prestigious institutions to
              secure your future.
            </p>
          </div>

          <div className="marquee-container">
            <div className="marquee-track">
              {/* Duplicate 4 times for seamless infinite scroll on any screen width */}
              {[...Array(4)]
                .flatMap((_, i) => [
                  { name: "Manchester Met", logo: manchesterMet },
                  { name: "Cardiff", logo: cardiff },
                  { name: "Lancaster", logo: lancaster },
                  { name: "Queen Mary", logo: queenMary },
                  { name: "RMIT", logo: rmit },
                  { name: "Birmingham", logo: birmingham },
                  { name: "Leeds", logo: leeds },
                  { name: "Manchester", logo: manchester },
                  { name: "Western Australia", logo: westernAus },
                  { name: "Bristol", logo: bristol },
                  { name: "UNSW", logo: unsw },
                  { name: "Sheffield Hallam", logo: sheffieldHallam },
                ])
                .map((uni, idx) => (
                  <div key={idx} className="partner-logo-item">
                    <img
                      src={uni.logo}
                      alt={uni.name}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Offers Section (Verbatim Content) */}
      <section className="section-offers">
        <div className="container">
          <div className="offers-header" style={{ textAlign: "left" }}>
            <h2 className="section-title">
              What We <span className="text-gradient">Offer.</span>
            </h2>
            <p
              className="section-subtitle"
              style={{ textAlign: "left", marginLeft: "0" }}
            >
              Comprehensive guidance tailored to your academic and career goals.
            </p>
          </div>
          <div className="offers-grid">
            {[
              {
                title: "Events",
                desc: "Stay ahead with MATSOLS' global education events, webinars, and workshops for international students looking to study abroad. Gain insights on university applications, visa guidance, and career pathways, and connect directly with top universities and admissions experts.",
                cta: "Join Event",
                icon: "ri:calendar-event-line",
              },
              {
                title: "Admissions",
                desc: "Get expert support with international university admissions and study abroad applications. MATSOLS' experienced consultants guide you through course selection, documentation, SOPs, and visa processes, helping you secure a place at your ideal university abroad.",
                cta: "Book Consultation",
                icon: "ri:user-star-line",
              },
              {
                title: "Scholarships",
                desc: "Access exclusive scholarship opportunities for international students and make your overseas education affordable. MATSOLS helps you identify the right scholarships, prepare applications, and maximize your chances of funding your studies at top global universities.",
                cta: "Find Scholarship",
                icon: "ri:medal-line",
              },
            ].map((offer, idx) => (
              <div
                key={idx}
                className="offer-card anim-hidden anim-pop"
                style={{ transitionDelay: `${idx * 0.15}s` }}
              >
                <div className="offer-icon-tag">
                  <iconify-icon icon={offer.icon}></iconify-icon>
                </div>
                <h3>{offer.title}</h3>
                <p>{offer.desc}</p>
                <Link
                  to={
                    offer.title === "Events"
                      ? "/events"
                      : offer.title === "Scholarships"
                        ? "/scholarships"
                        : "/free-consultation"
                  }
                  className="btn btn-primary"
                  style={{ marginTop: "auto" }}
                >
                  {offer.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Admissions Consultant Section - Academic Overhaul */}
      <section className="section-ai-consultant anim-hidden anim-up">
        <div className="world-map-bg-overlay"></div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="simple-ai-wrapper">
            <div className="simple-ai-main">
              <div className="simple-ai-header">
                <h2 className="simple-title">Your AI Admission Office</h2>
                <p className="simple-hero-text">
                  We've built a smart assistant that handles the complicated
                  parts of studying abroad. It's designed to give you direct
                  answers about universities, visas, and costs without making
                  you wait for an email or a phone call.
                </p>
              </div>

              <div className="simple-ai-content-grid">
                <div className="simple-text-side">
                  <div className="info-group">
                    <h3>Instant University Matching</h3>
                    <p>
                      Finding the right school is the hardest part. Our AI looks
                      at your current grades, what you want to study, and your
                      budget. In seconds, it gives you a list of universities in
                      the UK, USA, or Europe where you have the best chance of
                      getting an offer. It's accurate, fast, and uses real
                      admission data.
                    </p>
                  </div>

                  <div className="info-group">
                    <h3>Clear Visa & Document Help</h3>
                    <p>
                      Visa rules change all the time. Our AI stays updated with
                      the latest laws so you don't have to. Ask it which
                      documents you need for a UK Student Visa or how much money
                      you need to show in your bank account. It gives you a
                      simple checklist so you don't miss anything important.
                    </p>
                  </div>

                  <div className="info-group">
                    <h3>Real-Time Cost Estimates</h3>
                    <p>
                      Planning your budget is essential. You can ask our
                      assistant about tuition fees for specific courses or the
                      average cost of rent in cities like London or Manchester.
                      It helps you understand the total cost of your education
                      before you even apply.
                    </p>
                  </div>

                  <div className="simple-bottom-benefits">
                    <div className="benefit">
                      <span className="check">✓</span> 24/7 Support
                    </div>
                    <div className="benefit">
                      <span className="check">✓</span> Plain English Answers
                    </div>
                    <div className="benefit">
                      <span className="check">✓</span> No hidden costs
                    </div>
                  </div>
                </div>

                <div className="simple-chat-side">
                  <div className="simple-chat-box">
                    <div className="chat-header">
                      <span className="dot"></span> Online Assistant
                    </div>
                    <div className="chat-messages">
                      <div className="msg bot">
                        Hello! I'm here to help you. What are you looking to
                        study?
                      </div>
                      <div className="msg user">
                        I want to study Business in London next year.
                      </div>
                      <div className="msg bot">
                        Great! London has excellent schools for Business. Do you
                        know your current GPA or test scores so I can suggest
                        the best matches?
                      </div>
                    </div>
                  </div>
                  <p className="chat-disclaimer">
                    Our AI is here to guide you, but you can always talk to a
                    human advisor for final verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Updates & Insights Section */}
      <section className="section-insights" id="events">
        <div className="insights-bg-abstract">
          <svg
            viewBox="0 0 1400 1000"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              <pattern
                id="denseGrid"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="var(--primary-orange)"
                  strokeWidth="0.5"
                  opacity="0.1"
                />
              </pattern>
              <linearGradient
                id="deepBlueGlow"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#004089" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#004089" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient
                id="orangeSurge"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ff863c" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#ff863c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff863c" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Layer 1: Skewed Cyber Grid */}
            <rect
              width="1800"
              height="1400"
              fill="url(#denseGrid)"
              opacity="0.4"
              transform="rotate(-15 -200 -200)"
            />
            {/* Layer 2: Massive Swish Curves (FAQ Density) */}
            <path
              d="M-200,600 C 200,900 800,200 1600,700"
              fill="none"
              stroke="url(#orangeSurge)"
              strokeWidth="50"
              strokeLinecap="round"
              opacity="0.2"
              filter="blur(20px)"
            />{" "}
            {/* Blur for depth, heavy stroke */}
            <path
              d="M-100,300 Q 600,800 1300,100"
              fill="none"
              stroke="url(#orangeSurge)"
              strokeWidth="30"
              strokeLinecap="round"
              opacity="0.25"
            />
            <path
              d="M0,900 Q 700,200 1500,800"
              fill="none"
              stroke="#004089"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.2"
            />
            {/* Layer 3: Tech Node Network (Floating Data) */}
            {[...Array(15)].map((_, i) => (
              <g key={`node-${i}`} opacity={Math.random() * 0.5 + 0.3}>
                <circle
                  cx={Math.random() * 1400}
                  cy={Math.random() * 1000}
                  r={Math.random() * 4 + 2}
                  fill="#ff863c"
                />
                <line
                  x1={Math.random() * 1400}
                  y1={Math.random() * 1000}
                  x2={Math.random() * 1400}
                  y2={Math.random() * 1000}
                  stroke="#004089"
                  strokeWidth="1"
                  opacity="0.2"
                />
              </g>
            ))}
            {/* Layer 4: Focal Energy Points */}
            <circle cx="1200" cy="800" r="300" fill="url(#deepBlueGlow)" />
            <circle cx="200" cy="200" r="250" fill="url(#deepBlueGlow)" />
            {/* Layer 5: Data Stream Lines */}
            <path
              d="M0,400 H1400"
              stroke="#ff863c"
              strokeWidth="1"
              strokeDasharray="10 30"
              opacity="0.4"
            />
            <path
              d="M0,420 H1400"
              stroke="#004089"
              strokeWidth="1"
              strokeDasharray="5 15"
              opacity="0.4"
            />
          </svg>
        </div>

        <div className="insights-content">
          <div className="container">
            <div
              className="insights-header"
              style={{ marginBottom: "60px", textAlign: "center" }}
            >
              <h2 className="section-title">
                Updates & <span className="text-gradient">Insights.</span>
              </h2>
              <p className="section-subtitle" style={{ margin: "0 auto" }}>
                Real-time opportunities, essential notices, and global academic
                news.
              </p>
            </div>
          </div>
        </div>

        <div className="pinned-full-width">
          {importantEvents.length > 0 && (
            <Swiper
              modules={[Autoplay, Pagination]}
              className="insights-hero-swiper"
              slidesPerView={1}
              loop={importantEvents.length > 1}
              speed={700}
              autoplay={
                importantEvents.length > 1
                  ? {
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                  : false
              }
              pagination={importantEvents.length > 1 ? { clickable: true } : false}
            >
              {importantEvents.map((importantEvent) => (
                <SwiperSlide key={importantEvent.id}>
                  <div className="cinematic-strip">
                    <div className="cinematic-bg">
                      <img
                        src={importantEvent.image || heroBg}
                        alt={importantEvent.title}
                        onError={(e) => {
                          e.target.src = heroBg;
                          e.target.onerror = null;
                        }}
                      />
                      <div className="cinematic-overlay"></div>
                    </div>

                    <div className="cinematic-content">
                      <div className="hero-badge-row">
                        <span className="hero-badge-pill">{importantEvent.category || "IMPORTANT"}</span>
                        {isExpiredUpdate(importantEvent) && (
                          <span className="hero-badge-pill hero-badge-expired">
                            Event Expired
                          </span>
                        )}
                      </div>
                      <h1 className="hero-title-large">{importantEvent.title}</h1>
                      <p className="hero-desc" dangerouslySetInnerHTML={renderExcerpt(importantEvent.excerpt)} />
                      {(importantEvent.ctaLink || importantEvent.ctaText) && (
                        <PublicCtaLink
                          to={importantEvent.ctaLink}
                          fallbackTo="/free-consultation"
                          className="hero-cta-btn"
                        >
                          {importantEvent.ctaText || "Learn More"}{" "}
                          <iconify-icon icon="ri:arrow-right-line"></iconify-icon>
                        </PublicCtaLink>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {stdEvents.length > 0 && (
          <div className="container">
            <div className="insights-grid">
              {stdEvents.map((item, idx) => (
                <div
                  key={item.id}
                  className="insight-card anim-hidden anim-pop"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <span className="insight-badge badge-admission">
                    {item.category || 'EVENT'}
                  </span>
                  <h3 className="insight-title">{item.title}</h3>
                  <p className="insight-desc" dangerouslySetInnerHTML={renderExcerpt(item.excerpt)} />
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="insight-footer">
                    <span
                      style={{
                        fontSize: "12px",
                        opacity: 0.6,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <iconify-icon icon="ri:time-line"></iconify-icon>{" "}
                      {item.date}
                    </span>
                    {(item.ctaLink || item.ctaText) && (
                      <PublicCtaLink
                        to={item.ctaLink}
                        fallbackTo="/free-consultation"
                        className="btn-insight"
                      >
                        {item.ctaText || 'Details'}{" "}
                        <iconify-icon icon="ri:arrow-right-line"></iconify-icon>
                      </PublicCtaLink>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* NEW: Why Choose / Analysis Section (Stair Layout) */}
      {/* Why Choose MATSOLS Section (Redesigned Stair Layout) */}
      <section className="why-matsols-section" ref={whyChooseRef}>
        <div className="blueprint-bg-container">
          <svg
            viewBox="0 0 1400 1000"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              <pattern
                id="whyMatsolsGrid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.5"
                />
              </pattern>
              <linearGradient
                id="whyMatsolsOrangeGlow"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.4"
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>
            <rect width="1400" height="1000" fill="url(#whyMatsolsGrid)" />

            {/* Aggressive Organic Background Elements */}
            <path
              d="M1200,100 Q1400,300 1100,500 T900,900"
              fill="none"
              stroke="var(--primary-orange)"
              strokeWidth="40"
              strokeLinecap="round"
              opacity="0.15"
            />
            <path
              d="M-100,200 Q300,400 100,700 T500,1000"
              fill="none"
              stroke="var(--primary-orange)"
              strokeWidth="30"
              strokeLinecap="round"
              opacity="0.1"
            />

            {/* Complex Intersecting Schematic Lines */}
            <path
              d="M0,400 L1400,600"
              stroke="var(--primary-orange)"
              strokeWidth="8"
              opacity="0.2"
              strokeDasharray="20 40"
            />
            <path
              d="M-100,600 C 400,400 600,800 1500,500"
              stroke="var(--primary-orange)"
              strokeWidth="15"
              fill="none"
              opacity="0.15"
            />

            {/* Technical Detail Nodes */}
            {[...Array(5)].map((_, i) => (
              <circle
                key={`node-${i}`}
                cx={300 + i * 250}
                cy={200 + (i % 2) * 600}
                r="4"
                fill="var(--primary-orange)"
                opacity="0.4"
              />
            ))}

            {/* Floating Technical Nodes */}
            <rect
              x="1100"
              y="700"
              width="160"
              height="160"
              rx="30"
              stroke="var(--primary-orange)"
              strokeWidth="4"
              fill="none"
              opacity="0.1"
              transform="rotate(15 1180 780)"
            />

            {/* Focal Glow */}
            <circle
              cx="1250"
              cy="200"
              r="220"
              fill="url(#whyMatsolsOrangeGlow)"
            />
          </svg>
        </div>
        <div className="why-matsols-bg-circle"></div>
        <div className="why-matsols-container">
          <div className="why-matsols-content">
            {/* Left Column - Text Content */}
            <div className="why-matsols-left anim-hidden anim-left">
              <div className="why-matsols-header">
                <h2 className="why-matsols-title">
                  Why Choose <span className="text-gradient">MATSOLS?</span>
                </h2>
                <p className="why-matsols-subtitle">
                  We don't just find you a university—we design a career
                  pathway. The principles that drive our excellence and
                  innovation ensure your success every step of the way.
                </p>
                <Link
                  to="/register"
                  className="btn btn-primary anim-hidden anim-up delay-300"
                  style={{ marginTop: "30px", alignSelf: "flex-start" }}
                >
                  Start Your Journey
                </Link>
              </div>
            </div>

            {/* Right Side - 3 Column Stair Layout */}
            <div className="why-matsols-right">
              <div className="why-matsols-stair-layout">
                {/* Column 1 */}
                <div
                  ref={col1Ref}
                  className="why-matsols-column why-matsols-column-1"
                >
                  {[
                    {
                      title: "Personalized Strategy",
                      desc: "Tailored career roadmaps, not just university lists.",
                      image: path1,
                      cat: "STRATEGY",
                    },
                    {
                      title: "Global Network",
                      desc: "Direct partnerships with 70+ top-tier universities.",
                      image: story1,
                      cat: "NETWORK",
                    },
                  ].map((card, idx) => (
                    <div
                      key={`c1-${idx}`}
                      className={`why-matsols-card anim-hidden anim-zoom delay-${idx * 200}`}
                    >
                      <div
                        className="why-matsols-card-bg"
                        style={{ backgroundImage: `url(${card.image})` }}
                      />
                      <div className="why-matsols-card-overlay" />
                      <div className="why-matsols-card-content">
                        <span className="why-matsols-card-category">
                          {card.cat}
                        </span>
                        <h3 className="why-matsols-card-title">{card.title}</h3>
                        <p className="why-matsols-card-description">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 2 */}
                <div
                  ref={col2Ref}
                  className="why-matsols-column why-matsols-column-2"
                >
                  {[
                    {
                      title: "End-to-End Support",
                      desc: "From application to accommodation, we handle it all.",
                      image: heroBg,
                      cat: "SUPPORT",
                    },
                    {
                      title: "Scholarship Experts",
                      desc: "Maximized financial aid through expert negotiation.",
                      image: story3,
                      cat: "FUNDING",
                    },
                  ].map((card, idx) => (
                    <div
                      key={`c2-${idx}`}
                      className={`why-matsols-card anim-hidden anim-zoom delay-${(idx + 1) * 200}`}
                    >
                      <div
                        className="why-matsols-card-bg"
                        style={{ backgroundImage: `url(${card.image})` }}
                      />
                      <div className="why-matsols-card-overlay" />
                      <div className="why-matsols-card-content">
                        <span className="why-matsols-card-category">
                          {card.cat}
                        </span>
                        <h3 className="why-matsols-card-title">{card.title}</h3>
                        <p className="why-matsols-card-description">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 3 */}
                <div
                  ref={col3Ref}
                  className="why-matsols-column why-matsols-column-3"
                >
                  {[
                    {
                      title: "Visa Success",
                      desc: "99% visa approval rate with our compliance team.",
                      image: path3,
                      cat: "LEGAL",
                    },
                    {
                      title: "Local Presence",
                      desc: "Offices in 5 countries for on-ground assistance.",
                      image: supportBg,
                      cat: "GLOBAL",
                    },
                  ].map((card, idx) => (
                    <div
                      key={`c3-${idx}`}
                      className={`why-matsols-card anim-hidden anim-zoom delay-${(idx + 2) * 200}`}
                    >
                      <div
                        className="why-matsols-card-bg"
                        style={{ backgroundImage: `url(${card.image})` }}
                      />
                      <div className="why-matsols-card-overlay" />
                      <div className="why-matsols-card-content">
                        <span className="why-matsols-card-category">
                          {card.cat}
                        </span>
                        <h3 className="why-matsols-card-title">{card.title}</h3>
                        <p className="why-matsols-card-description">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section - High Fidelity Schematic Restoration */}
      <section className="section-impact-new">
        <div className="blueprint-bg-container">
          <svg
            viewBox="0 0 1400 1000"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              <pattern
                id="impactGrid"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 80 0 L 0 0 0 80"
                  fill="none"
                  stroke="rgba(0, 64, 137, 0.08)"
                  strokeWidth="0.5"
                />
              </pattern>
              <linearGradient
                id="impactOrangeGlow"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>
            <rect width="1400" height="1000" fill="url(#impactGrid)" />

            {/* Aggressive Schematic Detail Loops - Dense & Complex */}
            <circle
              cx="700"
              cy="100"
              r="300"
              stroke="rgba(0, 64, 137, 0.1)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="10 5"
            />
            <circle
              cx="700"
              cy="100"
              r="280"
              stroke="rgba(255, 115, 36, 0.15)"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <circle
              cx="700"
              cy="100"
              r="250"
              stroke="rgba(0, 64, 137, 0.08)"
              strokeWidth="0.5"
              fill="none"
            />

            {/* Complex Intersecting Curvature */}
            <path
              d="M-100,500 C 200,300 1200,700 1500,400"
              stroke="rgba(0, 64, 137, 0.15)"
              strokeWidth="10"
              fill="none"
              opacity="0.2"
            />
            <path
              d="M0,200 L1400,800"
              stroke="var(--primary-orange)"
              strokeWidth="2"
              opacity="0.2"
              strokeDasharray="5 15"
            />

            {/* Ruler & Measure Markings */}
            {[...Array(12)].map((_, i) => (
              <line
                key={`ruler-${i}`}
                x1={40}
                y1={100 + i * 80}
                x2={60}
                y2={100 + i * 80}
                stroke="rgba(0, 64, 137, 0.4)"
                strokeWidth="1"
              />
            ))}
            <text
              x="70"
              y="115"
              fontSize="12"
              fill="rgba(0, 64, 137, 0.3)"
              fontFamily="monospace"
            >
              REF_MOD_01
            </text>

            {/* Technical Detail Elements */}
            {[...Array(8)].map((_, i) => (
              <rect
                key={`tech-node-${i}`}
                x={100 + i * 180}
                y={900}
                width="8"
                height="8"
                fill="var(--primary-orange)"
                opacity="0.3"
                transform={`rotate(${i * 45} ${104 + i * 180} 904)`}
              />
            ))}

            {/* Diagonal Hatch Patterns */}
            <path
              d="M1200,400 L1400,600 M1220,400 L1400,580 M1240,400 L1400,560"
              stroke="rgba(255, 115, 36, 0.1)"
              strokeWidth="0.5"
            />
            <path
              d="M0,800 L200,1000 M0,820 L180,1000 M0,840 L160,1000"
              stroke="rgba(255, 115, 36, 0.1)"
              strokeWidth="0.5"
            />

            {/* Glow Focal Points */}
            <circle cx="200" cy="800" r="180" fill="url(#impactOrangeGlow)" />
          </svg>
        </div>

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div
            className="impact-header-new anim-hidden anim-up"
            style={{ marginBottom: "60px", textAlign: "left" }}
          >
            <h2
              className="section-title"
              style={{
                color: "#0f172a",
                fontSize: "3.5rem",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Our Global{" "}
              <span className="text-gradient">Impact in Numbers</span>
            </h2>
            <p
              className="section-subtitle"
              style={{
                textAlign: "left",
                marginLeft: "0",
                color: "#64748b",
                fontSize: "1.2rem",
                maxWidth: "600px",
              }}
            >
              Quantifying our commitment to international student success
              worldwide.
            </p>
          </div>

          <div
            className="impact-main-card anim-hidden anim-zoom"
            style={{
              background: "#0f172a",
              padding: "80px",
              borderRadius: "60px",
              boxShadow: "0 40px 100px rgba(15, 23, 42, 0.2)",
            }}
          >
            <div
              className="impact-grid-new"
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "80px",
              }}
            >
              <div
                className="impact-col-left"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "60px",
                }}
              >
                {[
                  {
                    num: "50,000+",
                    title: "Students Successfully Placed",
                    desc: "Over 50,000 students worldwide have benefited from MATSOLS guidance, progressing through our pathways to top universities abroad.",
                  },
                  {
                    num: "120+",
                    title: "Nationalities Represented Annually",
                    desc: "Students from over 120 countries join our programs each year, creating a diverse global learning environment.",
                  },
                  {
                    num: "70+",
                    title: "University Partners Worldwide",
                    desc: "We collaborate with more than 70 trusted university partners, including 21 in the QS World Top 200.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`impact-item-new anim-hidden anim-left delay-${idx * 200}`}
                  >
                    <div
                      className="impact-num"
                      style={{
                        fontSize: "3.5rem",
                        fontWeight: 800,
                        color: "var(--primary-orange)",
                        marginBottom: "10px",
                      }}
                    >
                      {item.num}
                    </div>
                    <div
                      className="impact-title"
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: "white",
                        marginBottom: "12px",
                      }}
                    >
                      {item.title}
                    </div>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.6,
                        fontSize: "1rem",
                        margin: 0,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div
                className="impact-col-right"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "60px",
                }}
              >
                {[
                  {
                    num: "135+",
                    title: "Study Centres Across 40+ Countries",
                    desc: "Our international network ensures students have access to consistent, high-quality guidance wherever they are.",
                  },
                  {
                    num: "89%",
                    title: "Achieve a 2:1 or Higher",
                    desc: "An impressive 89% of our students achieve strong academic performance globally.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`impact-item-new anim-hidden anim-right delay-${(idx + 1) * 200}`}
                  >
                    <div
                      className="impact-num"
                      style={{
                        fontSize: "3.5rem",
                        fontWeight: 800,
                        color: "var(--primary-orange)",
                        marginBottom: "10px",
                      }}
                    >
                      {item.num}
                    </div>
                    <div
                      className="impact-title"
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: "white",
                        marginBottom: "12px",
                      }}
                    >
                      {item.title}
                    </div>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.6,
                        fontSize: "1rem",
                        margin: 0,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Path Section */}
      <section className="section-path" ref={pathRef}>
        <div className="zigzag-svg-container">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1400 1500"
            preserveAspectRatio="none"
          >
            <path
              className="zigzag-path"
              d="M -100 0 L 1500 500 L -100 1000 L 1510 1510"
            />
          </svg>
        </div>

        <div className="path-container">
          <div className="path-header">
            <h2>Your path into global universities</h2>
            <p>
              We've helped 50,000+ international students get into university.
            </p>
          </div>

          <div className="path-steps">
            <div className="path-step">
              <div className="step-image-wrap">
                <img
                  src={path1}
                  alt="Choose your pathway"
                  className="step-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="step-content">
                <span className="step-num">Step 1</span>
                <h3 className="step-title">Personalized Strategy</h3>
                <p className="step-desc">
                  We design study plans that align with your long-term goals.
                  Whether you want to study in the UK, Malta, or Turkey, our
                  experts ensure you choose the best program for your
                  aspirations.
                </p>
                <Link to="/degrees" className="btn-path">
                  Our Programmes <span className="arrow">›</span>
                </Link>
              </div>
            </div>

            <div className="path-step reversed">
              <div className="step-image-wrap">
                <img
                  src={path2}
                  alt="Support with every step"
                  className="step-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="step-content">
                <span className="step-num">Step 2</span>
                <h3 className="step-title">Global Admissions Support</h3>
                <p className="step-desc">
                  Our team specializes in international applications. We provide
                  one-to-one guidance, help strengthen your profile, and ensure
                  you meet global standards for your dream institutions.
                </p>
                <Link to="/what-we-offer" className="btn-path">
                  How we support you <span className="arrow">›</span>
                </Link>
              </div>
            </div>

            <div className="path-step">
              <div className="step-image-wrap">
                <img
                  src={path3}
                  alt="Gain entry"
                  className="step-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="step-content">
                <span className="step-num">Step 3</span>
                <h3 className="step-title">Career-Focused Success</h3>
                <p className="step-desc">
                  We focus on outcomes. From student visa guidance to
                  pre-departure prep, MATSOLS ensures your education becomes a
                  foundation for professional growth and global opportunities.
                </p>
                <Link to="/universities" className="btn-path">
                  Explore universities <span className="arrow">›</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section (Redesigned for Single Row & White Theme) */}
      <section className="section-bento" ref={bentoRef}>
        <div className="bento-abstract-container">
          <svg
            viewBox="0 0 1400 1000"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              <linearGradient
                id="orangeGlow"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.4"
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.05"
                />
              </linearGradient>
              <linearGradient
                id="lineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.3"
                />
                <stop
                  offset="50%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.6"
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.1"
                />
              </linearGradient>
            </defs>

            {/* Aggressive Organic Blobs */}
            <path
              d="M1200,100 Q1400,300 1100,500 T900,900"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="40"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M-100,200 Q300,400 100,700 T500,1000"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="30"
              strokeLinecap="round"
              opacity="0.2"
            />

            {/* Glowing Focal Points */}
            <circle cx="1250" cy="200" r="180" fill="url(#orangeGlow)" />
            <circle cx="150" cy="850" r="220" fill="url(#orangeGlow)" />

            {/* Complex Intersecting Lines */}
            <path
              d="M0,400 L1400,600"
              stroke="var(--primary-orange)"
              strokeWidth="8"
              opacity="0.4"
              strokeDasharray="20 40"
            />
            <path
              d="M-100,600 C 400,400 600,800 1500,500"
              stroke="var(--primary-orange)"
              strokeWidth="15"
              fill="none"
              opacity="0.25"
            />
            <path
              d="M1400,100 C 1000,300 800,0 600,200"
              stroke="var(--primary-orange)"
              strokeWidth="12"
              fill="none"
              opacity="0.2"
            />

            {/* Technical Detail Elements */}
            {[...Array(6)].map((_, i) => (
              <circle
                key={i}
                cx={200 + i * 200}
                cy={100 + (i % 2) * 800}
                r="4"
                fill="var(--primary-orange)"
                opacity="0.5"
              />
            ))}

            {/* Floating High-Voltage Nodes */}
            <rect
              x="1100"
              y="700"
              width="160"
              height="160"
              rx="30"
              stroke="var(--primary-orange)"
              strokeWidth="4"
              fill="none"
              opacity="0.2"
              transform="rotate(15 1180 780)"
            />
            <rect
              x="1120"
              y="720"
              width="120"
              height="120"
              rx="20"
              fill="var(--primary-orange)"
              opacity="0.1"
              transform="rotate(15 1180 780)"
            />
          </svg>
        </div>

        <div className="container">
          <div
            className="bento-header anim-hidden anim-up"
            style={{
              textAlign: "center",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <div className="section-badge center-badge">
              ACADEMIC EXCELLENCE
            </div>
            <h2 className="animate-bento-header">
              Premier Education Consulting
            </h2>
            <p className="animate-bento-header">
              Harnessing a decades-long legacy of academic excellence to
              architect your global future. Our data-driven strategies and elite
              institutional partnerships ensure a seamless transition into the
              world's most prestigious universities.
            </p>
          </div>

          <div className="bento-grid">
            {/* 1. Global Reach */}
            <div className="b-card b-large anim-hidden anim-left">
              <div className="card-main-content">
                <div className="card-top-row">
                  <h3 style={{ fontSize: "1.8rem" }}>Global Reach</h3>
                  <iconify-icon
                    icon="ri:global-line"
                    width="36"
                    className="card-icon-svg"
                  ></iconify-icon>
                </div>
                <p>
                  MATSOLS provides access to top universities abroad and
                  programs across multiple countries, including the UK, Malta,
                  and Turkey. Our international education consultancy ensures
                  that students from all over the world receive expert guidance
                  and support, connecting you to global education opportunities
                  no matter where you are.
                </p>
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "30px",
                    opacity: 0.3,
                  }}
                >
                  <iconify-icon icon="ri:earth-line" width="80"></iconify-icon>
                </div>
              </div>
              <div className="card-hover-content">
                <div className="hover-icon-wrap">
                  <iconify-icon
                    icon="ri:earth-line"
                    width="60"
                    className="hover-icon"
                  ></iconify-icon>
                </div>
                <h3>Expert Guidance</h3>
                <p className="hover-desc">
                  Providing expert on-the-ground support in every major academic
                  hub.
                </p>
              </div>
            </div>

            {/* 2. Success Rate (Circular) */}
            <div className="b-card b-tall anim-hidden anim-right">
              <div className="card-main-content">
                <div className="card-top-row">
                  <h3 style={{ fontSize: "1.8rem" }}>Success Rate</h3>
                  <iconify-icon
                    icon="ri:line-chart-line"
                    width="36"
                    className="card-icon-svg"
                  ></iconify-icon>
                </div>
                <div className="success-circle-container">
                  <svg className="success-circle-svg" viewBox="0 0 100 100">
                    <circle className="circle-bg" cx="50" cy="50" r="45" />
                    <circle
                      className="circle-progress animate-success-circle"
                      cx="50"
                      cy="50"
                      r="45"
                      strokeDasharray="283"
                      strokeDashoffset="283"
                    />
                  </svg>
                  <div className="percentage-text">
                    96%
                    <span>Visa Success</span>
                  </div>
                </div>
                <p style={{ marginTop: "auto" }}>
                  With a proven track record, over 50,000 students have
                  successfully secured admission to world-leading universities
                  through MATSOLS. Our study abroad consultants focus on
                  achieving strong academic outcomes, helping students meet
                  university requirements and maximize their potential for
                  global success.
                </p>
              </div>
              <div className="card-hover-content">
                <div className="hover-icon-wrap">
                  <iconify-icon
                    icon="ri:verified-badge-line"
                    width="60"
                    className="hover-icon"
                  ></iconify-icon>
                </div>
                <h3>Academic Excellence</h3>
                <p className="hover-desc">
                  Focusing on strong academic outcomes and potential
                  maximization.
                </p>
              </div>
            </div>

            {/* 3. Confidential (Small) */}
            <div className="b-card b-small anim-hidden anim-left">
              <div className="card-main-content">
                <div className="card-top-row">
                  <h3 style={{ fontSize: "1.8rem" }}>Confidential</h3>
                  <iconify-icon
                    icon="ri:shield-user-line"
                    width="36"
                    className="card-icon-svg"
                  ></iconify-icon>
                </div>
                <p style={{ marginTop: "20px", fontSize: "1rem" }}>
                  We respect your privacy and provide professional, secure
                  support throughout your education journey. As a trusted
                  education consultancy for international students, MATSOLS
                  ensures that all your personal information, applications, and
                  documentation are handled with full confidentiality and
                  integrity.
                </p>
                <div style={{ marginTop: "auto", opacity: 0.3 }}>
                  <iconify-icon
                    icon="ri:fingerprint-line"
                    width="80"
                  ></iconify-icon>
                </div>
              </div>
              <div className="card-hover-content">
                <div className="hover-icon-wrap">
                  <iconify-icon
                    icon="ri:lock-password-line"
                    width="60"
                    className="hover-icon"
                  ></iconify-icon>
                </div>
                <h3>Total Integrity</h3>
                <p className="hover-desc">
                  Military-grade discretion for all high-profile university
                  placements.
                </p>
              </div>
            </div>

            {/* 4. Tailored Pathways (Wide) */}
            <div className="b-card b-wide anim-hidden anim-right">
              <div className="card-main-content">
                <div className="card-top-row">
                  <h3 style={{ fontSize: "1.8rem" }}>Tailored Pathways</h3>
                  <iconify-icon
                    icon="ri:route-line"
                    width="36"
                    className="card-icon-svg"
                  ></iconify-icon>
                </div>
                <div
                  className="card-progress-track"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    height: "10px",
                    borderRadius: "10px",
                    marginTop: "20px",
                  }}
                >
                  <div
                    className="card-progress-bar animate-pathway-bar"
                    style={{
                      background: "var(--primary-orange)",
                      height: "100%",
                      borderRadius: "10px",
                    }}
                  ></div>
                </div>
                <p style={{ marginTop: "30px" }}>
                  Every student is unique, and so is our guidance. MATSOLS
                  designs personalized education pathways based on your goals,
                  academic background, and career aspirations. From
                  international university applications to student visa
                  guidance, we ensure a step-by-step plan that aligns with your
                  ambitions and opens doors to global study opportunities.
                </p>
              </div>
              <div className="card-hover-content">
                <div className="hover-icon-wrap">
                  <iconify-icon
                    icon="ri:mind-map"
                    width="60"
                    className="hover-icon"
                  ></iconify-icon>
                </div>
                <h3>Future Blueprints</h3>
                <p className="hover-desc">
                  Strategic plans designed to align with your unique ambitions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
      <section className="section-scholarships" id="scholarships">
        <div className="container">
          <div className="scholarship-header animate-entry">
            <div className="section-badge center-badge">CORPORATE ASSET ALLOCATION</div>
            <h2 className="section-title centered">Strategic <span className="text-gradient">Financial Optimization.</span></h2>
            <p className="section-subtitle centered">
              Leveraging global institutional synergies to drive sustainable academic throughput. Our robust financial infrastructure ensures optimized resource distribution across the scholarship lifecycle for maximum stakeholder value.
            </p>
          </div>

          <div className="grant-registry-grid animate-entry">
            {[
              { 
                title: "Academic Excellence Portfolio", 
                location: "Tier-1 Institutional Asset", 
                amount: "98th Percentile Yield", 
                tag: "Q1 2026 Pipeline", 
                icon: "ri:bank-card-line" 
              },
              { 
                title: "Strategic Human Capital Grant", 
                location: "Global Leadership Stream", 
                amount: "Full Asset Coverage", 
                tag: "High-Priority Stream", 
                icon: "ri:briefcase-line" 
              },
              { 
                title: "Innovative R&D Investment", 
                location: "Systemic Knowledge Transfer", 
                amount: "Milestone-Based Fund", 
                tag: "Performance Indexed", 
                icon: "ri:pie-chart-line" 
              }
            ].map((grant, idx) => (
              <div key={idx} className="grant-card luxury-glass">
                <div className="grant-card-glow"></div>
                <div className="grant-icon-wrapper">
                  <iconify-icon icon={grant.icon} width="40"></iconify-icon>
                </div>
                <div className="grant-body">
                  <div className="grant-tag">{grant.tag}</div>
                  <h3>{grant.title}</h3>
                  <p className="grant-location">{grant.location}</p>
                  <div className="grant-footer">
                    <span className="grant-amount">{grant.amount}</span>
                    <a href="#" className="grant-link">Execute Compliance →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="funding-ticker-wrapper animate-entry">
            <div className="funding-ticker">
              <span className="ticker-label">Cumulative Capital Outflow:</span>
              <span className="ticker-value">$12.4M ACV</span>
              <div className="ticker-divider"></div>
              <span className="ticker-label">Key Stakeholders:</span>
              <span className="ticker-value">2,840+</span>
              <div className="ticker-divider"></div>
              <span className="ticker-label">Project Yield Metric:</span>
              <span className="ticker-value">98.2%</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <a href="#" className="btn btn-primary">Initialize Asset Allocation</a>
          </div>
        </div>
      </section>
      */}

      {/* Destinations 3D */}
      <section className="section-dest" ref={destRef}>
        <div className="container">
          <h2
            style={{
              fontSize: "3rem",
              marginBottom: "12px",
              textAlign: "left",
            }}
          >
            Where Will You Excel?
          </h2>
          <p
            className="section-subtitle"
            style={{ marginBottom: "40px", textAlign: "left", marginLeft: "0" }}
          >
            Discover your ideal study destination among the world's leading
            academic hubs.
          </p>
          <div className="cards-row">
            <div className="dest-card anim-hidden anim-left">
              <img alt="UK" src={ukDest} />
              <div className="dest-info">
                <h3>United Kingdom</h3>
                <div className="dest-details">
                  <p>
                    Home to world-leading universities like Oxford, Cambridge,
                    and Imperial College London.
                  </p>
                  <Link
                    to="/universities?country=UK"
                    style={{ color: "var(--primary-orange)", fontWeight: 600 }}
                  >
                    Explore UK →
                  </Link>
                </div>
              </div>
            </div>
            <div className="dest-card anim-hidden anim-up">
              <img alt="Istanbul" src={istanbulDest} />
              <div className="dest-info">
                <h3>Istanbul, Turkey</h3>
                <div className="dest-details">
                  <p>
                    A vibrant bridge between East and West, offering rich
                    cultural heritage and modern academic excellence.
                  </p>
                  <Link
                    to="/universities?country=Turkey"
                    style={{ color: "var(--primary-orange)", fontWeight: 600 }}
                  >
                    Explore Istanbul →
                  </Link>
                </div>
              </div>
            </div>
            <div className="dest-card anim-hidden anim-right">
              <img alt="Malta" src={maltaDest} />
              <div className="dest-info">
                <h3>Malta</h3>
                <div className="dest-details">
                  <p>
                    Study in a Mediterranean paradise with high-quality
                    English-taught programs and a booming career landscape.
                  </p>
                  <Link
                    to="/universities?country=Malta"
                    style={{ color: "var(--primary-orange)", fontWeight: 600 }}
                  >
                    Explore Malta →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-stories">
        <div className="container">
          <div className="stories-header animate-entry">
            <h2 className="section-title">
              Success <span className="text-gradient">Stories.</span>
            </h2>
            <p className="section-subtitle">
              Real results from ambitious students who dared to dream bigger.
            </p>
          </div>

          <div className="stories-carousel-wrapper animate-entry">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              loop={false}
              rewind={true}
              pagination={{ clickable: true }}
              autoplay={{ delay: 6000, disableOnInteraction: false }}
              className="stories-carousel"
            >
              {[
                {
                  quote:
                    "Stressed by paperwork and choices, I turned to MATSOLS. They simplified everything, guiding me to SBM Malta for Business. I’m now thriving in a global environment with a clear career path ahead.",
                  name: "Emma L.",
                  uni: "SBM Malta",
                  course: "Business Administration",
                  img: story1,
                },
                {
                  quote:
                    "MATSOLS turned application chaos into a clear strategy. From interview prep to enrollment, they handled it all. I’m now studying IT in the UK, already building projects for my future career.",
                  name: "James K.",
                  uni: "UK University",
                  course: "Information Technology",
                  img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
                },
                {
                  quote:
                    "The cost of studying abroad felt impossible until MATSOLS found my scholarships. They built a financial roadmap that worked. Today, I’m studying Finance in Malta, debt-managed and future-ready.",
                  name: "Sofia R.",
                  uni: "SBM Malta",
                  course: "Finance & Accounting",
                  img: story3,
                },
              ].map((story, idx) => (
                <SwiperSlide key={idx}>
                  <div className="testi-card">
                    <div className="testi-image-side">
                      <div className="testi-image-circle">
                        <img
                          src={story.img}
                          alt={story.name}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="testi-content-side">
                      <p className="testi-quote">{story.quote}</p>
                      <div className="testi-author">
                        <h4>{story.name}</h4>
                        <p>
                          {story.uni} — {story.course}
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-faq">
        <div className="faq-abstract-container">
          <svg
            viewBox="0 0 1400 1000"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              <linearGradient
                id="orangeGlowFaq"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.4"
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.05"
                />
              </linearGradient>
              <linearGradient
                id="lineGradientFaq"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.3"
                />
                <stop
                  offset="50%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.6"
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary-orange)"
                  stopOpacity="0.1"
                />
              </linearGradient>
            </defs>

            {/* Aggressive Organic Blobs */}
            <path
              d="M1200,100 Q1400,300 1100,500 T900,900"
              fill="none"
              stroke="url(#lineGradientFaq)"
              strokeWidth="40"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M-100,200 Q300,400 100,700 T500,1000"
              fill="none"
              stroke="url(#lineGradientFaq)"
              strokeWidth="30"
              strokeLinecap="round"
              opacity="0.2"
            />

            {/* Glowing Focal Points */}
            <circle cx="1250" cy="200" r="180" fill="url(#orangeGlowFaq)" />
            <circle cx="150" cy="850" r="220" fill="url(#orangeGlowFaq)" />

            {/* Complex Intersecting Lines */}
            <path
              d="M0,400 L1400,600"
              stroke="var(--primary-orange)"
              strokeWidth="8"
              opacity="0.4"
              strokeDasharray="20 40"
            />
            <path
              d="M-100,600 C 400,400 600,800 1500,500"
              stroke="var(--primary-orange)"
              strokeWidth="15"
              fill="none"
              opacity="0.25"
            />
            <path
              d="M1400,100 C 1000,300 800,0 600,200"
              stroke="var(--primary-orange)"
              strokeWidth="12"
              fill="none"
              opacity="0.2"
            />

            {/* Technical Detail Elements */}
            {[...Array(6)].map((_, i) => (
              <circle
                key={i}
                cx={200 + i * 200}
                cy={100 + (i % 2) * 800}
                r="4"
                fill="var(--primary-orange)"
                opacity="0.5"
              />
            ))}

            {/* Floating High-Voltage Nodes */}
            <rect
              x="1100"
              y="700"
              width="160"
              height="160"
              rx="30"
              stroke="var(--primary-orange)"
              strokeWidth="4"
              fill="none"
              opacity="0.2"
              transform="rotate(15 1180 780)"
            />
            <rect
              x="1120"
              y="720"
              width="120"
              height="120"
              rx="20"
              fill="var(--primary-orange)"
              opacity="0.1"
              transform="rotate(15 1180 780)"
            />
          </svg>
        </div>

        <div className="container">
          <div className="faq-layout">
            <div className="faq-info">
              <div className="section-badge">SUPPORT</div>
              <h2 className="section-title">
                Common <span className="text-gradient">Questions.</span>
              </h2>
              <p className="section-subtitle">
                Everything you need to know about the elite education route.
              </p>
              <div className="faq-image-box">
                <img
                  src={path3}
                  alt="Consultation"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="faq-list">
              {[
                {
                  q: "How does the AI matching engine work?",
                  a: "Our engine uses machine learning to correlate your academic history, budget, and career goals with data from over 1,800 global universities to find the highest probability of success.",
                },
                {
                  q: "What is the typical timeline for an application?",
                  a: "For top-tier universities, we recommend starting at least 12 months in advance. However, our rapid-track service can handle urgent applications in under 3 months.",
                },
                {
                  q: "Do you assist with scholarship applications?",
                  a: "Yes, scholarship optimization is a core part of our service. We identify exclusive funding which often goes unadvertised to the general public.",
                },
                {
                  q: "What is your visa success rate?",
                  a: "We maintain a 98.4% visa success rate across UK, USA, Canada, and Australia through rigorous pre-submission audits and interview coaching.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`faq-item ${faqActive === idx ? "active" : ""}`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onClick={() => setFaqActive(faqActive === idx ? null : idx)}
                >
                  <div className="faq-question">
                    <span>{item.q}</span>
                    <iconify-icon
                      icon={
                        faqActive === idx ? "line-md:minus" : "line-md:plus"
                      }
                      width="24"
                    ></iconify-icon>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-content">
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Sticky - Extreme Overhaul */}
      <section
        className="section-process"
        ref={processRef}
        style={{ position: "relative" }}
      >
        <div
          className="process-bg-abstract"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {/* Cinematic Asset BG */}
          <img
            src={blueprintBg}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.15,
              filter: "grayscale(100%) brightness(0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 70% 50%, rgba(4, 16, 33, 0) 0%, rgba(4, 16, 33, 0.9) 100%)",
            }}
          ></div>

          <svg
            viewBox="0 0 1400 1000"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 1,
            }}
          >
            <defs>
              <pattern
                id="engineerGrid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="0.5"
                  opacity="0.1"
                />
              </pattern>
              <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <rect width="1400" height="1000" fill="url(#engineerGrid)" />

            {/* Center Concentric Hub */}
            <circle
              cx="700"
              cy="500"
              r="480"
              stroke="#06b6d4"
              strokeWidth="1"
              fill="none"
              opacity="0.05"
            />
            <circle
              cx="700"
              cy="500"
              r="400"
              stroke="#06b6d4"
              strokeWidth="0.5"
              fill="none"
              opacity="0.1"
              strokeDasharray="5,5"
            />
            <circle
              cx="700"
              cy="500"
              r="320"
              stroke="#06b6d4"
              strokeWidth="2"
              fill="none"
              opacity="0.15"
            />
            <circle
              cx="700"
              cy="500"
              r="150"
              stroke="#06b6d4"
              strokeWidth="1"
              fill="none"
              opacity="0.2"
            />

            {/* Radial Technical Markers */}
            {[...Array(24)].map((_, i) => (
              <line
                key={`radial-${i}`}
                x1="700"
                y1="500"
                x2={700 + Math.cos((i * 15 * Math.PI) / 180) * 1000}
                y2={500 + Math.sin((i * 15 * Math.PI) / 180) * 1000}
                stroke="#06b6d4"
                strokeWidth="0.5"
                opacity="0.05"
              />
            ))}

            {/* Corner Accents */}
            <path
              d="M40,40 L180,40 M40,40 L40,180"
              stroke="#06b6d4"
              strokeWidth="2"
              opacity="0.4"
              fill="none"
            />
            <path
              d="M1360,40 L1220,40 M1360,40 L1360,180"
              stroke="#06b6d4"
              strokeWidth="2"
              opacity="0.4"
              fill="none"
            />
            <path
              d="M40,960 L180,960 M40,960 L40,820"
              stroke="#06b6d4"
              strokeWidth="2"
              opacity="0.4"
              fill="none"
            />
            <path
              d="M1360,960 L1220,960 M1360,960 L1360,820"
              stroke="#06b6d4"
              strokeWidth="2"
              opacity="0.4"
              fill="none"
            />

            {/* Data Points */}
            <circle cx="200" cy="200" r="3" fill="#06b6d4" opacity="0.6" />
            <text
              x="210"
              y="205"
              fill="#06b6d4"
              fontSize="10"
              fontFamily="monospace"
              opacity="0.4"
            >
              NODE_ALPHA_01
            </text>
            <circle cx="1200" cy="800" r="3" fill="#06b6d4" opacity="0.6" />
            <text
              x="1210"
              y="805"
              fill="#06b6d4"
              fontSize="10"
              fontFamily="monospace"
              opacity="0.4"
            >
              SYNC_COMPLETE
            </text>

            {/* Ruler Markings */}
            {[...Array(30)].map((_, i) => (
              <line
                key={`v-rule-${i}`}
                x1={40}
                y1={50 + i * 30}
                x2={55}
                y2={50 + i * 30}
                stroke="#06b6d4"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
          </svg>
        </div>

        <div className="process-layout">
          <div className="sticky-col">
            <h2 className="process-header">
              The
              <br />
              Blueprint
            </h2>

            <div className="steps-nav">
              <div className="step-item active" data-step="1">
                <div className="step-dot"></div>
                <span>01. Strategy</span>
              </div>
              <div className="step-item" data-step="2">
                <div className="step-dot"></div>
                <span>02. Matching</span>
              </div>
              <div className="step-item" data-step="3">
                <div className="step-dot"></div>
                <span>03. Engineering</span>
              </div>
              <div className="step-item" data-step="4">
                <div className="step-dot"></div>
                <span>04. Integration</span>
              </div>
            </div>
          </div>

          <div className="process-content">
            {[
              {
                id: 1,
                title: "Strategic Blueprint",
                desc: "A comprehensive audit of your academic profile to identify high-potential opportunities and mitigate risks before they arise.",
                icon: "ri:focus-3-line",
                step: "01",
              },
              {
                id: 2,
                title: "Institutional Match",
                desc: "Correlating your trajectory with data from 1,850+ global institutions to find the intersection of prestige and acceptance probability.",
                icon: "ri:user-search-line",
                step: "02",
              },
              {
                id: 3,
                title: "Fidelity Audit",
                desc: "Every SOP and recommendation is refined for maximum institutional impact, ensuring documentation meets elite standards.",
                icon: "ri:article-line",
                step: "03",
              },
              {
                id: 4,
                title: "Success Integration",
                desc: "From final submission to pre-departure protocols, we ensure a seamless transition into your global education journey.",
                icon: "ri:send-plane-fill",
                step: "04",
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`blueprint-card ${i === 0 ? "active" : ""}`}
                data-step={step.id}
              >
                <div className="card-inner">
                  <div className="card-header-clean">
                    <span className="step-label">Step {step.step}</span>
                    <div className="p-icon-box">
                      <iconify-icon icon={step.icon} width="40"></iconify-icon>
                    </div>
                  </div>
                  <div className="p-details">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Magnet */}
      <div className="container">
        <section className="magnet-section">
          <div className="magnet-box">
            <div className="magnet-left">
              <img
                src={supportBg}
                loading="lazy"
                decoding="async"
                className="magnet-bg-image"
                alt="Support Team"
              />
              <div className="magnet-overlay"></div>
              <div className="magnet-content">
                <h2 className="magnet-title">
                  Begin Your Elite Education Journey
                </h2>
                <p className="magnet-desc">
                  Schedule a confidential strategy session with our senior
                  consultants to unlock exclusive university pathways and
                  scholarship opportunities.
                </p>
                <ul className="magnet-list">
                  <li>
                    <iconify-icon
                      icon="line-md:confirm"
                      width="20"
                    ></iconify-icon>{" "}
                    Exclusive Partner Network Access
                  </li>
                  <li>
                    <iconify-icon
                      icon="line-md:confirm"
                      width="20"
                    ></iconify-icon>{" "}
                    Strategic Scholarship Optimization
                  </li>
                  <li>
                    <iconify-icon
                      icon="line-md:confirm"
                      width="20"
                    ></iconify-icon>{" "}
                    Bespoke Academic Roadmapping
                  </li>
                </ul>
              </div>
            </div>
            <form className="magnet-form-wrap" onSubmit={handleConsultationSubmit}>
              <h3 className="magnet-form-title">
                Request a Confidential Consultation
              </h3>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="input-field"
                  value={consultForm.fullName}
                  onChange={(e) =>
                    setConsultForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="input-split">
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="input-field"
                    value={consultForm.email}
                    onChange={(e) =>
                      setConsultForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="input-field"
                    value={consultForm.phone}
                    onChange={(e) =>
                      setConsultForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Country of Residence"
                  className="input-field"
                  value={consultForm.country}
                  onChange={(e) =>
                    setConsultForm((prev) => ({ ...prev, country: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Degree or Program of Interest"
                  className="input-field"
                  value={consultForm.programInterest}
                  onChange={(e) =>
                    setConsultForm((prev) => ({ ...prev, programInterest: e.target.value }))
                  }
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary magnet-btn">
                Schedule My Session
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
