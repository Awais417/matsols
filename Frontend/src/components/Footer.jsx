import { Link } from "react-router-dom";
import { usePublicSettings } from "../context/PublicSettingsContext";

const Footer = () => {
  const { supportEmail, supportPhone, brandName, logoUrl } = usePublicSettings();

  return (
    <footer className="footer">
      <div className="watermark-text">{brandName}</div>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col" style={{ gridColumn: "span 2" }}>
            <div className="footer-logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} style={{ width: "34px", height: "34px", objectFit: "contain" }} />
              ) : null}
              <span>{brandName}</span>
            </div>
            <p>
              Building bridges to global education since 2005. We are the
              architects of your international career.
            </p>
            {(supportEmail || supportPhone) && (
              <div className="footer-contact" style={{ marginTop: "16px" }}>
                {supportEmail && (
                  <a href={`mailto:${supportEmail}`} className="footer-contact-link">
                    {supportEmail}
                  </a>
                )}
                {supportPhone && (
                  <a href={`tel:${supportPhone}`} className="footer-contact-link">
                    {supportPhone}
                  </a>
                )}
              </div>
            )}
            <div className="footer-social">
              <a
                href="https://www.linkedin.com/company/matrix-solutions-international"
                className="social-icon"
                target="_blank"
                rel="noreferrer"
              >
                <iconify-icon icon="line-md:linkedin" width="22" height="22"></iconify-icon>
              </a>
              <a
                href="https://www.facebook.com/matsols"
                className="social-icon"
                target="_blank"
                rel="noreferrer"
              >
                <iconify-icon icon="line-md:facebook" width="22" height="22"></iconify-icon>
              </a>
              <a
                href="https://www.tiktok.com/@matsols"
                className="social-icon"
                target="_blank"
                rel="noreferrer"
              >
                <iconify-icon icon="line-md:tiktok" width="22" height="22"></iconify-icon>
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Destinations</h4>
            <nav className="footer-links">
              <Link to="/universities">Study in UK</Link>
              <Link to="/universities">Study in USA</Link>
              <Link to="/universities">Study in Canada</Link>
              <Link to="/universities">Study in Australia</Link>
            </nav>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <nav className="footer-links">
              <Link to="/what-we-offer/university-admissions">Admissions</Link>
              <Link to="/what-we-offer/visa-support">Visa Support</Link>
              <Link to="/scholarships">Scholarships</Link>
              <Link to="/events">Events</Link>
            </nav>
          </div>
          <div className="footer-col footer-map-desktop">
            <h4>Location</h4>
            <div className="footer-map">
              <iframe
                title="MATSOLS Location"
                src="https://www.google.com/maps?q=21.402804,39.8100307&z=17&hl=en&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
        <div className="footer-map-row footer-map-mobile">
          <div className="footer-map-heading">Location</div>
          <div className="footer-map">
            <iframe
              title="MATSOLS Location"
              src="https://www.google.com/maps?q=21.402804,39.8100307&z=17&hl=en&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        <div className="footer-bottom">
          Copyright © 2026 {brandName}. Built for Excellence.
          <span className="footer-built-by">
            {" "}Certyfy^Me
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
