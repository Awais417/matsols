import React, { useEffect, useRef, useState } from "react";
import { apiService } from "../../services/api";
import "./SystemSettings.css";

const SETTINGS_DEFAULTS = {
  supportEmail: "support@matsols.com",
  supportPhone: "",
  brandName: "MATSOLS",
  logoUrl: "",
  primaryColor: "#ff863c",
  secondaryColor: "#0f172a",
  notificationsEnabled: true,
  notificationSenderName: "MATSOLS",
  notificationSenderEmail: "support@matsols.com",
  smtpHost: "",
  smtpPort: "587",
  smtpUsername: "",
  smtpPassword: "",
  aiApiKey: "",
  aiModel: "gpt-4o-mini",
  aiTemperature: 0.4,
  aiMaxTokens: 350,
  aiSystemPrompt: "",
  aiKnowledgeBaseNotes: "",
  aiHandoffEnabled: true,
  aiChatLimit: 30,
  officeAddress: "Birmingham, United Kingdom",
  applicationPackages: "",
  staffInfo: "",
  emailApiKey: "",
  webhookUrl: "",
  webhookSecret: "",
};

const SECTION_META = [
  {
    icon: "ri:customer-service-2-line",
    title: "Support & Contact",
    description: "Configure the official support line shown across the platform.",
  },
  {
    icon: "ri:robot-2-line",
    title: "AI Configuration",
    description: "Control advisor model behavior, prompt overrides, and response limits.",
  },
  {
    icon: "ri:palette-line",
    title: "Branding & Theme",
    description: "Store the core brand identity and appearance settings.",
  },
  {
    icon: "ri:mail-settings-line",
    title: "Email & Notifications",
    description: "Manage sender identity and SMTP credentials for outbound mail.",
  },
  {
    icon: "ri:link",
    title: "Integrations & API Keys",
    description: "Manage webhook endpoints and third-party integration credentials.",
  },
  {
    icon: "ri:database-2-line",
    title: "Operations & Data",
    description: "Use import/export tools directly from the admin settings panel.",
  },
];

