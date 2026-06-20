import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePublicSettings } from "../context/PublicSettingsContext";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { brandName, logoUrl } = usePublicSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [banner, setBanner] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (!banner) return undefined;
    const timer = setTimeout(() => setBanner(""), 2200);
    return () => clearTimeout(timer);
  }, [banner]);

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      <div
        className={`menu-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`dash-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <Link to="/" className="sidebar-logo">
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} style={{ width: "28px", height: "28px", objectFit: "contain" }} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary-orange, #ff863c)"></path>
              <path d="M2 17L12 22L22 17" stroke="#041021" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M2 12L12 17L22 12" stroke="#041021" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          )}
          {brandName}
        </Link>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}>
            <iconify-icon icon="ri:dashboard-line"></iconify-icon>
            Dashboard
          </Link>
          <Link to="/dashboard/applications" className={`nav-item ${isActive("/dashboard/applications") ? "active" : ""}`}>
            <iconify-icon icon="ri:file-list-3-line"></iconify-icon>
            My Applications
          </Link>
          <Link to="/dashboard/universities" className={`nav-item ${isActive("/dashboard/universities") ? "active" : ""}`}>
            <iconify-icon icon="ri:building-2-line"></iconify-icon>
            University Search
          </Link>
          <Link to="/dashboard/documents" className={`nav-item ${isActive("/dashboard/documents") ? "active" : ""}`}>
            <iconify-icon icon="ri:folder-user-line"></iconify-icon>
            Documents
          </Link>
          <Link to="/dashboard/messages" className={`nav-item ${isActive("/dashboard/messages") ? "active" : ""}`}>
            <iconify-icon icon="ri:message-2-line"></iconify-icon>
            Messages
          </Link>
          <Link to="/dashboard/settings" className={`nav-item ${isActive("/dashboard/settings") ? "active" : ""}`}>
            <iconify-icon icon="ri:settings-4-line"></iconify-icon>
            Settings
          </Link>
        </nav>

        <div className="sidebar-user">
          <div className="user-card">
            <img src={`https://ui-avatars.com/api/?name=${user.fullName}&background=041021&color=fff`} alt="User" className="user-avatar" />
            <div className="user-info">
              <div className="user-name">{user.fullName}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Logout">
              <iconify-icon icon="ri:logout-box-r-line" style={{ fontSize: '18px' }}></iconify-icon>
              <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dash-main">
        <header className="dash-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <iconify-icon icon="ri:menu-2-line"></iconify-icon>
            </button>
            <h1 className="header-title">
              {location.pathname === "/dashboard" && "Overview"}
              {location.pathname.includes("applications") && "My Applications"}
              {location.pathname.includes("documents") && "Documents"}
              {location.pathname.includes("universities") && "University Search"}
              {location.pathname.includes("messages") && "Messages"}
              {location.pathname.includes("settings") && "Settings"}
            </h1>
          </div>

          <div className="header-actions">
            <button className="btn-icon" onClick={() => setBanner("Checking for new notifications...")}>
              <iconify-icon icon="ri:notification-3-line" style={{ fontSize: '20px' }}></iconify-icon>
              <span className="badge-dot"></span>
            </button>
            <button className="btn-icon" onClick={() => setBanner("Opening support & help center...")}>
              <iconify-icon icon="ri:question-line" style={{ fontSize: '20px' }}></iconify-icon>
            </button>
          </div>
        </header>

        {banner && (
          <div style={{ margin: "18px 24px 0", padding: "12px 16px", borderRadius: "14px", background: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a", boxShadow: "0 12px 28px rgba(15,23,42,0.08)", fontWeight: 600 }}>
            {banner}
          </div>
        )}

        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
