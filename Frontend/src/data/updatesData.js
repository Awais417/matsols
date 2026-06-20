import titan1 from "../assets/images/path-1.webp";
import titan2 from "../assets/images/path-2.webp";

export const initialUpdates = {
  hero: [
    {
      id: 1,
      badge: "Important",
      title: "Spring 2026 Enrollment",
      subtitle: "Applications Open Now",
      desc: "Priority admissions for UK & Malta are live. Secure your scholarship eligibility before the Q3 deadline.",
      cta: "Begin Assessment",
      image: titan1,
    },
    {
      id: 2,
      badge: "Important",
      title: "The Elite Grant 2026",
      subtitle: "100% Tuition Coverage",
      desc: "Finalize your research portfolio by Feb 15th to satisfy the new STEM requirements for top-tier funding.",
      cta: "Apply for Grant",
      image: titan2,
    }
  ],
  grid: [
    {
      id: 3,
      badge: "Scholarship",
      class: "badge-scholarship",
      title: "Global Excellence Grant",
      desc: "New $10,000 grants available for high-achieving STEM students applying to top-tier UK research institutions.",
      date: "Ends Mar 15",
      icon: "ri:medal-line",
    },
    {
      id: 4,
      badge: "Event",
      class: "badge-event",
      title: "Virtual Admissions Fair",
      desc: "Connect directly with 20+ university representatives from Australia and Canada in our exclusive live webinar series.",
      date: "Jan 30, 2026",
      icon: "ri:calendar-event-line",
    },
    {
      id: 5,
      badge: "Admission",
      class: "badge-admission",
      title: "Malta Study Pathway",
      desc: "Explore accelerated Business and IT programs with integrated internship placements in Malta's growing tech hub.",
      date: "Q2 Intake",
      icon: "ri:user-star-line",
    }
  ]
};
