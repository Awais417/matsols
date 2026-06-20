import React, { useEffect, useRef, useState } from "react";
import { apiService } from "../../services/api";

const UpdatesManagement = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [rteState, setRteState] = useState({ bold: false, italic: false, ul: false });
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [toast, setToast] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const formatDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const normalizeExpiryForPayload = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  useEffect(() => {
    if (!editingItem || !editorRef.current) return;
    const html = (editingItem.excerpt || "").trim();
    // Ensure editor always has a stable block so caret behaves.
    editorRef.current.innerHTML = html ? html : "<p><br></p>";
    setRteState({ bold: false, italic: false, ul: false });
  }, [editingItem?.id]);

  useEffect(() => {
    if (!editingItem) return undefined;
    const handler = () => {
      const editor = editorRef.current;
      if (!editor) return;
      const sel = document.getSelection?.();
      const anchorNode = sel?.anchorNode;
      if (!anchorNode) return;
      const inEditor = editor === anchorNode || editor.contains(anchorNode);
      if (!inEditor) return;
      setRteState({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        ul: document.queryCommandState("insertUnorderedList"),
      });
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, [editingItem]);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUpdates({ disableFallback: true });
      setUpdates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch updates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteRequest({
      type: "single",
      id,
      title: "Delete Event?",
      message: "Are you sure you want to permanently delete this event/update? This cannot be undone.",
    });
  };

  const confirmDelete = async () => {
    if (!deleteRequest) return;

    if (deleteRequest.type === "single" && deleteRequest.id) {
      await apiService.deleteUpdate(deleteRequest.id);
      setSelectedIds((prev) => prev.filter((x) => x !== deleteRequest.id));
      setToast({ type: "success", text: "Event deleted." });
    }

    if (deleteRequest.type === "bulk" && deleteRequest.ids?.length) {
      await apiService.bulkUpdateAction("delete", deleteRequest.ids);
      setSelectedIds([]);
      setToast({ type: "success", text: "Selected updates deleted." });
    }

    await fetchUpdates();
    setDeleteRequest(null);
  };

  const handleEdit = (item) => {
    setEditingItem({
      ...item,
      expiryDate: formatDateTimeLocal(item.expiryDate),
      isPublished: item.isPublished ?? true,
    });
    setShowPreview(false);
    setSelectedImageName("");
  };

  const buildPayload = (overrides = {}) => {
    const excerptHtml = editorRef.current?.innerHTML?.trim() || "";
    const excerptText = excerptHtml.replace(/<[^>]+>/g, "").trim();
    if (!excerptText) {
      setToast({ type: "error", text: "Description is required." });
      return null;
    }

    return {
      ...editingItem,
      excerpt: excerptHtml,
      expiryDate: normalizeExpiryForPayload(editingItem.expiryDate),
      isImportant: Boolean(editingItem.isImportant),
      isPublished:
        overrides.isPublished !== undefined
          ? Boolean(overrides.isPublished)
          : Boolean(editingItem.isPublished),
    };
  };

  const persistItem = async (overrides = {}) => {
    const payload = buildPayload(overrides);
    if (!payload) return;
    if (payload.isPublished && payload.expiryDate && new Date(payload.expiryDate) <= new Date()) {
      setToast({ type: "error", text: "This event is already expired. Clear the expiry field or choose a future date before publishing." });
      return;
    }

    if (editingItem.id) {
      await apiService.updateUpdate(editingItem.id, payload);
    } else {
      await apiService.createUpdate(payload);
    }
    setEditingItem(null);
    setShowPreview(false);
    await fetchUpdates();
    setToast({ type: "success", text: editingItem.id ? "Event updated." : "Event created." });
  };

  const getEmptyItem = () => ({
    title: "",
    category: "Admission",
    date: "",
    excerpt: "",
    image: "",
    isImportant: false,
    isPublished: true,
    expiryDate: "",
    ctaText: "",
    ctaLink: "",
  });

  const openNewItem = () => {
    setEditingItem(getEmptyItem());
    setShowPreview(false);
  };

  const previewItem = editingItem
    ? {
      ...editingItem,
      excerpt: editorRef.current?.innerHTML?.trim() || editingItem.excerpt || "",
    }
    : null;

  const handleUpdateImageUpload = async (file) => {
    if (!file || !editingItem) return;
    setSelectedImageName(file.name || "");
    setImageUploading(true);
    const resp = await apiService.uploadImage(file);
    if (resp?.url) {
      setEditingItem((prev) => ({ ...prev, image: resp.url }));
      setToast({ type: "success", text: "Image uploaded." });
    } else {
      setToast({ type: "error", text: resp?.error || "Image upload failed" });
    }
    setImageUploading(false);
  };

  const handleUpdateImageDelete = async () => {
    if (!editingItem?.image) return;
    const resp = await apiService.deleteImage({ url: editingItem.image });
    if (resp?.success || resp?.result === "not found") {
      setEditingItem((prev) => ({ ...prev, image: "" }));
      setSelectedImageName("");
      setToast({ type: "success", text: "Uploaded image removed." });
    } else {
      setToast({ type: "error", text: resp?.error || "Failed to delete image from Cloudinary." });
    }
  };

  const refreshRteState = () => {
    // Defer so execCommand/selection updates have applied.
    requestAnimationFrame(() => {
      setRteState({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        ul: document.queryCommandState("insertUnorderedList"),
      });
    });
  };

  const runEditorCommand = (command) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    refreshRteState();
  };

  const runLinkCommand = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    document.execCommand("createLink", false, url);
    editorRef.current?.focus();
    refreshRteState();
  };

  const onEditorInput = (e) => {
    const html = e.currentTarget?.innerHTML ?? "";
    setEditingItem((prev) => (prev ? { ...prev, excerpt: html } : prev));
    // Don't update toolbar state on every keystroke; selectionchange + command clicks handle it.
  };

  const onEditorKeyDown = (e) => {
    if (e.key !== "Backspace") return;
    const el = editorRef.current;
    if (!el) return;
    // If editor is visually empty, keep a stable paragraph so backspace behaves.
    const text = (el.textContent || "").replace(/\u200B/g, "").trim();
    if (!text) {
      e.preventDefault();
      el.innerHTML = "<p><br></p>";
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const onEditorFocus = () => {
    const el = editorRef.current;
    if (!el) return;
    const text = (el.textContent || "").replace(/\u200B/g, "").trim();
    if (!text) {
      // If list mode is toggled while empty, keep it but ensure a valid first <li>.
      if (document.queryCommandState("insertUnorderedList")) {
        el.innerHTML = "<ul><li><br></li></ul>";
      } else {
        el.innerHTML = "<p><br></p>";
      }
      const range = document.createRange();
      // Place caret inside the first child (p or li).
      const target = el.querySelector("li") || el.querySelector("p") || el;
      range.selectNodeContents(target);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      refreshRteState();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === updates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(updates.map((u) => u.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const applyBulkAction = async (action) => {
    if (!selectedIds.length) return;
    if (action === "delete") {
      setDeleteRequest({
        type: "bulk",
        ids: [...selectedIds],
        title: "Delete Selected Updates?",
        message: `Are you sure you want to permanently delete ${selectedIds.length} selected update${selectedIds.length === 1 ? "" : "s"}? This cannot be undone.`,
      });
      return;
    }
    await apiService.bulkUpdateAction(action, selectedIds);
    setSelectedIds([]);
    await fetchUpdates();
    setToast({ type: "success", text: action === "publish" ? "Selected updates published." : "Selected updates unpublished." });
  };

  if (loading) {
    return (
      <div className="fuckin-loader-overlay">
        <div className="fuckin-loader"></div>
        <div className="loader-text">Loading Content Management...</div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {toast && <div className={`updates-toast updates-toast-${toast.type}`}>{toast.text}</div>}
      <div className="admin-header">
        <div className="admin-title">
          <h1>Events & Insights CMS</h1>
          <p>Manage drafts, preview content before publishing, and retire expired updates automatically.</p>
        </div>
        <button className="btn btn-primary" onClick={openNewItem}>
          + Add New Event
        </button>
      </div>

      <div
        style={{
          marginBottom: "12px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button className="btn-outline" onClick={() => applyBulkAction("publish")} disabled={!selectedIds.length}>
          Publish Selected
        </button>
        <button className="btn-outline" onClick={() => applyBulkAction("unpublish")} disabled={!selectedIds.length}>
          Unpublish Selected
        </button>
        <button
          className="btn-outline"
          onClick={() => applyBulkAction("delete")}
          disabled={!selectedIds.length}
          style={{ borderColor: "#fecdd3", color: "#be123c" }}
        >
          Delete Selected
        </button>
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          {selectedIds.length} selected
        </span>
      </div>

      <div className="admin-table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: "36px" }}>
                <input
                  type="checkbox"
                  checked={updates.length > 0 && selectedIds.length === updates.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Important?</th>
              <th>Title</th>
              <th>Category</th>
              <th>Published</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {updates.map((item) => {
              const isExpired = Boolean(item.expiryDate && new Date(item.expiryDate) < new Date());

              return (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                    />
                  </td>
                  <td>
                    {item.isImportant ? (
                      <span className="status-tag marketing" style={{ padding: "4px 12px", fontSize: "10px" }}>
                        IMPORTANT
                      </span>
                    ) : (
                      <span className="status-tag user" style={{ padding: "4px 12px", fontSize: "10px" }}>
                        Standard
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong>{item.title}</strong>
                      {isExpired && <span style={{ color: "#ef4444", fontSize: "11px" }}>Expired</span>}
                    </div>
                  </td>
                  <td>
                    <span className="status-tag editor" style={{ padding: "4px 12px", fontSize: "10px" }}>
                      {item.category}
                    </span>
                  </td>
                  <td>
                    {item.isPublished ? (
                      <span className="status-tag marketing" style={{ padding: "4px 12px", fontSize: "10px" }}>
                        Published
                      </span>
                    ) : (
                      <span className="status-tag user" style={{ padding: "4px 12px", fontSize: "10px" }}>
                        Draft
                      </span>
                    )}
                  </td>
                  <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "Never"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <button onClick={() => handleEdit(item)} style={{ background: "none", border: "none", color: "#06b6d4", cursor: "pointer", fontWeight: "600" }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "600" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {updates.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  No events found. Create one above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "20px" }}>
          <div className="modal-content" style={{ background: "white", padding: "30px", borderRadius: "12px", width: "700px", maxWidth: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: "20px" }}>{editingItem.id ? "Edit Event" : "New Event"}</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "5px" }}>Title</label>
                  <input
                    type="text"
                    className="ai-input"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    style={{ width: "100%", height: "40px", padding: "0 10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "8px" }}>Description (Rich Text)</label>
                  <div className="rte-toolbar">
                    <button
                      type="button"
                      className={rteState.bold ? "is-active" : ""}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => runEditorCommand("bold")}
                      aria-pressed={rteState.bold}
                      title="Bold"
                    >
                      <b>B</b>
                    </button>
                    <button
                      type="button"
                      className={rteState.italic ? "is-active" : ""}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => runEditorCommand("italic")}
                      aria-pressed={rteState.italic}
                      title="Italic"
                    >
                      <i>I</i>
                    </button>
                    <button
                      type="button"
                      className={rteState.ul ? "is-active" : ""}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => runEditorCommand("insertUnorderedList")}
                      aria-pressed={rteState.ul}
                      title="Bullet list"
                    >
                      • List
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={runLinkCommand}>Link</button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    className="rte-editor"
                    onInput={onEditorInput}
                    onKeyDown={onEditorKeyDown}
                    onFocus={onEditorFocus}
                    suppressContentEditableWarning
                  />
                </div>

                <div className="form-responsive-row">
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "13px", marginBottom: "5px" }}>Category Badge</label>
                    <input
                      type="text"
                      className="ai-input"
                      value={editingItem.category}
                      placeholder="e.g. Scholarship, Admission"
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "13px", marginBottom: "5px" }}>Short Date Text</label>
                    <input
                      type="text"
                      className="ai-input"
                      value={editingItem.date}
                      placeholder="e.g. Ends Mar 15"
                      onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                      required
                    />
                  </div>
                </div>

                <div className="form-responsive-row" style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 700, color: "#f59e0b" }}>
                      <input
                        type="checkbox"
                        checked={editingItem.isImportant}
                        onChange={(e) => setEditingItem({ ...editingItem, isImportant: e.target.checked })}
                      />
                      Mark as Important (Hero Card)
                    </label>
                    <small style={{ fontSize: "11px", color: "#64748b" }}>
                      Use Preview to review the card, Save Draft to keep it private, or Publish when ready.
                    </small>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "13px", marginBottom: "5px" }}>Expiration Date & Time</label>
                    <input
                      type="datetime-local"
                      className="ai-input"
                      value={editingItem.expiryDate || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                    />
                    <small style={{ fontSize: "11px", color: "#64748b" }}>If blank, it never expires natively.</small>
                  </div>
                </div>

                <div className="form-responsive-row">
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "13px", marginBottom: "5px" }}>Button Text</label>
                    <input
                      type="text"
                      className="ai-input"
                      value={editingItem.ctaText || ""}
                      placeholder="e.g. Apply Now"
                      onChange={(e) => setEditingItem({ ...editingItem, ctaText: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "13px", marginBottom: "5px" }}>Button Link</label>
                    <input
                      type="text"
                      className="ai-input"
                      value={editingItem.ctaLink || ""}
                      placeholder="e.g. /universities"
                      onChange={(e) => setEditingItem({ ...editingItem, ctaLink: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b" }}
                    />
                  </div>
                </div>

                <div className="image-upload-block">
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", fontWeight: 700 }}>Background Image</label>
                  <input
                    type="url"
                    className="ai-input"
                    value={editingItem.image || ""}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                    style={{ width: "100%", height: "40px", padding: "0 10px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#1e293b", background: "white" }}
                  />
                  <div className="image-upload-surface">
                    <label htmlFor="event-image-upload" className="upload-file-btn">
                      <iconify-icon icon="ri:upload-cloud-2-line" width="18"></iconify-icon>
                      Upload from device
                    </label>
                    <input
                      id="event-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpdateImageUpload(e.target.files?.[0])}
                      style={{ display: "none" }}
                    />
                    <span className="upload-file-chip">{selectedImageName || "No file selected"}</span>
                    {imageUploading && <small style={{ fontSize: "11px", color: "#64748b" }}>Uploading image...</small>}
                  </div>
                  {editingItem.image && (
                    <div className="image-preview-card">
                      <img
                        src={editingItem.image}
                        alt="Event preview"
                        style={{ width: "110px", height: "110px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                      />
                      <button type="button" onClick={handleUpdateImageDelete} className="delete-uploaded-image-btn">
                        Delete Uploaded Image
                      </button>
                    </div>
                  )}
                  <small className="image-upload-note">Upload directly from your device or paste a direct image URL.</small>
                </div>
              </div>

              <div className="form-responsive-row" style={{ marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => setShowPreview((prev) => !prev)}
                  style={{ flex: 1, background: "#fff7ed", border: "1px solid #fdba74", borderRadius: "10px", cursor: "pointer", padding: "12px", color: "#9a3412", fontWeight: 700 }}
                >
                  {showPreview ? "Hide Preview" : "Preview"}
                </button>
                <button
                  type="button"
                  onClick={() => persistItem({ isPublished: false })}
                  style={{ flex: 1, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", cursor: "pointer", padding: "12px", color: "#334155", fontWeight: 700 }}
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => persistItem({ isPublished: true })}
                  style={{ flex: 1 }}
                >
                  Publish Event
                </button>
                <button type="button" onClick={() => { setEditingItem(null); setShowPreview(false); }} style={{ flex: 1, background: "#f1f5f9", border: "none", borderRadius: "10px", cursor: "pointer", padding: "12px" }}>
                  Cancel
                </button>
              </div>

              {showPreview && previewItem && (
                <div style={{ marginTop: "20px", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", background: "#fff" }}>
                  {previewItem.image && (
                    <img
                      src={previewItem.image}
                      alt={previewItem.title || "Preview"}
                      style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
                    />
                  )}
                  <div style={{ padding: "18px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                      <span className="status-tag editor" style={{ padding: "4px 12px", fontSize: "10px" }}>
                        {previewItem.category || "Event"}
                      </span>
                      <span className="status-tag user" style={{ padding: "4px 12px", fontSize: "10px" }}>
                        {previewItem.isPublished ? "Ready to publish" : "Draft preview"}
                      </span>
                      {previewItem.isImportant && (
                        <span className="status-tag marketing" style={{ padding: "4px 12px", fontSize: "10px" }}>
                          IMPORTANT
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: "22px", color: "#0f172a", marginBottom: "8px" }}>
                      {previewItem.title || "Untitled event"}
                    </h4>
                    <div
                      style={{ color: "#475569", lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: previewItem.excerpt || "<p>No description yet.</p>" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginTop: "16px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {previewItem.date || "Date TBD"}
                      </span>
                      {(previewItem.ctaLink || previewItem.ctaText) && (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", background: "#fb923c", color: "#fff", padding: "10px 16px", fontSize: "12px", fontWeight: 700 }}>
                          {previewItem.ctaText || "Learn More"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {deleteRequest && (
        <div className="updates-delete-modal-overlay" onClick={() => setDeleteRequest(null)}>
          <div className="updates-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="updates-delete-modal-icon">
              <iconify-icon icon="ri:error-warning-line"></iconify-icon>
            </div>
            <h3>{deleteRequest.title}</h3>
            <p>{deleteRequest.message}</p>
            <div className="updates-delete-modal-actions">
              <button type="button" className="btn-outline" onClick={() => setDeleteRequest(null)}>
                Cancel
              </button>
              <button type="button" className="updates-delete-confirm-btn" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-responsive-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        .rte-toolbar {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .rte-toolbar button {
          border: 1px solid #cbd5e1;
          background: #fff;
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 12px;
        }
        .rte-toolbar button.is-active {
          background: #0f172a;
          border-color: #0f172a;
          color: #fff;
        }
        .rte-editor {
          min-height: 120px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 14px;
          color: #1e293b;
          background: #fff;
          line-height: 1.6;
        }
        .rte-editor p {
          margin: 0;
        }
        .rte-editor ul {
          margin: 0;
          padding-left: 0;
          list-style-position: inside;
        }
        .rte-editor li {
          padding-left: 6px;
        }
        .image-upload-block {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
        }
        .image-upload-surface {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .upload-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0f172a;
          color: #fff;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid #1e293b;
        }
        .upload-file-chip {
          background: #ffffff;
          border: 1px solid #dbe4ef;
          color: #475569;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          max-width: 280px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .image-preview-card {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
        }
        .delete-uploaded-image-btn {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          border-radius: 10px;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }
        .image-upload-note {
          display: block;
          margin-top: 8px;
          font-size: 11px;
          color: #64748b;
        }
        .updates-toast {
          margin-bottom: 18px;
          padding: 12px 16px;
          border-radius: 14px;
          font-weight: 700;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
        }
        .updates-toast-success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #166534;
        }
        .updates-toast-error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
        }
        .updates-delete-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1200;
          padding: 20px;
        }
        .updates-delete-modal {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 18px;
          padding: 26px;
          box-shadow: 0 28px 60px rgba(15, 23, 42, 0.22);
          text-align: center;
        }
        .updates-delete-modal-icon {
          width: 54px;
          height: 54px;
          margin: 0 auto 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          font-size: 28px;
        }
        .updates-delete-modal h3 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: 22px;
        }
        .updates-delete-modal p {
          margin: 0;
          color: #475569;
          line-height: 1.6;
        }
        .updates-delete-modal-actions {
          margin-top: 22px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .updates-delete-confirm-btn {
          border: none;
          border-radius: 12px;
          background: #dc2626;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          padding: 12px 16px;
        }
        @media (max-width: 768px) {
          .modal-content {
            width: 95% !important;
            padding: 20px !important;
          }
          .form-responsive-row {
            flex-direction: column;
            gap: 15px;
          }
          .image-preview-card {
            align-items: flex-start;
            flex-direction: column;
          }
          .upload-file-chip {
            max-width: 100%;
          }
          .updates-delete-modal-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdatesManagement;
