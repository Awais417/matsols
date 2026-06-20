import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePublicSettings } from '../context/PublicSettingsContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout, sessionRemainingMs } = useAuth();
  const { brandName, logoUrl } = usePublicSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (location.pathname !== '/admin') return;

    if (user?.role === 'EDITOR') {
      window.location.href = '/admin/updates';
      return;
    }

    if (user?.role === 'SUPPORT_AGENT') {
      window.location.href = '/admin/chat-queue';
      return;
    }

    if (user?.role === 'COUNSELOR') {
      window.location.href = '/admin/leads';
    }
  }, [location.pathname, user?.role]);

  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const hasRole = (roles) => roles.includes(user?.role);
  const remainingMinutes = sessionRemainingMs == null ? null : Math.max(0, Math.ceil(sessionRemainingMs / 60000));

  return (
    <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <button
        className="admin-sidebar-overlay md-show"
        aria-label="Close sidebar"
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/admin" className="admin-logo">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} style={{ width: "30px", height: "30px", objectFit: "contain" }} />
            ) : (
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary-orange)"></path>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            )}
            <span>{brandName}</span>
          </Link>
        </div>

        <nav className="admin-nav">
          {hasRole(['ADMIN', 'MARKETING', 'VIEWER']) && (
            <Link to="/admin" className={`admin-nav-item ${isActive('/admin') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <iconify-icon icon="ri:pie-chart-line"></iconify-icon>
              Analytics Overview
            </Link>
          )}

          {hasRole(['ADMIN', 'MARKETING', 'COUNSELOR']) && (
            <Link to="/admin/leads" className={`admin-nav-item ${isActive('/admin/leads') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <iconify-icon icon="ri:user-follow-line"></iconify-icon>
              Student Leads
            </Link>
          )}

          {hasRole(['ADMIN', 'EDITOR', 'MARKETING', 'SUPPORT_AGENT', 'COUNSELOR']) && (
            <Link to="/admin/chat-queue" className={`admin-nav-item ${isActive('/admin/chat-queue') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <iconify-icon icon="ri:chat-3-line"></iconify-icon>
              Chat Queue
            </Link>
          )}

          {hasRole(['ADMIN', 'EDITOR']) && (
            <>
              <Link to="/admin/updates" className={`admin-nav-item ${isActive('/admin/updates') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                <iconify-icon icon="ri:notification-3-line"></iconify-icon>
                Updates & Insights
              </Link>
              <Link to="/admin/universities" className={`admin-nav-item ${isActive('/admin/universities') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                <iconify-icon icon="ri:bank-line"></iconify-icon>
                University Management
              </Link>
              <Link to="/admin/degrees" className={`admin-nav-item ${isActive('/admin/degrees') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                <iconify-icon icon="ri:briefcase-line"></iconify-icon>
                Degree Management
              </Link>
              <Link to="/admin/scholarships" className={`admin-nav-item ${isActive('/admin/scholarships') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                <iconify-icon icon="ri:medal-line"></iconify-icon>
                Scholarship Management
              </Link>
            </>
          )}

          {hasRole(['ADMIN']) && (
            <>
              <Link to="/admin/users" className={`admin-nav-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                <iconify-icon icon="ri:user-settings-line"></iconify-icon>
                Staff & Roles
              </Link>
              <Link to="/admin/settings" className={`admin-nav-item ${isActive('/admin/settings') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                <iconify-icon icon="ri:settings-line"></iconify-icon>
                System Settings
              </Link>
              <Link to="/admin/security" className={`admin-nav-item ${isActive('/admin/security') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                <iconify-icon icon="ri:shield-keyhole-line"></iconify-icon>
                Security Settings
              </Link>
              <Link to="/admin/activity" className={`admin-nav-item ${isActive('/admin/activity') ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                <iconify-icon icon="ri:history-line"></iconify-icon>
                Audit Log
              </Link>
            </>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="btn-apply admin-public-btn">
            View Public Site
          </Link>
          <button
            onClick={() => setConfirmLogout(true)}
            className="btn-apply admin-logout-btn"
          >
            <iconify-icon icon="ri:logout-box-r-line"></iconify-icon> Logout
          </button>
        </div>
      </aside>

      <div className="admin-content-wrapper">
        <header className="admin-top-bar md-show">
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(true)}>
            <iconify-icon icon="ri:menu-2-line"></iconify-icon>
          </button>
          <span className="portal-name">Staff Portal</span>
          {remainingMinutes !== null && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '12px',
                fontWeight: 600,
                color: remainingMinutes <= 15 ? '#ef4444' : '#334155',
              }}
            >
              Session: {remainingMinutes} min
            </span>
          )}
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      {confirmLogout && (
        <div className="admin-confirm-overlay" onClick={() => setConfirmLogout(false)}>
          <div className="admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-icon">
              <iconify-icon icon="ri:logout-box-r-line"></iconify-icon>
            </div>
            <h3>Log Out?</h3>
            <p>Are you sure you want to log out of the admin panel?</p>
            <div className="admin-confirm-actions">
              <button type="button" className="btn-outline" onClick={() => setConfirmLogout(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-apply admin-confirm-danger"
                onClick={() => {
                  setConfirmLogout(false);
                  logout();
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
