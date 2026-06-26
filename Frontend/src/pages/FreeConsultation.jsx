import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiService } from "../services/api";
import { usePublicSettings } from "../context/PublicSettingsContext";
import "./FreeConsultation.css";

const getVisitorToken = () => {
  let token = localStorage.getItem("matsols_visitor_token");
  if (!token) {
    token = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("matsols_visitor_token", token);
  }
  return token;
};

const COMMON_COUNTRIES = [
  "United Kingdom", "Malta", "Turkey", "Pakistan", "India", "Bangladesh", 
  "Nigeria", "Ghana", "United Arab Emirates", "Saudi Arabia", "Qatar",
  "Sri Lanka", "Nepal", "Egypt", "Morocco", "Others"
].sort();

const COUNTRY_CODES = [
  { code: "+44", name: "UK" },
  { code: "+356", name: "MT" },
  { code: "+90", name: "TR" },
  { code: "+92", name: "PK" },
  { code: "+91", name: "IN" },
  { code: "+880", name: "BD" },
  { code: "+234", name: "NG" },
  { code: "+233", name: "GH" },
  { code: "+971", name: "AE" },
  { code: "+966", name: "SA" },
  { code: "+974", name: "QA" },
  { code: "+94", name: "LK" },
  { code: "+977", name: "NP" },
  { code: "+20", name: "EG" },
  { code: "+212", name: "MA" },
].sort((a, b) => a.name.localeCompare(b.name));

const COLLAPSE_LINE_THRESHOLD = 15;

