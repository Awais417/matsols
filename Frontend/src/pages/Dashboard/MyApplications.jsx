import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import "./Dashboard.css";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const data = await apiService.getApplications();
      setApplications(data);
      setLoading(false);
    };
    fetchApps();
  }, []);

  const steps = [
    "Submitted",
    "Documents Verified",
    "Under Review",
    "Offer Decision",
    "Visa Process",
  ];

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading applications...</div>;


  return (
    <div className="my-applications fade-in">
      <div className="section-header">
        <div className="header-badge">
          {applications.length} Active Applications
        </div>
      </div>

      <div className="applications-list">
        {applications.map((app) => (
          <div key={app.id} className="application-card">
            <div className="app-card-header">
              <div className="app-info">
                <img
                  src={app.university?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.university?.name || app.courseName)}&background=random&color=fff`}
                  alt={app.university?.name}
                  className="app-logo"
                />
                <div>
                  <h3 className="app-uni">{app.university?.name || app.courseName}</h3>
                  <p className="app-course">{app.courseName}</p>
                </div>
              </div>
              <div className="app-meta">
                <span className="app-date">Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                <button className="btn-view-details">View Details →</button>
              </div>
            </div>

            <div className="app-tracker">
              <div className="tracker-steps">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`tracker-step ${idx + 1 <= app.step ? "completed" : ""} ${idx + 1 === app.step ? "active" : ""}`}
                  >
                    <div className="step-point">
                      {idx + 1 < app.step ? (
                        <iconify-icon icon="ri:check-line"></iconify-icon>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <div className="step-label">{step}</div>
                  </div>
                ))}
              </div>
              <div className="tracker-line">
                <div
                  className="tracker-progress"
                  style={{
                    width: `${((app.step - 1) / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="application-help">
        <div className="help-icon">
          <iconify-icon icon="ri:customer-service-2-line"></iconify-icon>
        </div>
        <div className="help-text">
          <h4>Need help with your application?</h4>
          <p>
            Contact your assigned consultant for immediate assistance with
            document uploads or requirements.
          </p>
        </div>
        <button className="btn-contact-consultant">Message Consultant</button>
      </div>
    </div>
  );
};

export default MyApplications;
