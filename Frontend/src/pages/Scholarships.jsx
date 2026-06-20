import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PublicCtaLink from "../components/PublicCtaLink";
import { apiService } from "../services/api";
import "../index.css";
import "./Scholarships.css";

const safeParseExtra = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry?.label && entry?.value);
  } catch {
    return [];
  }
};

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getScholarships();
        setScholarships(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load scholarships:", err);
        setError("Could not load scholarships. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const availableCountries = useMemo(() => {
    const countries = scholarships
      .map((item) => item.university?.country)
      .filter(Boolean);
    return ["All", ...Array.from(new Set(countries))];
  }, [scholarships]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scholarships.filter((item) => {
      const matchesQuery =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.university?.name?.toLowerCase().includes(q) ||
        item.degree?.name?.toLowerCase().includes(q) ||
        item.university?.country?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;
      const matchesCountry =
        countryFilter === "All" ||
        item.university?.country === countryFilter;
      return matchesQuery && matchesStatus && matchesCountry;
    });
  }, [scholarships, query, statusFilter, countryFilter]);

  return (
    <div className="scholarships-page">
      <Header />
      <section className="scholarships-hero">
        <div className="scholarships-hero-bg" />
        <div className="container scholarships-hero-content">
          <div className="hero-copy">
            <span className="hero-pill">Scholarships & Funding</span>
            <h1>Find Scholarships That Fit Your Future</h1>
            <p>
              Explore scholarships curated by MATSOLS, linked with our partner
              universities and degree pathways. Filter by country, status, and
              keyword to find the best match.
            </p>
          </div>
          <div className="hero-panel">
            <div className="hero-field">
              <label>Search</label>
              <input
                className="hero-input"
                placeholder="Search by scholarship, university, or degree"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="hero-grid">
              <div className="hero-field">
                <label>Status</label>
                <select
                  className="hero-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {["All", "Active", "Inactive", "Expired"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hero-field">
                <label>Country</label>
                <select
                  className="hero-select"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  {availableCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="scholarships-list">
        <div className="container">
          {loading ? (
            <div className="scholarships-empty">Loading scholarships...</div>
          ) : error ? (
            <div className="scholarships-empty">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="scholarships-empty">
              No scholarships match your filters yet.
            </div>
          ) : (
            <div className="scholarships-grid">
              {filtered.map((item) => {
                const extras = safeParseExtra(item.additionalInfo).slice(0, 4);
                const statusLabel = item.status || "Active";
                const statusClass =
                  statusLabel.toLowerCase() === "active"
                    ? "status-active"
                    : "status-inactive";
                return (
                  <article key={item.id} className="scholarship-card">
                    <div className="scholarship-image">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"
                        }
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className={`status-pill ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="scholarship-body">
                      <h3>{item.title}</h3>
                      <div className="scholarship-meta">
                        {item.amount && <span>{item.amount}</span>}
                        {item.deadline && <span>Deadline: {item.deadline}</span>}
                      </div>
                      {(item.university?.name || item.degree?.name) && (
                        <div className="scholarship-links">
                          {item.university?.name && (
                            <span>
                              {item.university.name}
                              {item.university?.country
                                ? ` · ${item.university.country}`
                                : ""}
                            </span>
                          )}
                          {item.degree?.name && (
                            <span>
                              {item.degree.name}
                              {item.degree?.level ? ` · ${item.degree.level}` : ""}
                            </span>
                          )}
                        </div>
                      )}
                      {item.description && (
                        <p className="scholarship-desc">{item.description}</p>
                      )}
                      {extras.length > 0 && (
                        <ul className="scholarship-extra">
                          {extras.map((entry, idx) => (
                            <li key={`${item.id}-extra-${idx}`}>
                              <strong>{entry.label}:</strong> {entry.value}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="scholarship-actions">
                        {item.ctaLink ? (
                          <PublicCtaLink
                            to={item.ctaLink}
                            fallbackTo="/free-consultation"
                            className="btn btn-primary"
                          >
                            Apply Now
                          </PublicCtaLink>
                        ) : (
                          <PublicCtaLink to="/free-consultation" className="btn btn-primary">
                            Talk to an Advisor
                          </PublicCtaLink>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Scholarships;
