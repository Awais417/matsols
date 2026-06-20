import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { apiService } from '../../services/api';
import '../../layouts/AdminLayout.css';

const AdminOverview = () => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState("");
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('matsols_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, chartsRes] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminCharts()
      ]);
      setStats(statsRes);
      setChartData(chartsRes);
      setLoading(false);
    };
    fetchData();
  }, []);

  const hasRole = (roles) => roles.includes(user?.role);

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);
    setExportError("");

    try {
      const report = {
        generatedAt: new Date().toISOString(),
        generatedBy: user?.email || "unknown",
        title: "MATSOLS Admin Analytics Report",
        stats: stats || {},
        charts: chartData || {},
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `admin_analytics_report_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    } catch (error) {
      console.error("Analytics export failed:", error);
      setIsExporting(false);
      setExportError("Failed to generate export file.");
    }
  };

  if (loading) return (
    <div className="fuckin-loader-overlay">
      <div className="fuckin-loader"></div>
      <div className="loader-text">Loading System Overview...</div>
    </div>
  );

  return (
    <div className="admin-overview">
      <div className="admin-header">
        <div className="admin-title">
          <h1>System Overview</h1>
          <p>Real-time analytics and student registration performance.</p>
        </div>
        <div className="admin-header-actions">
          {exportError && (
            <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>
              <iconify-icon icon="ri:error-warning-line" style={{ verticalAlign: 'middle', marginRight: '5px' }}></iconify-icon>
              {exportError}
            </span>
          )}
          {exportComplete && (
            <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '600', animation: 'fadeIn 0.3s' }}>
              <iconify-icon icon="ri:check-line" style={{ verticalAlign: 'middle', marginRight: '5px' }}></iconify-icon>
              Report Downloaded
            </span>
          )}
          <button
            className={`btn-apply ${isExporting ? 'loading' : ''}`}
            style={{ padding: '10px 20px', minWidth: '140px', position: 'relative' }}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <iconify-icon icon="line-md:loading-twotone-loop" style={{ marginRight: '8px', verticalAlign: 'middle' }}></iconify-icon>
                Generating...
              </>
            ) : (
              <>
                <iconify-icon icon="ri:download-2-line" style={{ marginRight: '8px', verticalAlign: 'middle' }}></iconify-icon>
                Export Report
              </>
            )}
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        {hasRole(['ADMIN', 'EDITOR', 'MARKETING']) && (
          <div className="admin-stat-card" onClick={() => navigate('/admin/users')}>
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <iconify-icon icon="ri:user-add-line"></iconify-icon>
              </div>
              <div className="stat-trend trend-up">
                <iconify-icon icon="ri:arrow-right-up-line"></iconify-icon> --
              </div>
            </div>
            <div className="stat-value">{stats?.totalStudents?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Students</div>
          </div>
        )}

        {hasRole(['ADMIN']) && (
          <div className="admin-stat-card">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: '#fef3f2', color: '#ef4444' }}>
                <iconify-icon icon="ri:file-list-3-line"></iconify-icon>
              </div>
              <div className="stat-trend trend-up">
                <iconify-icon icon="ri:arrow-right-up-line"></iconify-icon> --
              </div>
            </div>
            <div className="stat-value">{stats?.applicationsUnderReview?.toLocaleString() || 0}</div>
            <div className="stat-label">Applications Under Review</div>
          </div>
        )}

        {hasRole(['ADMIN', 'MARKETING', 'COUNSELOR']) && (
          <div className="admin-stat-card" onClick={() => navigate('/admin/leads')}>
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <iconify-icon icon="ri:message-line"></iconify-icon>
              </div>
              <div className="stat-trend trend-down">
                <iconify-icon icon="ri:arrow-right-down-line"></iconify-icon> --
              </div>
            </div>
            <div className="stat-value">{stats?.totalLeads?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Leads</div>
          </div>
        )}

        {hasRole(['ADMIN']) && (
          <div className="admin-stat-card">
            <div className="stat-header">
              <div className="stat-icon-wrap" style={{ background: '#faf5ff', color: '#9333ea' }}>
                <iconify-icon icon="ri:money-dollar-circle-line"></iconify-icon>
              </div>
              <div className="stat-trend trend-up">
                <iconify-icon icon="ri:arrow-right-up-line"></iconify-icon> --
              </div>
            </div>
            <div className="stat-value">{stats?.revenue || "£0"}</div>
            <div className="stat-label">Estimated Revenue</div>
          </div>
        )}
      </div>

      <style>{`
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 30px;
        }
        .admin-header-actions {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        @media (max-width: 768px) {
            .admin-header {
                flex-direction: column;
                align-items: stretch;
            }
            .admin-header-actions {
                flex-direction: column-reverse;
                align-items: stretch;
            }
            .btn-apply {
                width: 100%;
            }
        }
        .admin-stat-card {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            color: #0f172a !important; /* Ensure text is dark and visible */
        }
        .stat-value, .admin-stat-card .stat-value {
            color: #0f172a !important;
        }
        .stat-label, .admin-stat-card .stat-label {
            color: #475569 !important;
        }
        .admin-stat-card:hover {
            transform: translateY(-5px);
            border-color: rgba(6, 182, 212, 0.3);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        .admin-stat-card:active {
            transform: scale(0.98);
        }
      `}</style>

      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <div className="chart-header">
            <h3>Registration Trend</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData?.weeklyData || []}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="students" stroke="#06b6d4" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-chart-card">
          <div className="chart-header">
            <h3>Destination Mix</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData?.countryData || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {(chartData?.countryData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div >
  );
};

export default AdminOverview;
