import { degreesData } from "../data/degreesData";

// API Configuration
// Use 'http://localhost:5000/api' for local development
// Use your Hostinger domain (e.g., 'https://yourdomain.com/api') for production
const API_BASE_URL =
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000/api"
    : "https://matsol.tech/api";

const SITE_TOKEN = import.meta.env.VITE_SITE_TOKEN || "";

const authHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  "x-site-token": SITE_TOKEN,
  ...extra,
});

export const apiService = {
  getBaseUrl() {
    return API_BASE_URL;
  },
  // Degrees
  async getAllDegrees() {
    try {
      const resp = await fetch(`${API_BASE_URL}/degrees`);
      if (!resp.ok) throw new Error("Backend unreachable");
      return await resp.json();
    } catch (error) {
      console.warn("Using local fallback for Degrees");
      const local = Array.isArray(degreesData) ? degreesData : [];
      const stored = localStorage.getItem("matsols_degrees");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return Promise.resolve(parsed);
          }
        } catch (err) {
          // ignore corrupted cache
        }
      }
      return Promise.resolve(local);
    }
  },

  async getDegreeDetail(slug) {
    try {
      const resp = await fetch(`${API_BASE_URL}/degrees/${slug}`);
      if (!resp.ok) throw new Error("Backend unreachable");
      return await resp.json();
    } catch (error) {
      console.warn("Using local fallback for Degree Detail");
      const stored = localStorage.getItem("matsols_degrees");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const found = Array.isArray(parsed)
            ? parsed.find((d) => d.slug === slug)
            : null;
          if (found) return Promise.resolve(found);
        } catch (err) {
          // ignore corrupted cache
        }
      }
      const degree = degreesData.find((d) => d.slug === slug);
      return Promise.resolve(degree);
    }
  },

  async createDegree(data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/degrees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      if (resp.status === 401 || resp.status === 403) {
        localStorage.removeItem("matsols_token");
        localStorage.removeItem("matsols_user");
        window.location.href = "/login";
        return { error: "Invalid or expired token. Please login again." };
      }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return { error: err?.error || "Failed to create degree.", details: err?.details };
      }
      return await resp.json();
    } catch (error) {
      console.error("Failed to create degree:", error);
      return { error: "Server error" };
    }
  },

  async updateDegree(id, data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/degrees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      if (resp.status === 401 || resp.status === 403) {
        localStorage.removeItem("matsols_token");
        localStorage.removeItem("matsols_user");
        window.location.href = "/login";
        return { error: "Invalid or expired token. Please login again." };
      }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return { error: err?.error || "Failed to update degree.", details: err?.details };
      }
      return await resp.json();
    } catch (error) {
      console.error("Failed to update degree:", error);
      return { error: "Server error" };
    }
  },

  async deleteDegree(id) {
    try {
      const resp = await fetch(`${API_BASE_URL}/degrees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (resp.status === 401 || resp.status === 403) {
        localStorage.removeItem("matsols_token");
        localStorage.removeItem("matsols_user");
        window.location.href = "/login";
        return { error: "Invalid or expired token. Please login again." };
      }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return { error: err?.error || "Failed to delete degree.", details: err?.details };
      }
      return await resp.json();
    } catch (error) {
      console.error("Failed to delete degree:", error);
      return { success: false };
    }
  },

  // Scholarships
  async getScholarships(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.universityId) query.set("universityId", params.universityId);
      if (params.degreeId) query.set("degreeId", params.degreeId);
      if (params.status) query.set("status", params.status);
      const url = `${API_BASE_URL}/scholarships${query.toString() ? `?${query.toString()}` : ""}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("Failed to fetch scholarships");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch scholarships:", error);
      return [];
    }
  },

  async createScholarship(data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/scholarships`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      if (resp.status === 401 || resp.status === 403) {
        localStorage.removeItem("matsols_token");
        localStorage.removeItem("matsols_user");
        window.location.href = "/login";
        return { error: "Invalid or expired token. Please login again." };
      }
      return await resp.json();
    } catch (error) {
      console.error("Failed to create scholarship:", error);
      return { error: "Server error" };
    }
  },

  async updateScholarship(id, data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/scholarships/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      if (resp.status === 401 || resp.status === 403) {
        localStorage.removeItem("matsols_token");
        localStorage.removeItem("matsols_user");
        window.location.href = "/login";
        return { error: "Invalid or expired token. Please login again." };
      }
      return await resp.json();
    } catch (error) {
      console.error("Failed to update scholarship:", error);
      return { error: "Server error" };
    }
  },

  async deleteScholarship(id) {
    try {
      const resp = await fetch(`${API_BASE_URL}/scholarships/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (resp.status === 401 || resp.status === 403) {
        localStorage.removeItem("matsols_token");
        localStorage.removeItem("matsols_user");
        window.location.href = "/login";
        return { error: "Invalid or expired token. Please login again." };
      }
      return await resp.json();
    } catch (error) {
      console.error("Failed to delete scholarship:", error);
      return { success: false };
    }
  },

  // Leads
  async submitLead(leadData) {
    try {
      const resp = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
      return await resp.json();
    } catch (error) {
      console.error("Lead submission failed:", error);
      return Promise.resolve({ success: false, message: "Server error" });
    }
  },

  async getLeads() {
    try {
      const resp = await fetch(`${API_BASE_URL}/leads`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Backend unreachable");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      return Promise.resolve([]);
    }
  },

  async updateLead(id, data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to update lead:", error);
      return Promise.resolve({ success: false });
    }
  },

  async deleteLead(id) {
    try {
      const resp = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to delete lead:", error);
      return Promise.resolve({ success: false });
    }
  },

  async exportLeads(from, to) {
    try {
      let url = `${API_BASE_URL}/leads/export`;
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      if (params.toString()) url += `?${params.toString()}`;

      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });

      if (!resp.ok) throw new Error("Export failed");

      const blob = await resp.blob();
      const disposition = resp.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `leads_export_${new Date().toISOString().split("T")[0]}.xlsx`;
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      return { success: true, filename };
    } catch (error) {
      console.error("Leads export failed:", error);
      return { error: "Failed to export leads. Please try again." };
    }
  },

  // --- Universities ---
  async getUniversities() {
    try {
      const resp = await fetch(`${API_BASE_URL}/universities`);
      if (!resp.ok) throw new Error("Backend unreachable");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch universities:", error);
      return Promise.resolve([]);
    }
  },

  async getUniversityById(id) {
    try {
      const resp = await fetch(`${API_BASE_URL}/universities/${id}`);
      if (!resp.ok) throw new Error("University not found");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch university by ID:", error);
      return null;
    }
  },

  async createUniversity(data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/universities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to create university:", error);
      return Promise.resolve({ success: false });
    }
  },

  async updateUniversity(id, data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/universities/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to update university:", error);
      return Promise.resolve({ success: false });
    }
  },

  async deleteUniversity(id) {
    try {
      const resp = await fetch(`${API_BASE_URL}/universities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to delete university:", error);
      return Promise.resolve({ success: false });
    }
  },

  // AI Chat
  async getAIChatResponse(message, history = []) {
    try {
      const resp = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify({ content: message, history: history }),
      });
      return await resp.json();
    } catch (error) {
      return Promise.resolve({
        content:
          "I'm currently in offline mode. Please check your connection to chat with the live MATSOLS AI.",
      });
    }
  },

  // Public Intake-Gated Chat
  async createPublicChatSession(payload) {
    try {
      const resp = await fetch(`${API_BASE_URL}/public-chat/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await resp.json();
    } catch (error) {
      console.error("Create public chat session failed:", error);
      return { error: "Server connection failed" };
    }
  },

  async getPublicChatMessages(sessionId, visitorToken) {
    try {
      const params = new URLSearchParams({ visitorToken });
      const resp = await fetch(
        `${API_BASE_URL}/public-chat/session/${sessionId}/messages?${params.toString()}`,
      );
      return await resp.json();
    } catch (error) {
      console.error("Fetch public chat messages failed:", error);
      return { error: "Server connection failed", messages: [] };
    }
  },

  async sendPublicChatMessage(sessionId, payload) {
    try {
      const resp = await fetch(`${API_BASE_URL}/public-chat/session/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await resp.json();
    } catch (error) {
      console.error("Send public chat message failed:", error);
      return { error: "Server connection failed" };
    }
  },

  async escalatePublicChat(sessionId, visitorToken) {
    try {
      const resp = await fetch(`${API_BASE_URL}/public-chat/session/${sessionId}/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorToken }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Escalate public chat failed:", error);
      return { error: "Server connection failed" };
    }
  },

  async closePublicChat(sessionId, visitorToken) {
    try {
      const resp = await fetch(`${API_BASE_URL}/public-chat/session/${sessionId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorToken }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Close public chat failed:", error);
      return { error: "Server connection failed" };
    }
  },

  async fetchChatHistory() {
    try {
      const resp = await fetch(`${API_BASE_URL}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch chat history");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      return [];
    }
  },

  // Authentication
  async login(email, password) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Login failed:", error);
      return { error: "Server connection failed" };
    }
  },

  async verifyLoginMfa(mfaToken, otp, recoveryCode = null) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/login/mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken, otp, recoveryCode }),
      });
      return await resp.json();
    } catch (error) {
      console.error("MFA Login Verify Error:", error);
      return { error: "MFA verification failed" };
    }
  },

  async initForgotPassword(email) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/forgot-password/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Forgot password init failed:", error);
      return { error: "Unable to start password reset." };
    }
  },

  async verifyForgotPasswordOtp(resetToken, otp) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, otp }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Forgot password OTP verify failed:", error);
      return { error: "Unable to verify authenticator code." };
    }
  },

  async resetForgotPassword(passwordResetToken, newPassword) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordResetToken, newPassword }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Forgot password reset failed:", error);
      return { error: "Unable to update password." };
    }
  },

  async enrollMfaInit(mfaToken) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/mfa/enroll/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken }),
      });
      return await resp.json();
    } catch (error) {
      return { error: "Enrollment initialization failed" };
    }
  },

  async enrollMfaConfirm(mfaToken, otp, secret) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/mfa/enroll/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken, otp, secret }),
      });
      const contentType = resp.headers.get("content-type") || "";
      let data = {};
      if (contentType.includes("application/json")) {
        data = await resp.json().catch(() => ({}));
      } else {
        const raw = await resp.text().catch(() => "");
        data = { raw };
      }
      if (!resp.ok) {
        console.error("[MFA_ENROLL_CONFIRM_FAILED]", {
          status: resp.status,
          statusText: resp.statusText,
          contentType,
          response: data,
        });
      }
      return { ...data, status: resp.status };
    } catch (error) {
      console.error("[MFA_ENROLL_CONFIRM_ERROR]", error);
      return { error: "Enrollment confirmation failed" };
    }
  },


  async setupMfa() {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/mfa/setup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      return await resp.json();
    } catch (error) {
      console.error("MFA setup init failed:", error);
      return { error: "Server connection failed" };
    }
  },

  async confirmMfa(otp, setupToken = null) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/mfa/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify({ otp, setupToken }),
      });
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return await resp.json();
      }
      const raw = await resp.text();
      return {
        error: resp.ok
          ? "Unexpected server response."
          : `Server error (${resp.status}).`,
        raw,
      };
    } catch (error) {
      console.error("MFA confirmation failed:", error);
      return { error: "Server connection failed" };
    }
  },

  async getProfile() {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (resp.status === 401 || resp.status === 403) return null;
      return await resp.json();
    } catch (error) {
      return null;
    }
  },

  async disableMfa() {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/mfa/disable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      return await resp.json();
    } catch (error) {
      return { error: "Failed to disable MFA" };
    }
  },

  async register(userData) {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return await resp.json();
    } catch (error) {
      console.error("Registration failed:", error);
      return { error: "Server connection failed" };
    }
  },

  // Updates (CMS)
  async getUpdates(options = {}) {
    try {
      const query = new URLSearchParams();
      if (options.publishedOnly) query.set("publishedOnly", "true");
      const url = `${API_BASE_URL}/updates${query.toString() ? `?${query.toString()}` : ""}`;
      const resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Backend unreachable");
      const data = await resp.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (options.disableFallback) {
        console.warn("Updates backend unavailable; fallback disabled for this caller.");
        return [];
      }
      console.warn("Using local fallback for Updates");
      try {
        const saved = localStorage.getItem("matsols_updates");
        if (saved) return JSON.parse(saved);

        const { initialUpdates } = await import("../data/updatesData");
        // Convert object structure to flat array if needed
        if (initialUpdates && !Array.isArray(initialUpdates)) {
          const flat = [
            ...(initialUpdates.hero || []),
            ...(initialUpdates.grid || []),
          ].map((u) => ({
            ...u,
            category: u.badge,
            excerpt: u.desc,
          }));
          return flat;
        }
        return Array.isArray(initialUpdates) ? initialUpdates : [];
      } catch (e) {
        return [];
      }
    }
  },

  async createUpdate(updateData) {
    try {
      const resp = await fetch(`${API_BASE_URL}/updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(updateData),
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to create update:", error);
      return Promise.resolve({ success: false });
    }
  },

  async updateUpdate(id, updateData) {
    try {
      const resp = await fetch(`${API_BASE_URL}/updates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(updateData),
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to update update:", error);
      return { error: "Server error" };
    }
  },

  async deleteUpdate(id) {
    try {
      const resp = await fetch(`${API_BASE_URL}/updates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to delete update:", error);
      return Promise.resolve({ success: false });
    }
  },

  async bulkUpdateAction(action, ids) {
    try {
      const resp = await fetch(`${API_BASE_URL}/updates/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify({ action, ids }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to perform bulk update action:", error);
      return { error: "Server error" };
    }
  },
  // --- Applications ---
  async getApplications() {
    try {
      const resp = await fetch(`${API_BASE_URL}/applications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch applications");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      return [];
    }
  },

  async createApplication(data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to create application:", error);
      return { error: "Server error" };
    }
  },

  // --- Documents ---
  async getDocuments() {
    try {
      const resp = await fetch(`${API_BASE_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch documents");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      return [];
    }
  },

  async uploadDocument(data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to upload document:", error);
      return { error: "Server error" };
    }
  },

  // --- Admin Analytics ---
  async getAdminStats() {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch admin stats");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      return null;
    }
  },

  async getAdminCharts() {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/charts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch admin charts");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch admin charts:", error);
      return null;
    }
  },

  // --- System Settings ---
  async getSettings() {
    try {
      const resp = await fetch(`${API_BASE_URL}/settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch settings");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return null;
    }
  },

  async getPublicSettings() {
    try {
      const resp = await fetch(`${API_BASE_URL}/settings/public`);
      if (!resp.ok) throw new Error("Failed to fetch public settings");
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch public settings:", error);
      return null;
    }
  },

  async updateSettings(data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      return await resp.json();
    } catch (error) {
      console.error("Failed to update settings:", error);
      return { error: "Server error" };
    }
  },

  // --- Profile & Dashboard ---
  async getProfile() {
    try {
      const resp = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch profile");
      return await resp.json();
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      return null;
    }
  },

  async updateProfile(data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      return await resp.json();
    } catch (error) {
      console.error("Profile Update Error:", error);
      return { error: "Server error" };
    }
  },

  async getDashboardSummary() {
    try {
      const resp = await fetch(`${API_BASE_URL}/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch dashboard summary");
      return await resp.json();
    } catch (error) {
      console.error("Dashboard Summary Error:", error);
      return null;
    }
  },

  // --- Admin Application & Document Management ---
  async getAdminApplications() {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/applications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch admin applications");
      return await resp.json();
    } catch (error) {
      console.error("Admin Applications Fetch Error:", error);
      return [];
    }
  },

  async updateApplicationStatus(id, data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin Application Update Error:", error);
      return { error: "Server error" };
    }
  },

  async getAdminDocuments() {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/documents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch admin documents");
      return await resp.json();
    } catch (error) {
      console.error("Admin Documents Fetch Error:", error);
      return [];
    }
  },

  async updateDocumentStatus(id, data) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/documents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(data),
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin Document Update Error:", error);
      return { error: "Server error" };
    }
  },

  // --- User Management ---
  async getUsers() {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch users");
      return await resp.json();
    } catch (error) {
      console.error("Admin Users Fetch Error:", error);
      return [];
    }
  },

  async updateUserRole(id, role) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify({ role }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin User Role Update Error:", error);
      return { error: "Server error" };
    }
  },

  async createAdminUser(userData) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(userData),
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin User Creation Error:", error);
      return { error: "Server connection failed" };
    }
  },

  async deleteAdminUser(id) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin User Deletion Error:", error);
      return { error: "Server error" };
    }
  },

  async getSecurityEvents() {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/security-events`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch security events");
      return await resp.json();
    } catch (error) {
      console.error("Security events fetch error:", error);
      return [];
    }
  },

  // --- Admin Chat Queue ---
  async getAdminChatQueue() {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/chat-queue`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to fetch chat queue");
      return await resp.json();
    } catch (error) {
      console.error("Admin chat queue fetch error:", error);
      return [];
    }
  },

  async getAdminChatSession(sessionId) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/chat-queue/${sessionId}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin chat session fetch error:", error);
      return { error: "Server connection failed" };
    }
  },

  async acceptAdminChat(sessionId, assignedAgentId = null) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/chat-queue/${sessionId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(assignedAgentId ? { assignedAgentId } : {}),
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin chat accept error:", error);
      return { error: "Server connection failed" };
    }
  },

  async updateAdminChatEta(sessionId, payload) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/chat-queue/${sessionId}/eta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify(payload),
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin chat ETA update error:", error);
      return { error: "Server connection failed" };
    }
  },

  async sendAdminChatMessage(sessionId, content) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/chat-queue/${sessionId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
        body: JSON.stringify({ content }),
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin chat send message error:", error);
      return { error: "Server connection failed" };
    }
  },

  async closeAdminChatSession(sessionId) {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/chat-queue/${sessionId}/close`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("matsols_token")}`,
        },
      });
      return await resp.json();
    } catch (error) {
      console.error("Admin chat close session error:", error);
      return { error: "Server connection failed" };
    }
  },

  async uploadImage(file) {
    try {
      const token =
        localStorage.getItem("matsols_token") || localStorage.getItem("token");
      if (!token) {
        return { error: "Missing auth token. Please login again." };
      }

      const formData = new FormData();
      formData.append("image", file);

      const resp = await fetch(`${API_BASE_URL}/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (resp.status === 401 || resp.status === 403) {
        localStorage.removeItem("matsols_token");
        localStorage.removeItem("matsols_user");
        window.location.href = "/login";
        return { error: "Invalid or expired token. Please login again." };
      }

      const data = await resp.json();
      if (!resp.ok) {
        return { error: data?.error || "Image upload failed." };
      }
      return data;
    } catch (error) {
      console.error("Image upload failed:", error);
      return { error: "Server connection failed" };
    }
  },

  async deleteImage(payload) {
    try {
      const token =
        localStorage.getItem("matsols_token") || localStorage.getItem("token");
      if (!token) {
        return { error: "Missing auth token. Please login again." };
      }

      const resp = await fetch(`${API_BASE_URL}/uploads/image/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (resp.status === 401 || resp.status === 403) {
        localStorage.removeItem("matsols_token");
        localStorage.removeItem("matsols_user");
        window.location.href = "/login";
        return { error: "Invalid or expired token. Please login again." };
      }

      const data = await resp.json();
      if (!resp.ok) {
        return { error: data?.error || "Image delete failed." };
      }
      return data;
    } catch (error) {
      console.error("Image delete failed:", error);
      return { error: "Server connection failed" };
    }
  },
};
