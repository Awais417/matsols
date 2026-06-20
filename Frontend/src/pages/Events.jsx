import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PublicCtaLink from "../components/PublicCtaLink";
import { apiService } from "../services/api";
import heroBg from "../assets/images/hero-bg.webp";
import "./Events.css";

const Events = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      const data = await apiService.getUpdates({ publishedOnly: true });
      setUpdates(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchUpdates();
  }, []);

  const now = new Date();
  const isExpired = (item) =>
    Boolean(item?.expiryDate && new Date(item.expiryDate) <= now);
  const { featuredEvents, allEvents } = useMemo(() => {
    const safe = Array.isArray(updates) ? updates : [];
    const featured = safe.filter((item) => item.isImportant);
    const regular = safe.filter((item) => !item.isImportant);
    return { featuredEvents: featured, allEvents: regular };
  }, [updates]);
  const renderExcerpt = (value) => ({ __html: value || "" });

  if (loading) {
    return (
      <div className="events-page">
        <Header />
        <div className="events-loading">
          <div className="fuckin-loader"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="events-page">
      <Header />

      <section className="events-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="events-hero__overlay"></div>
        <div className="events-container">
          <div className="events-hero__content">
            <span className="events-hero__badge">Events & Insights</span>
            <h1>Join Our Live Events & Updates</h1>
            <p>
              Discover upcoming webinars, admissions sessions, and scholarship
              briefings. Stay updated with what’s happening at MATSOLS.
            </p>
            <PublicCtaLink to="/free-consultation" className="btn btn-primary events-hero__cta">
              Book Free Consultation
            </PublicCtaLink>
          </div>
        </div>
      </section>

      <section className="events-section">
        <div className="events-container">
          <div className="events-header">
            <h2>Featured Events</h2>
            <p>Priority updates and hero announcements.</p>
          </div>
          {featuredEvents.length === 0 ? (
            <div className="events-empty">No featured events yet.</div>
          ) : (
            <div className="events-featured-grid">
              {featuredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`events-featured-card ${isExpired(event) ? "is-expired" : ""}`}
                  style={{ backgroundImage: `url(${event.image || heroBg})` }}
                >
                  <div className="events-featured__overlay"></div>
                  <div className="events-featured__content">
                    <div className="events-badges">
                      <span className="events-badge">{event.category || "Event"}</span>
                      {isExpired(event) && (
                        <span className="events-badge expired">Event Expired</span>
                      )}
                    </div>
                    <h3>{event.title}</h3>
                    <p dangerouslySetInnerHTML={renderExcerpt(event.excerpt)} />
                    <PublicCtaLink
                      to={event.ctaLink || "/free-consultation"}
                      fallbackTo="/free-consultation"
                      className="btn btn-primary events-card-cta"
                    >
                      {event.ctaText || "Join Event"}
                    </PublicCtaLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="events-section events-section--alt">
        <div className="events-container">
          <div className="events-header">
            <h2>All Events & Updates</h2>
            <p>Browse every update published from the admin panel.</p>
          </div>
          {allEvents.length === 0 ? (
            <div className="events-empty">No events published yet.</div>
          ) : (
            <div className="events-grid">
              {allEvents.map((event) => (
                <div key={event.id} className="events-card">
                  <div className="events-card__image">
                    <img src={event.image || heroBg} alt={event.title} loading="lazy" />
                  </div>
                  <div className="events-card__body">
                    <div className="events-badges">
                      <span className="events-badge">{event.category || "Event"}</span>
                      {isExpired(event) && (
                        <span className="events-badge expired">Event Expired</span>
                      )}
                    </div>
                    <h3>{event.title}</h3>
                    <p dangerouslySetInnerHTML={renderExcerpt(event.excerpt)} />
                    <div className="events-card__footer">
                      <span className="events-date">{event.date || "Date TBD"}</span>
                      <PublicCtaLink
                        to={event.ctaLink || "/free-consultation"}
                        fallbackTo="/free-consultation"
                        className="events-link"
                      >
                        {event.ctaText || "Learn More"}
                      </PublicCtaLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
