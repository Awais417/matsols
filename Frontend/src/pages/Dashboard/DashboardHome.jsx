import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const DashboardHome = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const summary = await apiService.getDashboardSummary();
      setData(summary);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!banner) return undefined;
    const timer = setTimeout(() => setBanner(""), 2200);
    return () => clearTimeout(timer);
  }, [banner]);

  const userName = user?.fullName || user?.email?.split('@')[0] || "Student";

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  const { stats, latestApp, actions } = data || { stats: { total: 0, inProgress: 0, offers: 0, needed: 0 }, latestApp: null, actions: [] };

  return (
    <div className="dashboard-home">
      {banner && (
        <div style={{ marginBottom: "20px", padding: "12px 16px", borderRadius: "14px", background: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a", boxShadow: "0 12px 28px rgba(15,23,42,0.08)", fontWeight: 600 }}>
          {banner}
        </div>
      )}
      <div className="dash-welcome">
        <h2 className="welcome-title">Welcome back, {userName}! 👋</h2>
        <p className="welcome-subtitle">Here's what's happening with your applications today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="label">Total Applications</span>
            <span className="value">{stats.total}</span>
          </div>
          <div className="stat-icon blue">
            <iconify-icon icon="ri:file-list-3-fill"></iconify-icon>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="label">In Progress</span>
            <span className="value">{stats.inProgress}</span>
          </div>
          <div className="stat-icon orange">
            <iconify-icon icon="ri:time-fill"></iconify-icon>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="label">Offers Received</span>
            <span className="value">{stats.offers}</span>
          </div>
          <div className="stat-icon green">
            <iconify-icon icon="ri:checkbox-circle-fill"></iconify-icon>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="label">Documents Needed</span>
            <span className="value">{stats.needed}</span>
          </div>
          <div className="stat-icon purple">
            <iconify-icon icon="ri:alert-fill"></iconify-icon>
          </div>
        </div>
      </div>

      {/* Application Tracker - Highlight */}
      {latestApp && (
        <section className="tracker-section">
          <div className="section-header">
            <h3>Application Status: {latestApp.university?.name || latestApp.courseName}</h3>
            <Link to="/dashboard/applications" className="btn-sm">View Details &rarr;</Link>
          </div>

          <div className="app-tracker">
            <div className="steps-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((latestApp.step - 1) / 4) * 100}%` }}></div>
              </div>

              <div className={`step-item ${latestApp.step > 1 ? 'completed' : latestApp.step === 1 ? 'current' : ''}`}>
                <div className="step-circle">{latestApp.step > 1 ? <iconify-icon icon="ri:check-line"></iconify-icon> : 1}</div>
                <span className="step-label">Submitted</span>
              </div>
              <div className={`step-item ${latestApp.step > 2 ? 'completed' : latestApp.step === 2 ? 'current' : ''}`}>
                <div className="step-circle">{latestApp.step > 2 ? <iconify-icon icon="ri:check-line"></iconify-icon> : 2}</div>
                <span className="step-label">Documents Verified</span>
              </div>
              <div className={`step-item ${latestApp.step > 3 ? 'completed' : latestApp.step === 3 ? 'current' : ''}`}>
                <div className="step-circle">{latestApp.step > 3 ? <iconify-icon icon="ri:check-line"></iconify-icon> : 3}</div>
                <span className="step-label">Under Review</span>
              </div>
              <div className={`step-item ${latestApp.step > 4 ? 'completed' : latestApp.step === 4 ? 'current' : ''}`}>
                <div className="step-circle">{latestApp.step > 4 ? <iconify-icon icon="ri:check-line"></iconify-icon> : 4}</div>
                <span className="step-label">Offer Decision</span>
              </div>
              <div className={`step-item ${latestApp.step > 5 ? 'completed' : latestApp.step === 5 ? 'current' : ''}`}>
                <div className="step-circle">{latestApp.step > 5 ? <iconify-icon icon="ri:check-line"></iconify-icon> : 5}</div>
                <span className="step-label">Visa Process</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid: Action Items & Documents */}
      <div className="dashboard-grid">
        {/* Todo List */}
        <div className="card">
          <div className="card-header">
            <h4>Action Items</h4>
          </div>
          <div className="todo-list">
            {actions.length > 0 ? actions.map(action => (
              <div key={action.id} className="todo-item">
                <div className={`todo-check ${action.isCompleted ? 'checked' : ''}`}>
                  {action.isCompleted && <iconify-icon icon="ri:check-line"></iconify-icon>}
                </div>
                <div className="todo-content">
                  <div className="todo-title" style={action.isCompleted ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>
                    {action.title}
                  </div>
                  <div className="todo-desc">{action.description}</div>
                </div>
                {!action.isCompleted && (
                  <div
                    className="todo-action"
                    onClick={() => action.link ? window.location.href = action.link : setBanner("Action required")}
                  >
                    {action.type === 'upload' ? 'Upload' : 'Complete'}
                  </div>
                )}
              </div>
            )) : (
              <div style={{ padding: '20px', opacity: 0.5, textAlign: 'center' }}>All caught up!</div>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="card">
          <div className="card-header">
            <h4>Recent Documents</h4>
            <Link to="/dashboard/documents" className="btn-sm">View All</Link>
          </div>
          <div className="doc-list">
            {data?.docs?.length > 0 ? data.docs.slice(0, 3).map(doc => (
              <div key={doc.id} className="doc-item">
                <div className="doc-icon">
                  <iconify-icon icon={doc.type === "PDF" ? "ri:file-pdf-line" : "ri:file-text-line"}></iconify-icon>
                </div>
                <div className="doc-info">
                  <div className="doc-name">{doc.name}</div>
                  <div className={`doc-status ${doc.status.toLowerCase().replace(' ', '-')}`}>{doc.status}</div>
                </div>
              </div>
            )) : (
              <p style={{ padding: '20px', opacity: 0.5, textAlign: 'center' }}>No documents uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