const FreeConsultation = ({ embedded = false, onRequestClose = null }) => {
  const { brandName, logoUrl } = usePublicSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollRef = useRef(null);
  const autoStartRef = useRef(false);
  const [intake, setIntake] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    programInterest: "",
    gpa: "",
    lastQualification: "",
  });
  const [session, setSession] = useState({
    id: "",
    visitorToken: getVisitorToken(),
    status: "",
  });
  const [isIntakeDone, setIsIntakeDone] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [phoneCode, setPhoneCode] = useState("+44");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isPhoneCodeOpen, setIsPhoneCodeOpen] = useState(false);

  const countryRef = useRef(null);
  const phoneRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [showHandoffButtons, setShowHandoffButtons] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [collapsedMessages, setCollapsedMessages] = useState(new Set());
  const [copySuccess, setCopySuccess] = useState(null); // Track which message was just copied
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const toggleCollapse = (msgId) => {
    setCollapsedMessages(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const isLongMessage = (text) => {
    if (!text) return false;
    return text.split('\n').length > COLLAPSE_LINE_THRESHOLD || text.length > 800;
  };

  const validateForm = () => {
    const errors = {};
    if (!intake.fullName.trim()) errors.fullName = "Full name is required";
    if (!intake.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(intake.email)) {
      errors.email = "Invalid email format";
    }
    if (!intake.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(intake.phone.replace(/[\s-()]/g, ""))) {
      errors.phone = "Invalid phone number (digits only)";
    }
    if (!intake.country) errors.country = "Please select your country";
    if (!intake.programInterest.trim()) errors.programInterest = "Please specify your interest";
    if (!agreedToPrivacy) errors.privacy = "You must agree to the privacy policy";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startSession = async (intakePayload) => {
    setError("");
    setIsStarting(true);
    
    // Combine phone code if available
    const finalPayload = {
      ...intakePayload,
      phone: intakePayload.phone.startsWith('+') ? intakePayload.phone : `${phoneCode} ${intakePayload.phone}`
    };

    let currentToken = session.visitorToken;
    let result = await apiService.createPublicChatSession({
      visitorToken: currentToken,
      ...finalPayload,
    });

    // Auto-recover from stale browser token by creating a fresh session token.
    if (result?.error && /token already exists/i.test(result.error)) {
      currentToken = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("matsols_visitor_token", currentToken);
      setSession((prev) => ({ ...prev, visitorToken: currentToken }));
      result = await apiService.createPublicChatSession({
        visitorToken: currentToken,
        ...intakePayload,
      });
    }

    if (result?.error || !result?.id) {
      setError(result?.error || "Failed to start consultation session.");
      setIsStarting(false);
      return false;
    }

    setSession((prev) => ({
      ...prev,
      visitorToken: currentToken,
      id: result.id,
      status: result.status || "AI_ACTIVE",
    }));
    localStorage.setItem("matsols_chat_session_id", result.id);
    setIsIntakeDone(true);
    await syncMessages(result.id, currentToken);
    setIsStarting(false);
    return true;
  };

  const syncMessages = async (sessionId, visitorToken) => {
    const data = await apiService.getPublicChatMessages(sessionId, visitorToken);
    if (data?.error) return;

    setMessages(data.messages || []);
    if (data.session?.status) {
      setSession((prev) => ({ ...prev, status: data.session.status }));
      if (data.session.status !== "AI_ACTIVE") {
        setShowHandoffButtons(false);
      }
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Smart Scroll: Only scroll if user is near the bottom (within 150px)
    // or if this is the very first message.
    const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
    
    if (isNearBottom || messages.length <= 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isTyping, showHandoffButtons]);

  useEffect(() => {
    if (!isIntakeDone || !session.id) return undefined;
    const runPoll = () => syncMessages(session.id, session.visitorToken);
    runPoll();
    pollRef.current = setInterval(runPoll, 5000);
    return () => clearInterval(pollRef.current);
  }, [isIntakeDone, session.id, session.visitorToken]);

  useEffect(() => {
    const recoveredSessionId = localStorage.getItem("matsols_chat_session_id");
    if (recoveredSessionId) {
      setSession(prev => ({ ...prev, id: recoveredSessionId }));
      setIsIntakeDone(true);
      syncMessages(recoveredSessionId, session.visitorToken);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
      if (phoneRef.current && !phoneRef.current.contains(event.target)) {
        setIsPhoneCodeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoStartRef.current || isIntakeDone || session.id) return;

    const statePrefill = location.state?.prefillIntake;
    let storedPrefill = null;
    try {
      const raw = sessionStorage.getItem("matsols_chat_prefill");
      if (raw) storedPrefill = JSON.parse(raw);
    } catch (err) {
      storedPrefill = null;
    }

    const prefill = statePrefill || storedPrefill;
    if (!prefill) return;

    const prepared = {
      fullName: String(prefill.fullName || "").trim(),
      email: String(prefill.email || "").trim(),
      phone: String(prefill.phone || "").trim(),
      country: String(prefill.country || "").trim(),
      programInterest: String(prefill.programInterest || "").trim(),
      gpa: String(prefill.gpa || "").trim(),
      lastQualification: String(prefill.lastQualification || "").trim(),
    };

    if (
      !prepared.fullName ||
      !prepared.email ||
      !prepared.phone ||
      !prepared.country ||
      !prepared.programInterest
    ) {
      return;
    }

    autoStartRef.current = true;
    sessionStorage.removeItem("matsols_chat_prefill");
    setIntake(prepared);
    startSession(prepared);
  }, [isIntakeDone, location.state, session.id]);

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    if (isStarting) return;
    if (!validateForm()) return;
    await startSession(intake);
  };

  const handleSend = async (text = input) => {
    if (!text.trim() || !session.id || session.status === "ENDED") return;
    const payload = text.trim();
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      senderType: "user",
      content: payload,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setIsTyping(true);
    setShowHandoffButtons(false);

    try {
      const response = await apiService.sendPublicChatMessage(session.id, {
        visitorToken: session.visitorToken,
        content: payload,
        history: messages,
      });

      if (response?.error) {
        setError(response.error);
      } else {
        if (response.needsHandoff) {
          setShowHandoffButtons(true);
        }
        if (response.sessionStatus) {
          setSession((prev) => ({ ...prev, status: response.sessionStatus }));
        }
      }
      await syncMessages(session.id, session.visitorToken);
    } catch (err) {
      setError("Message failed. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleEscalationChoice = async (choice) => {
    if (!session.id) return;
    setShowHandoffButtons(false);

    if (choice === "YES") {
      const result = await apiService.escalatePublicChat(
        session.id,
        session.visitorToken,
      );
      if (result?.error) {
        setError(result.error);
      }
      await syncMessages(session.id, session.visitorToken);
      return;
    }

    const closeResult = await apiService.closePublicChat(
      session.id,
      session.visitorToken,
    );
    if (closeResult?.error) {
      setError(closeResult.error);
    }
    await syncMessages(session.id, session.visitorToken);
  };

  const handleNewSession = () => {
    const newToken = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("matsols_visitor_token", newToken);
    localStorage.removeItem("matsols_chat_session_id");
    setSession({ id: "", visitorToken: newToken, status: "" });
    setMessages([]);
    setInput("");
    setError("");
    setIsTyping(false);
    setShowHandoffButtons(false);
    setIsIntakeDone(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCloseChat = () => {
    if (isIntakeDone && session.id && session.status !== "ENDED") {
      setShowCloseConfirm(true);
      return;
    }
    finishCloseChat();
  };

  const finishCloseChat = () => {
    setShowCloseConfirm(false);

    if (embedded && typeof onRequestClose === "function") {
      onRequestClose();
      return;
    }

    if (embedded) {
      navigate(-1);
      return;
    }

    const fallbackReturnTo =
      location.state?.returnTo ||
      new URLSearchParams(location.search).get("returnTo") ||
      "/";

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
      navigate(fallbackReturnTo);
  };

  const copyToClipboard = (messageId, text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(messageId);
    setTimeout(() => setCopySuccess(null), 2000);
  };


  const renderMessageContent = (text) => {
    if (!text) return null;

    return (
      <div className="bubble-content">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="bubble-md-h1" {...props} />,
            h2: ({node, ...props}) => <h2 className="bubble-md-h2" {...props} />,
            h3: ({node, ...props}) => <h3 className="bubble-md-h3" {...props} />,
            ul: ({node, ...props}) => <ul className="bubble-md-ul" {...props} />,
            ol: ({node, ...props}) => <ol className="bubble-md-ol" {...props} />,
            li: ({node, ...props}) => <li className="bubble-md-li" {...props} />,
            a: ({node, ...props}) => <a className="bubble-md-link" target="_blank" rel="noopener noreferrer" {...props} />,
            strong: ({node, ...props}) => <strong className="bubble-md-bold" {...props} />
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div
      className={`consultation-page${embedded ? " consultation-page--modal" : ""}`}
      data-lenis-prevent={embedded ? "true" : undefined}
    >
      <div className="consultation-bg">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>
      <div
        className={`consultation-shell${embedded ? " consultation-shell--modal" : ""}`}
        data-lenis-prevent={embedded ? "true" : undefined}
      >
        <header className="consultation-header">
          <Link to="/" className="header-brand">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} style={{ width: "24px", height: "24px", objectFit: "contain" }} />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary-orange)"></path>
                <path
                  d="M2 17L12 22L22 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M2 12L12 17L22 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            )}
            {brandName} AI Advisor
          </Link>
          <div className="header-controls">
            <button
              className="btn-close"
              onClick={handleCloseChat}
              title="Close Chat"
              style={{ cursor: "pointer" }}
            >
              <iconify-icon
                icon="ri:close-line"
                style={{ fontSize: "24px" }}
              ></iconify-icon>
            </button>
          </div>
        </header>

        <div className="chat-container">
        {!isIntakeDone ? (
          <form className="intake-shell" onSubmit={handleIntakeSubmit} noValidate>
            <div className="intake-card">
              <h3 className="intake-title">Before we start, we need your details</h3>
              <p className="intake-subtitle">
                Fields marked with <span className="required-star">*</span> are required.
              </p>

              <div className="intake-grid">
                <label className="intake-field">
                  <span>Full Name <span className="required-star">*</span></span>
                  <input
                    className={`intake-input ${validationErrors.fullName ? 'input-error' : ''}`}
                    placeholder="e.g. John Doe"
                    value={intake.fullName}
                    onChange={(e) => {
                      setIntake((p) => ({ ...p, fullName: e.target.value }));
                      if (validationErrors.fullName) setValidationErrors(v => ({ ...v, fullName: null }));
                    }}
                    required
                  />
                  {validationErrors.fullName && <span className="error-text">{validationErrors.fullName}</span>}
                </label>

                <label className="intake-field">
                  <span>Email <span className="required-star">*</span></span>
                  <input
                    className={`intake-input ${validationErrors.email ? 'input-error' : ''}`}
                    placeholder="e.g. john@email.com"
                    type="email"
                    value={intake.email}
                    onChange={(e) => {
                      setIntake((p) => ({ ...p, email: e.target.value }));
                      if (validationErrors.email) setValidationErrors(v => ({ ...v, email: null }));
                    }}
                    required
                  />
                  {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
                </label>

                <div className="intake-field" ref={phoneRef}>
                  <span>Phone Number <span className="required-star">*</span></span>
                  <div className="phone-input-group">
                    <div className="custom-select-wrapper">
                      <div 
                        className={`custom-select-trigger ${isPhoneCodeOpen ? 'open' : ''}`}
                        onClick={() => setIsPhoneCodeOpen(!isPhoneCodeOpen)}
                      >
                        <span className="selected-text">
                          {COUNTRY_CODES.find(c => c.code === phoneCode)?.name} ({phoneCode})
                        </span>
                        <iconify-icon 
                          icon="ri:arrow-down-s-line" 
                          className={`select-chevron ${isPhoneCodeOpen ? 'rotated' : ''}`}
                        ></iconify-icon>
                      </div>
                      {isPhoneCodeOpen && (
                        <div className="custom-select-options">
                          {COUNTRY_CODES.map(c => (
                            <div 
                              key={c.code} 
                              className={`custom-option ${phoneCode === c.code ? 'active' : ''}`}
                              onClick={() => {
                                setPhoneCode(c.code);
                                setIsPhoneCodeOpen(false);
                              }}
                            >
                              {c.name} ({c.code})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      className={`intake-input ${validationErrors.phone ? 'input-error' : ''}`}
                      placeholder="e.g. 7000 000000"
                      value={intake.phone}
                      onChange={(e) => {
                        setIntake((p) => ({ ...p, phone: e.target.value }));
                        if (validationErrors.phone) setValidationErrors(v => ({ ...v, phone: null }));
                      }}
                      required
                    />
                  </div>
                  {validationErrors.phone && <span className="error-text">{validationErrors.phone}</span>}
                </div>

                <div className="intake-field" ref={countryRef}>
                  <span>Country <span className="required-star">*</span></span>
                  <div className="custom-select-wrapper">
                    <div 
                      className={`custom-select-trigger ${validationErrors.country ? 'input-error' : ''} ${isCountryOpen ? 'open' : ''}`}
                      onClick={() => setIsCountryOpen(!isCountryOpen)}
                    >
                      <span className="selected-text">
                        {intake.country || "Select Country"}
                      </span>
                      <iconify-icon 
                        icon="ri:arrow-down-s-line" 
                        className={`select-chevron ${isCountryOpen ? 'rotated' : ''}`}
                      ></iconify-icon>
                    </div>
                    {isCountryOpen && (
                      <div className="custom-select-options">
                        <div 
                          className="custom-option"
                          onClick={() => {
                            setIntake(p => ({ ...p, country: "" }));
                            setIsCountryOpen(false);
                          }}
                        >
                          Select Country
                        </div>
                        {COMMON_COUNTRIES.map(c => (
                          <div 
                            key={c} 
                            className={`custom-option ${intake.country === c ? 'active' : ''}`}
                            onClick={() => {
                              setIntake(p => ({ ...p, country: c }));
                              setValidationErrors(v => ({ ...v, country: null }));
                              setIsCountryOpen(false);
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {validationErrors.country && <span className="error-text">{validationErrors.country}</span>}
                </div>
              </div>

              <label className="intake-field intake-field-full">
                <span>Degree or Program of Interest <span className="required-star">*</span></span>
                <input
                  className={`intake-input ${validationErrors.programInterest ? 'input-error' : ''}`}
                  placeholder="e.g. MSc Data Science"
                  value={intake.programInterest}
                  onChange={(e) => {
                    setIntake((p) => ({ ...p, programInterest: e.target.value }));
                    if (validationErrors.programInterest) setValidationErrors(v => ({ ...v, programInterest: null }));
                  }}
                  required
                />
                {validationErrors.programInterest && <span className="error-text">{validationErrors.programInterest}</span>}
              </label>

              <div className="intake-grid">
                <label className="intake-field">
                  <span>Current/Last Qualification</span>
                  <input
                    className="intake-input"
                    placeholder="e.g. Bachelor of Engineering"
                    value={intake.lastQualification}
                    onChange={(e) => setIntake((p) => ({ ...p, lastQualification: e.target.value }))}
                  />
                </label>

                <label className="intake-field">
                  <span>GPA or Final Grade</span>
                  <input
                    className="intake-input"
                    placeholder="e.g. 3.5/4.0 or 75%"
                    value={intake.gpa}
                    onChange={(e) => setIntake((p) => ({ ...p, gpa: e.target.value }))}
                  />
                </label>
              </div>

              <div className="privacy-checkbox-wrapper">
                <label className="privacy-label">
                  <input 
                    type="checkbox" 
                    checked={agreedToPrivacy}
                    onChange={(e) => {
                      setAgreedToPrivacy(e.target.checked);
                      if (validationErrors.privacy) setValidationErrors(v => ({ ...v, privacy: null }));
                    }}
                  />
                  <span>
                    I agree to the <Link to="/privacy-policy" target="_blank">Privacy Policy</Link> and data handling disclosure.
                  </span>
                </label>
                {validationErrors.privacy && <p className="error-text privacy-error">{validationErrors.privacy}</p>}
              </div>

              <button className="intake-submit-btn" type="submit" disabled={isStarting}>
                {isStarting ? <span className="intake-spinner" /> : "Start Chat"}
              </button>

              {error && <p className="intake-error">{error}</p>}
            </div>
          </form>
        ) : (
          <>
            <div
              className="chat-messages-area"
              ref={messagesContainerRef}
              data-lenis-prevent={embedded ? "true" : undefined}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderType === "user" ? "user" : "bot"}`}
                >
                  <div className="avatar">
                    <iconify-icon
                      icon={
                        msg.senderType === "user"
                          ? "ri:user-smile-line"
                          : "ri:robot-2-line"
                      }
                    ></iconify-icon>
                  </div>
                  <div className="bubble">
                    <div className={`bubble-content-wrapper${msg.senderType === 'bot' && isLongMessage(msg.content) && !collapsedMessages.has(msg.id) ? ' bubble-collapsed' : ''}`}>
                      {renderMessageContent(msg.content)}
                    </div>
                    {msg.senderType === 'bot' && isLongMessage(msg.content) && (
                      <button
                        className="btn-read-more"
                        onClick={() => toggleCollapse(msg.id)}
                      >
                        {collapsedMessages.has(msg.id) ? (
                          <><iconify-icon icon="ri:arrow-up-s-line"></iconify-icon> Show less</>
                        ) : (
                          <><iconify-icon icon="ri:arrow-down-s-line"></iconify-icon> Read more</>
                        )}
                      </button>
                    )}
                    <div className="bubble-footer">
                      <span className="bubble-timestamp">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.senderType !== "user" && (
                        <div className="bubble-actions">
                          <button 
                            className="btn-copy-msg" 
                            onClick={() => copyToClipboard(msg.id, msg.content)}
                            title="Copy response"
                          >
                            <iconify-icon 
                              icon={copySuccess === msg.id ? "ri:check-line" : "ri:clipboard-line"}
                              style={{ color: copySuccess === msg.id ? "#4ade80" : "inherit" }}
                            ></iconify-icon>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              )}

              {showHandoffButtons && session.status === "AI_ACTIVE" && (
                <div className="preset-options">
                  <button
                    className="btn-option"
                    onClick={() => handleEscalationChoice("YES")}
                  >
                    YES - Connect me with an agent
                  </button>
                  <button
                    className="btn-option"
                    onClick={() => handleEscalationChoice("NO")}
                  >
                    NO - End chat
                  </button>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
              {session.status === "ENDED" ? (
                <button className="btn-send" onClick={handleNewSession}>
                  Start New Session
                </button>
              ) : (
                <>
                  <div className="chat-input-wrapper">
                    <input
                      className="chat-input"
                      placeholder="Type your question here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <button
                    className="btn-send"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                  >
                    <iconify-icon
                      icon="ri:send-plane-fill"
                      style={{ fontSize: "20px" }}
                    ></iconify-icon>
                  </button>
                </>
              )}
            </div>
            {error && (
              <p style={{ color: "#fecaca", marginTop: "8px", marginLeft: "12px" }}>
                {error}
              </p>
            )}
          </>
        )}
        </div>
      </div>

      <div className="consultation-footer">
        Developed by <a href="https://aurexone.com/" target="_blank" rel="noopener noreferrer">AurexOne</a>
      </div>

      {showCloseConfirm && (
        <div className="consultation-confirm-overlay" onClick={() => setShowCloseConfirm(false)}>
          <div className="consultation-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="consultation-confirm-icon">
              <iconify-icon icon="ri:error-warning-line"></iconify-icon>
            </div>
            <h3>Close Chat?</h3>
            <p>You have an active chat session. Are you sure you want to close it? Your history will be saved.</p>
            <div className="consultation-confirm-actions">
              <button type="button" className="btn-outline" onClick={() => setShowCloseConfirm(false)}>
                Stay Here
              </button>
              <button type="button" className="btn-apply" onClick={finishCloseChat}>
                Close Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeConsultation;
