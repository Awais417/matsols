import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import './ActivityLog.css';

const ActivityLog = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await apiService.getSecurityEvents();
                setEvents(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Failed to load activity logs.');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const prettifyIP = (ip) => {
        if (!ip) return 'system';
        if (ip === '::1') return 'Localhost (IPv6)';
        if (ip === '127.0.0.1') return 'Localhost (IPv4)';
        return ip;
    };

    const getActionClass = (action) => {
        if (action.includes('SUCCESS')) return 'action-success';
        if (action.includes('FAIL') || action.includes('LOCKOUT')) return 'action-danger';
        if (action.includes('MFA')) return 'action-warning';
        return '';
    };

    return (
        <div className="activity-log-page">
            <header className="page-header">
                <div className="header-text">
                    <h1 className="admin-title">System Audit Log</h1>
                    <p className="admin-subtitle">Complete forensic record of all security-sensitive operations and authentication events.</p>
                </div>
                <div className="security-status-badge">
                    <iconify-icon icon="ri:shield-cross-line"></iconify-icon>
                    Live Monitoring Active
                </div>
            </header>

            <div className="activity-table-container anim-fade-up">
                {loading ? (
                    <div className="log-loading">
                        <iconify-icon icon="eos-icons:loading" width="40"></iconify-icon>
                        <p>Scanning Audit Records...</p>
                    </div>
                ) : error ? (
                    <div className="log-error">
                        <iconify-icon icon="ri:error-warning-fill" width="40"></iconify-icon>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="activity-table">
                            <thead>
                                <tr>
                                    <th>Event Action</th>
                                    <th>Identity (Email)</th>
                                    <th>Source IP</th>
                                    <th>Date & Time</th>
                                    <th>Device Info</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id}>
                                        <td>
                                            <span className={`action-badge ${getActionClass(event.action)}`}>
                                                {event.action}
                                            </span>
                                        </td>
                                        <td className="cell-identity">
                                            {event.userIdentifier || <span className="dimmed">System</span>}
                                        </td>
                                        <td className="cell-ip">
                                            <code>{event.ipAddress || 'system'}</code>
                                        </td>
                                        <td className="cell-date">
                                            {new Date(event.createdAt).toLocaleString()}
                                        </td>
                                        <td className="cell-ua">
                                            <div className="ua-tooltip-container">
                                                <span className="ua-content">
                                                    {event.userAgent?.length > 40 ? event.userAgent.substring(0, 40) + '...' : event.userAgent || 'Unknown'}
                                                </span>
                                                {event.userAgent && (
                                                    <div className="ua-tooltip">
                                                        {event.userAgent}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