const SystemSettings = () => {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingLeads, setExportingLeads] = useState(false);
  const [message, setMessage] = useState(null);
  const importRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await apiService.getSettings();
      if (data) {
        setSettings({ ...SETTINGS_DEFAULTS, ...data });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const setFlashMessage = (type, text) => {
    setMessage({ type, text });
    window.clearTimeout(setFlashMessage.timer);
    setFlashMessage.timer = window.setTimeout(() => setMessage(null), 3500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value
            : value,
    }));
  };

  const handleColorChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...settings,
        aiTemperature: Number(settings.aiTemperature),
        aiMaxTokens: Number(settings.aiMaxTokens),
      };
      const result = await apiService.updateSettings(payload);
      if (result?.error) {
        setFlashMessage("error", result.error);
      } else {
        setSettings({ ...SETTINGS_DEFAULTS, ...result });
        setFlashMessage("success", "System settings updated successfully.");
      }
    } catch {
      setFlashMessage("error", "Critical connection error.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `system_settings_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setFlashMessage("success", "Settings export started.");
  };

  const handleImportClick = () => {
    importRef.current?.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      setSettings((prev) => ({
        ...prev,
        ...SETTINGS_DEFAULTS,
        ...parsed,
      }));
      setFlashMessage("success", "Settings imported into the form. Save to apply.");
    } catch {
      setFlashMessage("error", "Invalid settings file.");
    } finally {
      e.target.value = "";
    }
  };

  const handleExportLeads = async () => {
    setExportingLeads(true);
    try {
      const result = await apiService.exportLeads("", "");
      if (result?.error) {
        setFlashMessage("error", result.error);
      } else {
        setFlashMessage("success", "Leads export downloaded.");
      }
    } catch {
      setFlashMessage("error", "Failed to export leads.");
    } finally {
      setExportingLeads(false);
    }
  };

  if (loading) {
    return (
      <div className="fuckin-loader-overlay">
        <div className="fuckin-loader"></div>
        <div className="loader-text">Loading Portal Configuration...</div>
      </div>
    );
  }

  return (
    <div className="admin-content fade-in system-settings-page">
      <div className="admin-header">
        <div className="admin-title">
          <h1>System Settings</h1>
          <p>Manage operational, AI, branding, notification, and integration settings.</p>
        </div>
        <button
          className={`btn-apply ${saving ? "loading" : ""}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`system-settings-flash ${message.type}`}>{message.text}</div>
      )}

      <div className="system-settings-grid">
        <section className="system-settings-card">
          <div className="system-settings-card-head">
            <iconify-icon icon={SECTION_META[0].icon}></iconify-icon>
            <div>
              <h3>{SECTION_META[0].title}</h3>
              <p>{SECTION_META[0].description}</p>
            </div>
          </div>

          <div className="system-settings-field">
            <label>Support Email</label>
            <input
              type="email"
              name="supportEmail"
              className="ai-input"
              value={settings.supportEmail}
              onChange={handleChange}
              placeholder="support@matsols.com"
            />
          </div>

          <div className="system-settings-field">
            <label>Support Phone</label>
            <input
              type="text"
              name="supportPhone"
              className="ai-input"
              value={settings.supportPhone}
              onChange={handleChange}
              placeholder="Enter official support line"
            />
          </div>
        </section>

        <section className="system-settings-card system-settings-card-wide">
          <div className="system-settings-card-head">
            <iconify-icon icon={SECTION_META[1].icon}></iconify-icon>
            <div>
              <h3>{SECTION_META[1].title}</h3>
              <p>{SECTION_META[1].description}</p>
            </div>
          </div>

          <div className="system-settings-row">
            <div className="system-settings-field">
              <label>AI Model</label>
              <select
                name="aiModel"
                className="ai-input system-settings-select"
                value={settings.aiModel}
                onChange={handleChange}
              >
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                <option value="gpt-4.1">gpt-4.1</option>
              </select>
            </div>

            <div className="system-settings-field">
              <label>Temperature</label>
              <input
                type="number"
                name="aiTemperature"
                className="ai-input"
                min="0"
                max="2"
                step="0.1"
                value={settings.aiTemperature}
                onChange={handleChange}
              />
            </div>

            <div className="system-settings-field">
              <label>Max Tokens</label>
              <input
                type="number"
                name="aiMaxTokens"
                className="ai-input"
                min="50"
                max="4000"
                step="1"
                value={settings.aiMaxTokens}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="system-settings-toggle">
            <label htmlFor="aiHandoffEnabled">Human handoff enabled</label>
            <input
              id="aiHandoffEnabled"
              type="checkbox"
              name="aiHandoffEnabled"
              checked={settings.aiHandoffEnabled}
              onChange={handleChange}
            />
          </div>

          <div className="system-settings-row">
            <div className="system-settings-field">
              <label>Chat Message Limit (per session)</label>
              <input
                type="number"
                name="aiChatLimit"
                className="ai-input"
                min="1"
                max="500"
                value={settings.aiChatLimit}
                onChange={handleChange}
                placeholder="Default: 30"
              />
              <p className="field-hint">Maximum number of conversation turns before prompting handoff.</p>
            </div>
          </div>

          <div className="system-settings-field">
            <label>AI API Key Override</label>
            <input
              type="password"
              name="aiApiKey"
              className="ai-input"
              value={settings.aiApiKey}
              onChange={handleChange}
              placeholder="Leave blank to use server environment key"
            />
          </div>

          <div className="system-settings-field">
            <label>AI System Prompt Overrides</label>
            <textarea
              name="aiSystemPrompt"
              className="ai-input system-settings-textarea"
              value={settings.aiSystemPrompt}
              onChange={handleChange}
              placeholder="Add admin-level prompt instructions for the advisor."
            />
          </div>

          <div className="system-settings-field">
            <label>AI Knowledge Base Notes</label>
            <textarea
              name="aiKnowledgeBaseNotes"
              className="ai-input system-settings-textarea"
              value={settings.aiKnowledgeBaseNotes}
              onChange={handleChange}
              placeholder="Add notes the AI should treat as extra admin-managed knowledge."
            />
          </div>

          <div className="system-settings-field">
            <label>Application Package Specifications</label>
            <textarea
              name="applicationPackages"
              className="ai-input system-settings-textarea"
              value={settings.applicationPackages}
              onChange={handleChange}
              placeholder="Define tiers, pricing, and inclusions (e.g. Standard: £0, Premium: £X)."
            />
          </div>
        </section>

        <section className="system-settings-card">
          <div className="system-settings-card-head">
            <iconify-icon icon="ri:building-line"></iconify-icon>
            <div>
              <h3>Corporate & Team Info</h3>
              <p>Manage public-facing office and staff details.</p>
            </div>
          </div>

          <div className="system-settings-field">
            <label>Full Office Address</label>
            <input
              type="text"
              name="officeAddress"
              className="ai-input"
              value={settings.officeAddress}
              onChange={handleChange}
              placeholder="e.g. Suite 4, 123 Business Way, Birmingham, B1 1AA"
            />
          </div>

          <div className="system-settings-field">
            <label>Founder & Staff Information</label>
            <textarea
              name="staffInfo"
              className="ai-input system-settings-textarea"
              value={settings.staffInfo}
              onChange={handleChange}
              placeholder="List key team members or leadership bios to be shared by the AI."
            />
          </div>
        </section>

        <section className="system-settings-card">
          <div className="system-settings-card-head">
            <iconify-icon icon={SECTION_META[2].icon}></iconify-icon>
            <div>
              <h3>{SECTION_META[2].title}</h3>
              <p>{SECTION_META[2].description}</p>
            </div>
          </div>

          <div className="system-settings-field">
            <label>Brand Name</label>
            <input
              type="text"
              name="brandName"
              className="ai-input"
              value={settings.brandName}
              onChange={handleChange}
            />
          </div>

          <div className="system-settings-field">
            <label>Logo URL</label>
            <input
              type="text"
              name="logoUrl"
              className="ai-input"
              value={settings.logoUrl}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="system-settings-row">
            <div className="system-settings-field">
              <label>Primary Color</label>
              <div className="system-settings-color">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                />
                <input
                  type="text"
                  className="ai-input"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="system-settings-field">
              <label>Secondary Color</label>
              <div className="system-settings-color">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                />
                <input
                  type="text"
                  className="ai-input"
                  name="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="system-settings-card">
          <div className="system-settings-card-head">
            <iconify-icon icon={SECTION_META[3].icon}></iconify-icon>
            <div>
              <h3>{SECTION_META[3].title}</h3>
              <p>{SECTION_META[3].description}</p>
            </div>
          </div>

          <div className="system-settings-toggle">
            <label htmlFor="notificationsEnabled">Email notifications enabled</label>
            <input
              id="notificationsEnabled"
              type="checkbox"
              name="notificationsEnabled"
              checked={settings.notificationsEnabled}
              onChange={handleChange}
            />
          </div>

          <div className="system-settings-row">
            <div className="system-settings-field">
              <label>Sender Name</label>
              <input
                type="text"
                name="notificationSenderName"
                className="ai-input"
                value={settings.notificationSenderName}
                onChange={handleChange}
              />
            </div>

            <div className="system-settings-field">
              <label>Sender Email</label>
              <input
                type="email"
                name="notificationSenderEmail"
                className="ai-input"
                value={settings.notificationSenderEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="system-settings-row">
            <div className="system-settings-field">
              <label>SMTP Host</label>
              <input
                type="text"
                name="smtpHost"
                className="ai-input"
                value={settings.smtpHost}
                onChange={handleChange}
              />
            </div>

            <div className="system-settings-field">
              <label>SMTP Port</label>
              <input
                type="text"
                name="smtpPort"
                className="ai-input"
                value={settings.smtpPort}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="system-settings-row">
            <div className="system-settings-field">
              <label>SMTP Username</label>
              <input
                type="text"
                name="smtpUsername"
                className="ai-input"
                value={settings.smtpUsername}
                onChange={handleChange}
              />
            </div>

            <div className="system-settings-field">
              <label>SMTP Password</label>
              <input
                type="password"
                name="smtpPassword"
                className="ai-input"
                value={settings.smtpPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section className="system-settings-card">
          <div className="system-settings-card-head">
            <iconify-icon icon={SECTION_META[4].icon}></iconify-icon>
            <div>
              <h3>{SECTION_META[4].title}</h3>
              <p>{SECTION_META[4].description}</p>
            </div>
          </div>

          <div className="system-settings-field">
            <label>Email Service API Key</label>
            <input
              type="password"
              name="emailApiKey"
              className="ai-input"
              value={settings.emailApiKey}
              onChange={handleChange}
            />
          </div>

          <div className="system-settings-field">
            <label>Webhook URL</label>
            <input
              type="text"
              name="webhookUrl"
              className="ai-input"
              value={settings.webhookUrl}
              onChange={handleChange}
              placeholder="https://example.com/webhooks/matsols"
            />
          </div>

          <div className="system-settings-field">
            <label>Webhook Secret</label>
            <input
              type="password"
              name="webhookSecret"
              className="ai-input"
              value={settings.webhookSecret}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="system-settings-card">
          <div className="system-settings-card-head">
            <iconify-icon icon={SECTION_META[5].icon}></iconify-icon>
            <div>
              <h3>{SECTION_META[5].title}</h3>
              <p>{SECTION_META[5].description}</p>
            </div>
          </div>

          <div className="system-settings-actions">
            <button type="button" className="btn-outline system-settings-action-btn" onClick={handleExportSettings}>
              Export Settings JSON
            </button>
            <button type="button" className="btn-outline system-settings-action-btn" onClick={handleImportClick}>
              Import Settings JSON
            </button>
            <button
              type="button"
              className="btn-apply system-settings-action-btn"
              onClick={handleExportLeads}
              disabled={exportingLeads}
            >
              {exportingLeads ? "Exporting..." : "Export Leads Data"}
            </button>
          </div>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            className="system-settings-hidden-input"
            onChange={handleImportFile}
          />
        </section>
      </div>
    </div>
  );
};

export default SystemSettings;
