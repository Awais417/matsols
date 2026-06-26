import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { apiService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./LeadManagement.css";

const STATUSES = ["New", "Contacted", "In Progress", "Qualified", "Application Started", "Converted"];
const PAGE_SIZE = 20;

const formatCountry = (country) => {
  if (!country) return "Unknown";
  return country
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const LeadManagement = () => {
  const location = useLocation();
  const isChatQueuePage = location.pathname.includes("/admin/chat-queue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", email: "", target: "", priority: "med" });
  const [exportRange, setExportRange] = useState({ from: "", to: "" });
  const [isExporting, setIsExporting] = useState(false);

  // Detail panel state
  const [selectedLead, setSelectedLead] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Pagination: { [status]: page }
  const [pages, setPages] = useState({});

  // Chat queue state
  const [chatQueue, setChatQueue] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [agentMessage, setAgentMessage] = useState("");
  const [eta, setEta] = useState({ min: "", max: "", note: "" });
  const [etaStatus, setEtaStatus] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [staffAgents, setStaffAgents] = useState([]);
  const [assignAgentId, setAssignAgentId] = useState("");
  const { user } = useAuth();
  const messagesContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const fetchLeads = async () => {
    try {
      const data = await apiService.getLeads();
      setLeads(data || []);
    } catch (err) {
      setError("Failed to load leads from database.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChatQueue = async () => {
    try {
      const data = await apiService.getAdminChatQueue();
      setChatQueue(data || []);
      if (!selectedSessionId && data?.length) setSelectedSessionId(data[0].id);
    } catch (err) {
      setError("Failed to load chat queue.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChatSession = async (sessionId) => {
    if (!sessionId) return;
    const data = await apiService.getAdminChatSession(sessionId);
    if (!data?.error) setSelectedSession(data);
  };

  useEffect(() => {
    setLoading(true);
    if (isChatQueuePage) {
      fetchChatQueue();
      if (user?.role === "ADMIN") {
        apiService.getUsers().then((users) => {
          const staff = (users || []).filter((u) => ["ADMIN", "EDITOR", "MARKETING", "SUPPORT_AGENT", "COUNSELOR"].includes(u.role));
          setStaffAgents(staff);
        });
      }
      const interval = setInterval(fetchChatQueue, 7000);
      return () => clearInterval(interval);
    }
    fetchLeads();
    return undefined;
  }, [isChatQueuePage, user?.role]);

  useEffect(() => {
    if (!isChatQueuePage || !selectedSessionId) return undefined;
    fetchChatSession(selectedSessionId);
    const interval = setInterval(() => fetchChatSession(selectedSessionId), 5000);
    return () => clearInterval(interval);
  }, [isChatQueuePage, selectedSessionId]);

  useEffect(() => {
    if (!selectedSession) return;
    setAssignAgentId(selectedSession.assignedAgentId || "");
  }, [selectedSession]);

  // Reset scroll to bottom when switching chats
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    isAtBottomRef.current = true;
  }, [selectedSessionId]);

  // Auto-scroll on new messages only if user was already at the bottom
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el || !selectedSession?.messages) return;
    if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [selectedSession?.messages?.length]);

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    await apiService.submitLead({ fullName: newLead.name, email: newLead.email, targetCountry: newLead.target, priority: newLead.priority });
    await fetchLeads();
    setNewLead({ name: "", email: "", target: "", priority: "med" });
    setIsModalOpen(false);
  };

  const updateStatus = async (id, newStatus) => {
    await apiService.updateLead(id, { status: newStatus });
    await fetchLeads();
    if (selectedLead?.id === id) setSelectedLead((prev) => ({ ...prev, status: newStatus }));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await apiService.deleteLead(deleteTarget.id);
    setDeleteTarget(null);
    if (selectedLead?.id === deleteTarget.id) setSelectedLead(null);
    await fetchLeads();
  };

  const handleExport = async (preset = null) => {
    setIsExporting(true);
    let from = exportRange.from;
    let to = exportRange.to;
    if (preset === "7d") { const d = new Date(); d.setDate(d.getDate() - 7); from = d.toISOString().split("T")[0]; to = new Date().toISOString().split("T")[0]; }
    else if (preset === "30d") { const d = new Date(); d.setDate(d.getDate() - 30); from = d.toISOString().split("T")[0]; to = new Date().toISOString().split("T")[0]; }
    const resp = await apiService.exportLeads(from, to);
    if (resp?.error) setError(resp.error);
    else setError(null);
    setIsExporting(false);
  };

  const getPage = (status) => pages[status] || 1;
  const setPage = (status, page) => setPages((prev) => ({ ...prev, [status]: page }));

  // Chat queue handlers
  const acceptChat = async () => {
    if (!selectedSessionId) return;
    await apiService.acceptAdminChat(selectedSessionId);
    await fetchChatQueue();
    await fetchChatSession(selectedSessionId);
  };
  const assignChat = async () => {
    if (!selectedSessionId || !assignAgentId) return;
    await apiService.acceptAdminChat(selectedSessionId, assignAgentId);
    await fetchChatQueue();
    await fetchChatSession(selectedSessionId);
  };
  const pushEta = async () => {
    if (!selectedSessionId) return;
    setEtaStatus("");
    try {
      const resp = await apiService.updateAdminChatEta(selectedSessionId, eta);
      if (resp?.error) { setEtaStatus(resp.error); return; }
      setEta({ min: "", max: "", note: "" });
      setEtaStatus("Sent!");
      setTimeout(() => setEtaStatus(""), 2000);
      await fetchChatSession(selectedSessionId);
    } catch { setEtaStatus("Failed to send ETA."); }
  };
  const sendAgentMessage = async () => { if (!selectedSessionId || !agentMessage.trim()) return; await apiService.sendAdminChatMessage(selectedSessionId, agentMessage.trim()); setAgentMessage(""); await fetchChatSession(selectedSessionId); await fetchChatQueue(); };
  const closeChat = async () => { if (!selectedSessionId) return; await apiService.closeAdminChatSession(selectedSessionId); await fetchChatQueue(); await fetchChatSession(selectedSessionId); };

  if (loading) return (
    <div className="fuckin-loader-overlay">
      <div className="fuckin-loader"></div>
      <div className="loader-text">{isChatQueuePage ? "Loading Chat Queue..." : "Loading Lead Pipelines..."}</div>
    </div>
  );

  if (isChatQueuePage) {
    const canAccept = selectedSession?.status === "WAITING_AGENT";
    const assignedAgentLabel =
      selectedSession?.assignedAgent?.fullName ||
      selectedSession?.assignedAgent?.email ||
      "Assigned agent";
    const canSendAgentMessage = selectedSession?.status !== "ENDED";
    return (
      <div className="lead-management">
        <div className="admin-header leads-header">
          <div className="admin-title"><h1>Live Chat Queue</h1><p>Handle AI escalations and continue in the same conversation thread.</p></div>
        </div>
        <div className="chatq-layout">
          <div className="admin-chart-card chatq-list-card">
            {chatQueue.length === 0 ? <p className="chatq-muted">No active chat requests.</p> : chatQueue.map((session) => (
              <button key={session.id} onClick={() => { setSelectedSession(null); setSelectedSessionId(session.id); setMsgSearch(""); }} className={`chatq-list-item ${selectedSessionId === session.id ? "active" : ""}`}>
                <div className="chatq-item-head">
                  <div className="chatq-item-name">
                    {session.fullName}
                    {chatQueue.filter(s => s.email === session.email).length > 1 && (
                      <span className="chatq-duplicate-badge" title="Multiple sessions for this user">2+</span>
                    )}
                  </div>
                  <span className={`chatq-status-badge ${session.status === "AGENT_ACTIVE" ? "active" : ""}`}>{session.status === "AGENT_ACTIVE" ? "Agent Active" : "Waiting Agent"}</span>
                </div>
                <div className="chatq-item-email">{session.email}</div>
                <div className="chatq-item-meta"><span>{session.country}</span><span>{session.programInterest}</span></div>
              </button>
            ))}
          </div>
          <div className="admin-chart-card chatq-thread-card">
            {selectedSession ? (
              <>
                <div className="chatq-thread-header">
                  <div className="chatq-thread-identity">
                    <h4>{selectedSession.fullName}</h4>
                    <p>{selectedSession.email} | {selectedSession.phone ? `****${selectedSession.phone.slice(-4)}` : "No phone"}</p>
                  </div>
                  <div className="chatq-actions">
                    {canAccept ? (
                      <button className="chatq-btn chatq-btn-primary" onClick={acceptChat}>Accept</button>
                    ) : (
                      <span className="chatq-status-badge active">Accepted by {assignedAgentLabel}</span>
                    )}
                    {user?.role === "ADMIN" && (
                      <>
                        <select
                          className="ai-input"
                          style={{ minWidth: "180px" }}
                          value={assignAgentId}
                          onChange={(e) => setAssignAgentId(e.target.value)}
                        >
                          <option value="">Assign to agent...</option>
                          {staffAgents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.fullName || agent.email} ({agent.role})
                            </option>
                          ))}
                        </select>
                        <button className="chatq-btn chatq-btn-muted" onClick={assignChat} disabled={!assignAgentId}>
                          Assign
                        </button>
                      </>
                    )}
                    <button
                      className="chatq-btn chatq-btn-muted"
                      onClick={() => {
                        const lines = (selectedSession.messages || []).map(
                          (m) => `[${m.senderType.toUpperCase()}]: ${m.content}`
                        ).join("\n");
                        const blob = new Blob([`Transcript: ${selectedSession.fullName}\n${selectedSession.email}\n\n${lines}`], { type: "text/plain" });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = `transcript_${selectedSession.fullName.replace(/ /g, "_")}.txt`;
                        a.click();
                      }}
                    >
                      Export Transcript
                    </button>
                    <button className="chatq-btn chatq-btn-muted" onClick={closeChat}>Close</button>
                  </div>
                </div>
                <div className="chatq-eta-wrap">
                  <div className="chatq-eta-header"><h5>Delay Update (ETA)</h5><p>Use this only when you cannot reply within the current promised window.</p></div>
                  <div className="chatq-eta-row">
                    {etaStatus ? <div className="chatq-eta-sent">Sent!</div> : (
                      <>
                        <input className="ai-input chatq-eta-input" type="number" placeholder="Min (minutes)" value={eta.min} onChange={(e) => setEta((p) => ({ ...p, min: e.target.value }))} />
                        <input className="ai-input chatq-eta-input" type="number" placeholder="Max (minutes)" value={eta.max} onChange={(e) => setEta((p) => ({ ...p, max: e.target.value }))} />
                        <input className="ai-input chatq-eta-note" placeholder="Optional status note" value={eta.note} onChange={(e) => setEta((p) => ({ ...p, note: e.target.value }))} />
                        <button className="chatq-btn chatq-btn-muted" onClick={pushEta}>Send ETA</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="chatq-search-bar">
                  <iconify-icon icon="ri:search-line"></iconify-icon>
                  <input
                    className="ai-input"
                    placeholder="Search messages..."
                    value={msgSearch}
                    onChange={(e) => setMsgSearch(e.target.value)}
                  />
                </div>
                <div className="chatq-messages" ref={messagesContainerRef} onScroll={handleMessagesScroll}>
                  {(selectedSession.messages || [])
                    .filter(msg => !msgSearch || msg.content?.toLowerCase().includes(msgSearch.toLowerCase()))
                    .map((msg) => (
                      <div key={msg.id} className={`chatq-message ${msg.senderType === "user" ? "from-user" : ""} ${msg.senderType === "agent" ? "from-agent" : ""}`}>
                        <div className="chatq-message-role">{msg.senderType}</div>
                        <div className="chatq-message-bubble">{msg.content}</div>
                      </div>
                    ))}
                </div>
                <div className="chatq-composer">
                  <input className="ai-input" placeholder="Reply as agent..." value={agentMessage} onChange={(e) => setAgentMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendAgentMessage()} disabled={!canSendAgentMessage} />
                  <button className="chatq-btn chatq-btn-primary" onClick={sendAgentMessage} disabled={!canSendAgentMessage}>Send</button>
                </div>
              </>
            ) : <p className="chatq-muted">Select a session from the queue.</p>}
          </div>
        </div>
        {error && <p className="chatq-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="lead-management">
      <div className="admin-header leads-header">
        <div className="admin-title">
          <h1>Student Leads</h1>
          <p>Manage and track student inquiries from the AI agent and website.</p>
        </div>
        <div className="leads-actions">
          <div className="search-bar-wrap">
            <input type="text" placeholder="Search leads..." className="ai-input leads-search-input" />
          </div>
          <button className="btn-apply leads-add-btn" onClick={() => setIsModalOpen(true)}>+ Add Lead</button>
        </div>
      </div>

      <div className="admin-chart-card" style={{ marginBottom: "24px", padding: "20px" }}>
        <h4 style={{ marginBottom: "15px" }}>Export Leads Report</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>From Date</label>
            <input type="date" className="ai-input" style={{ height: "35px", padding: "5px 10px" }} value={exportRange.from} onChange={(e) => setExportRange({ ...exportRange, from: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>To Date</label>
            <input type="date" className="ai-input" style={{ height: "35px", padding: "5px 10px" }} value={exportRange.to} onChange={(e) => setExportRange({ ...exportRange, to: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => handleExport()} disabled={isExporting} className="btn-apply" style={{ height: "35px", padding: "0 15px", fontSize: "12px" }}>{isExporting ? "Exporting..." : "Export Selected Range"}</button>
            <button onClick={() => handleExport("7d")} disabled={isExporting} className="btn-outline" style={{ height: "35px", padding: "0 15px", fontSize: "12px" }}>Last 7 Days</button>
            <button onClick={() => handleExport("30d")} disabled={isExporting} className="btn-outline" style={{ height: "35px", padding: "0 15px", fontSize: "12px" }}>Last 30 Days</button>
          </div>
        </div>
      </div>

      <div className="lead-board">
        {STATUSES.map((col) => {
          const colLeads = leads.filter((l) => l.status === col);
          const currentPage = getPage(col);
          const totalPages = Math.ceil(colLeads.length / PAGE_SIZE) || 1;
          const paginated = colLeads.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

          return (
            <div key={col} className="lead-column">
              <div className="column-header">
                <h4>{col}</h4>
                <span className="lead-count">{colLeads.length}</span>
              </div>

              <div className="lead-cards">
                {paginated.map((lead) => (
                  <div key={lead.id} className="lead-card" onClick={() => setSelectedLead(lead)} style={{ cursor: "pointer" }}>
                    <div className="lead-card-header">
                      <span className="lead-name">{lead.fullName}</span>
                      <div className={`lead-priority priority-${lead.priority}`}></div>
                    </div>

                    <div className="lead-details">
                      <div className="lead-detail-item">
                        <iconify-icon icon="ri:building-line"></iconify-icon>
                        {formatCountry(lead.targetCountry)}
                      </div>
                      <div className="lead-detail-item">
                        <iconify-icon icon="ri:mail-line"></iconify-icon>
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="lead-detail-item">
                          <iconify-icon icon="ri:phone-line"></iconify-icon>
                          {lead.phone}
                        </div>
                      )}
                      {lead.programInterest && (
                        <div className="lead-detail-item">
                          <iconify-icon icon="ri:book-open-line"></iconify-icon>
                          {lead.programInterest}
                        </div>
                      )}
                    </div>

                    <div className="lead-card-footer" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="lead-date">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        <select
                          className="ai-input"
                          style={{ padding: "2px 8px", fontSize: "12px", height: "auto", width: "auto" }}
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => { e.stopPropagation(); updateStatus(lead.id, e.target.value); }}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(lead); }}
                        style={{ alignSelf: "flex-end", background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}
                      >
                        Delete Lead
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="lead-pagination">
                  <button disabled={currentPage === 1} onClick={() => setPage(col, currentPage - 1)} className="page-btn">‹</button>
                  <span>{currentPage} / {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setPage(col, currentPage + 1)} className="page-btn">›</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lead Detail Panel */}
      {selectedLead && (
        <div className="lead-detail-overlay" onClick={() => setSelectedLead(null)}>
          <div className="lead-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="detail-panel-header">
              <h3>{selectedLead.fullName}</h3>
              <button className="detail-close-btn" onClick={() => setSelectedLead(null)}>
                <iconify-icon icon="ri:close-line"></iconify-icon>
              </button>
            </div>
            <div className="detail-panel-body">
              <div className="detail-section">
                <div className="detail-row"><iconify-icon icon="ri:mail-line"></iconify-icon><span>{selectedLead.email}</span></div>
                {selectedLead.phone && <div className="detail-row"><iconify-icon icon="ri:phone-line"></iconify-icon><span>{selectedLead.phone}</span></div>}
                <div className="detail-row"><iconify-icon icon="ri:building-line"></iconify-icon><span>{formatCountry(selectedLead.targetCountry)}</span></div>
                {selectedLead.programInterest && <div className="detail-row"><iconify-icon icon="ri:book-open-line"></iconify-icon><span>{selectedLead.programInterest}</span></div>}
                <div className="detail-row"><iconify-icon icon="ri:calendar-line"></iconify-icon><span>{new Date(selectedLead.createdAt).toLocaleString()}</span></div>
              </div>
              <div className="detail-section">
                <label className="detail-label">Status</label>
                <select
                  className="ai-input"
                  value={selectedLead.status}
                  onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                  style={{ width: "100%", marginTop: "6px" }}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="detail-section">
                <button
                  className="detail-delete-btn"
                  onClick={() => { setDeleteTarget(selectedLead); setSelectedLead(null); }}
                >
                  <iconify-icon icon="ri:delete-bin-line"></iconify-icon>
                  Delete Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Modal */}
      {deleteTarget && (
        <div className="delete-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon"><iconify-icon icon="ri:error-warning-line"></iconify-icon></div>
            <h3>Delete Lead?</h3>
            <p>Are you sure you want to permanently delete <strong>{deleteTarget.fullName}</strong>? This cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Add New Lead</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <iconify-icon icon="ri:close-line"></iconify-icon>
              </button>
            </div>
            <form onSubmit={handleAddLead} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Full Name</label>
                  <input type="text" className="ai-input" required value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} placeholder="e.g. John Doe" />
                </div>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Email Address</label>
                  <input type="email" className="ai-input" required value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} placeholder="e.g. john@example.com" />
                </div>
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Target University</label>
                  <input type="text" className="ai-input" required value={newLead.target} onChange={(e) => setNewLead({ ...newLead, target: e.target.value })} placeholder="e.g. UK - Oxford" />
                </div>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Priority</label>
                  <select className="ai-input" value={newLead.priority} onChange={(e) => setNewLead({ ...newLead, priority: e.target.value })}>
                    <option value="high">High</option>
                    <option value="med">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" style={{ flex: 1, padding: "10px" }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-apply" style={{ flex: 1, padding: "10px" }}>Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <p style={{ color: "#ef4444", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default LeadManagement;
