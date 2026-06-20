import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "../../services/api";
import "./ScholarshipManagement.css";

const ScholarshipManagement = () => {
  const [scholarships, setScholarships] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [extraInfoFields, setExtraInfoFields] = useState([]);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const initialState = {
    title: "",
    description: "",
    amount: "",
    eligibility: "",
    deadline: "",
    image: "",
    ctaLink: "",
    status: "Active",
    additionalInfo: "[]",
    universityId: "",
    degreeId: "",
  };

  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const shouldShowAmount = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized) return false;
    return !/^\d+$/.test(normalized);
  };

  const filteredDegrees = useMemo(() => {
    if (!form.universityId) return degrees;
    return degrees.filter((d) => d.universityId === form.universityId);
  }, [degrees, form.universityId]);

  const filteredScholarships = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scholarships.filter((item) => {
      const matchesQuery =
        !query ||
        [
          item.title,
          item.description,
          item.amount,
          item.eligibility,
          item.deadline,
          item.ctaLink,
          item.university?.name,
          item.degree?.name,
          item.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesUniversity =
        universityFilter === "all" || item.universityId === universityFilter;

      return matchesQuery && matchesStatus && matchesUniversity;
    });
  }, [scholarships, searchQuery, statusFilter, universityFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schData, uniData, degData] = await Promise.all([
        apiService.getScholarships(),
        apiService.getUniversities(),
        apiService.getAllDegrees(),
      ]);
      setScholarships(Array.isArray(schData) ? schData : []);
      setUniversities(Array.isArray(uniData) ? uniData : []);
      setDegrees(Array.isArray(degData) ? degData : []);
    } catch (error) {
      console.error("Failed to fetch scholarship management data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const safeParseExtraInfo = (value) => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleAddExtraField = () => {
    setExtraInfoFields((prev) => [...prev, { label: "", value: "" }]);
  };

  const handleExtraFieldChange = (index, key, value) => {
    setExtraInfoFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleRemoveExtraField = (index) => {
    setExtraInfoFields((prev) => prev.filter((_, idx) => idx !== index));
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      const parsedExtra = safeParseExtraInfo(item.additionalInfo);
      setExtraInfoFields(parsedExtra);
      setForm({
        title: item.title || "",
        description: item.description || "",
        amount: item.amount || "",
        eligibility: item.eligibility || "",
        deadline: item.deadline || "",
        image: item.image || "",
        ctaLink: item.ctaLink || "",
        status: item.status || "Active",
        additionalInfo: item.additionalInfo || "[]",
        universityId: item.universityId || "",
        degreeId: item.degreeId || "",
      });
    } else {
      setEditingId(null);
      setForm(initialState);
      setExtraInfoFields([]);
    }
    setIsModalOpen(true);
  };

  const saveScholarship = async (e) => {
    e.preventDefault();
    const cleanedExtraInfo = extraInfoFields.filter(
      (field) => (field.label || "").trim() !== "" && (field.value || "").trim() !== "",
    );

    const payload = {
      ...form,
      additionalInfo: JSON.stringify(cleanedExtraInfo),
      universityId: form.universityId || null,
      degreeId: form.degreeId || null,
    };

    const resp = editingId
      ? await apiService.updateScholarship(editingId, payload)
      : await apiService.createScholarship(payload);

    if (resp?.error) {
      setToast({ type: "error", text: resp.error });
      return;
    }

    setIsModalOpen(false);
    setForm(initialState);
    setExtraInfoFields([]);
    setEditingId(null);
    await fetchData();
    setToast({ type: "success", text: editingId ? "Scholarship updated." : "Scholarship created." });
  };

  const deleteScholarship = (item) => {
    setDeleteTarget(item);
  };

  const confirmDeleteScholarship = async () => {
    if (!deleteTarget?.id) return;
    await apiService.deleteScholarship(deleteTarget.id);
    await fetchData();
    setToast({ type: "success", text: "Scholarship deleted." });
    setDeleteTarget(null);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setImageUploading(true);
    const resp = await apiService.uploadImage(file);
    if (resp?.url) {
      setForm((prev) => ({ ...prev, image: resp.url }));
      setToast({ type: "success", text: "Image uploaded." });
    } else {
      setToast({ type: "error", text: resp?.error || "Image upload failed." });
    }
    setImageUploading(false);
  };

  const handleDeleteImage = async () => {
    if (!form.image) return;
    const resp = await apiService.deleteImage({ url: form.image });
    if (resp?.success || resp?.result === "not found") {
      setForm((prev) => ({ ...prev, image: "" }));
      setToast({ type: "success", text: "Uploaded image removed." });
    } else {
      setToast({ type: "error", text: resp?.error || "Failed to delete image." });
    }
  };

  const renderScholarshipDetails = (item) => (
    <div className="scholarship-visible-details">
      {shouldShowAmount(item.amount) && (
        <div className="scholarship-visible-detail">
          <span className="scholarship-visible-label">Amount:</span> {item.amount}
        </div>
      )}
      {item.deadline && (
        <div className="scholarship-visible-detail">
          <span className="scholarship-visible-label">Deadline:</span> {item.deadline}
        </div>
      )}
      {item.eligibility && (
        <div className="scholarship-visible-detail">
          <span className="scholarship-visible-label">Eligibility:</span> {item.eligibility}
        </div>
      )}
      {item.description && (
        <div className="scholarship-visible-detail">
          <span className="scholarship-visible-label">Description:</span> {item.description}
        </div>
      )}
      {item.ctaLink && (
        <div className="scholarship-visible-detail">
          <span className="scholarship-visible-label">Application Link:</span>{" "}
          <a href={item.ctaLink} target="_blank" rel="noreferrer" className="scholarship-visible-link">
            {item.ctaLink}
          </a>
        </div>
      )}
    </div>
  );

  if (loading && scholarships.length === 0) {
    return (
      <div className="fuckin-loader-overlay">
        <div className="fuckin-loader"></div>
        <div className="loader-text">Loading Scholarship Management...</div>
      </div>
    );
  }

  return (
    <div className="admin-content scholarship-management-page">
      {toast && <div className={`scholarship-toast scholarship-toast-${toast.type}`}>{toast.text}</div>}
      <div className="admin-header">
        <div className="admin-title scholarship-header-copy">
          <h1>Scholarship Management</h1>
          <p>Create scholarships linked to universities and specific degrees.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Add Scholarship
        </button>
      </div>

      <div className="admin-table-wrapper">
        <div className="scholarship-list-toolbar">
          <input
            type="text"
            className="ai-input scholarship-search-input"
            placeholder="Search scholarships"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="scholarship-select scholarship-toolbar-select"
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
          >
            <option value="all">All universities</option>
            {universities.map((u) => (
              <option key={`filter-uni-${u.id}`} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select
            className="scholarship-select scholarship-toolbar-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>University</th>
              <th>Degree</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredScholarships.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  {renderScholarshipDetails(item)}
                </td>
                <td>{item.university?.name || "Not linked"}</td>
                <td>{item.degree?.name || "Not linked"}</td>
                <td>{item.status}</td>
                <td>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => openModal(item)}
                      style={{ background: "none", border: "none", color: "#06b6d4", cursor: "pointer", fontWeight: "600" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteScholarship(item)}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "600" }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredScholarships.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  No scholarships found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="scholarship-mobile-list">
        <div className="scholarship-list-toolbar scholarship-list-toolbar-mobile">
          <input
            type="text"
            className="ai-input scholarship-search-input"
            placeholder="Search scholarships"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="scholarship-select scholarship-toolbar-select"
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
          >
            <option value="all">All universities</option>
            {universities.map((u) => (
              <option key={`mobile-filter-uni-${u.id}`} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select
            className="scholarship-select scholarship-toolbar-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {filteredScholarships.map((item) => (
          <article key={`mobile-${item.id}`} className="scholarship-mobile-card">
            <h4>{item.title}</h4>
            <p><strong>University:</strong> {item.university?.name || "Not linked"}</p>
            <p><strong>Degree:</strong> {item.degree?.name || "Not linked"}</p>
            <p><strong>Status:</strong> {item.status}</p>
            {renderScholarshipDetails(item)}
            <div className="scholarship-mobile-actions">
              <button onClick={() => openModal(item)} className="scholarship-inline-edit">
                Edit
              </button>
              <button onClick={() => deleteScholarship(item)} className="scholarship-inline-delete">
                Delete
              </button>
            </div>
          </article>
        ))}
        {filteredScholarships.length === 0 && (
          <div className="scholarship-mobile-empty">No scholarships found.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal scholarship-modal">
            <div className="modal-header">
              <h3>{editingId ? "Edit Scholarship" : "Add Scholarship"}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <iconify-icon icon="ri:close-line"></iconify-icon>
              </button>
            </div>
            <form onSubmit={saveScholarship} className="scholarship-form">
              <div className="modal-body scholarship-modal-body">
                <div className="form-group scholarship-field">
                  <label className="scholarship-label">Scholarship Title</label>
                  <input
                    className="ai-input"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={{ color: "#1e293b" }}
                  />
                </div>

                <div className="admin-form-row scholarship-grid">
                  <div className="form-group scholarship-field">
                    <label className="scholarship-label">University Link</label>
                    <select
                      className="scholarship-select"
                      value={form.universityId}
                      onChange={(e) => setForm({ ...form, universityId: e.target.value, degreeId: "" })}
                      style={{ color: "#1e293b" }}
                    >
                      <option value="">No university link</option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group scholarship-field">
                    <label className="scholarship-label">Degree Link</label>
                    <select
                      className="scholarship-select"
                      value={form.degreeId}
                      onChange={(e) => setForm({ ...form, degreeId: e.target.value })}
                      style={{ color: "#1e293b" }}
                    >
                      <option value="">No degree link</option>
                      {filteredDegrees.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-row scholarship-grid">
                  <div className="form-group scholarship-field">
                    <label className="scholarship-label">Amount / Coverage</label>
                    <input
                      className="ai-input"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="e.g. 30% tuition waiver"
                      style={{ color: "#1e293b" }}
                    />
                  </div>
                  <div className="form-group scholarship-field">
                    <label className="scholarship-label">Deadline</label>
                    <input
                      className="ai-input"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      placeholder="e.g. 30 Sep 2026"
                      style={{ color: "#1e293b" }}
                    />
                  </div>
                </div>

                <div className="form-group scholarship-field">
                  <label className="scholarship-label">Eligibility</label>
                  <textarea
                    className="ai-input"
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="Eligibility criteria..."
                    style={{ color: "#1e293b", minHeight: "70px", resize: "vertical", padding: "10px" }}
                  />
                </div>

                <div className="form-group scholarship-field">
                  <label className="scholarship-label">Description</label>
                  <textarea
                    className="ai-input"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ color: "#1e293b", minHeight: "80px", resize: "vertical", padding: "10px" }}
                  />
                </div>

                <div className="admin-form-row scholarship-grid">
                  <div className="form-group scholarship-field">
                    <label className="scholarship-label">CTA Link</label>
                    <input
                      className="ai-input"
                      value={form.ctaLink}
                      onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                      placeholder="/free-consultation"
                      style={{ color: "#1e293b" }}
                    />
                  </div>
                  <div className="form-group scholarship-field">
                    <label className="scholarship-label">Status</label>
                    <select
                      className="scholarship-select"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      style={{ color: "#1e293b" }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group scholarship-field">
                  <label className="scholarship-label">Scholarship Image</label>
                  <input
                    className="ai-input"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    style={{ color: "#1e293b" }}
                  />
                  <div className="scholarship-upload-row">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e.target.files?.[0])}
                      style={{ color: "#1e293b", fontSize: "12px" }}
                    />
                    {imageUploading && <small className="scholarship-upload-hint">Uploading image...</small>}
                  </div>
                  {form.image && (
                    <div className="scholarship-preview-row">
                      <img src={form.image} alt="Scholarship" className="scholarship-preview-image" />
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="scholarship-delete-image-btn"
                      >
                        Delete Uploaded Image
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group scholarship-field">
                  <div className="scholarship-additional-header">
                    <label className="scholarship-label">Additional Information</label>
                    <button type="button" onClick={handleAddExtraField} className="scholarship-add-field-btn">
                      + Add Field
                    </button>
                  </div>
                  {extraInfoFields.length === 0 && (
                    <small className="scholarship-upload-hint">Add custom details like type, CGPA, nationality, intake, etc.</small>
                  )}
                  {extraInfoFields.map((field, idx) => (
                    <div key={`extra-${idx}`} className="scholarship-extra-row">
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="Label (e.g. Minimum CGPA)"
                        value={field.label}
                        onChange={(e) => handleExtraFieldChange(idx, "label", e.target.value)}
                        style={{ color: "#1e293b" }}
                      />
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) => handleExtraFieldChange(idx, "value", e.target.value)}
                        style={{ color: "#1e293b" }}
                      />
                      <button type="button" onClick={() => handleRemoveExtraField(idx)} className="scholarship-remove-field-btn">
                        <iconify-icon icon="ri:delete-bin-line"></iconify-icon>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions scholarship-modal-actions">
                <button type="button" className="btn-outline scholarship-action-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-apply scholarship-action-btn scholarship-submit-btn">
                  {editingId ? "Update Scholarship" : "Add Scholarship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="scholarship-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="scholarship-delete-icon">
              <iconify-icon icon="ri:error-warning-line"></iconify-icon>
            </div>
            <h3>Delete Scholarship?</h3>
            <p>Are you sure you want to permanently delete <strong>{deleteTarget.title}</strong>? This cannot be undone.</p>
            <div className="scholarship-delete-actions">
              <button type="button" className="btn-outline scholarship-action-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn-apply scholarship-action-btn scholarship-delete-confirm" onClick={confirmDeleteScholarship}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipManagement;
