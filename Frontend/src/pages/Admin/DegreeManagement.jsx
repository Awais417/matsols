import React, { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { apiService } from "../../services/api";
import "./DegreeManagement.css";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    ["link"],
    [{ align: [] }],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "blockquote",
  "code-block",
  "link",
  "align",
];

const breadcrumbSteps = [
  { id: "basic", label: "Basic Info" },
  { id: "about", label: "About Course" },
  { id: "key", label: "Key Information" },
  { id: "overview", label: "Programme Overview" },
  { id: "structure", label: "Course Structure" },
  { id: "admission", label: "Admissions & Fees" },
  { id: "visa", label: "Visa & Work Permit" },
  { id: "details", label: "Academic Details" },
  { id: "faqs", label: "General Info & FAQs" },
  { id: "specs", label: "Key Specifications" },
];

const degreeStepDescriptions = {
  basic: "Core course identity, level, partner, and commercial basics.",
  about: "The main narrative students will read first.",
  key: "Quick facts, highlights, and delivery format.",
  overview: "Programme breakdown and what the degree actually covers.",
  structure: "Stage, module, and curriculum structure.",
  admission: "Requirements, fees, and scholarship information.",
  visa: "Visa guidance and post-study work context.",
  details: "Intakes, application timing, campus, and academic delivery.",
  faqs: "Common questions with full rich-text answers.",
  specs: "Short label/value facts like IELTS, credits, or mode.",
};

const slugifyDegreeName = (value = "") => {
  const stopWords = new Set([
    "and",
    "for",
    "the",
    "in",
    "of",
    "to",
    "with",
    "school",
    "week",
  ]);

  const normalized = value
    .toLowerCase()
    .replace(/\(hons\)/g, " hons ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const tokens = normalized
    .split(/\s+/)
    .filter(Boolean)
    .filter((token, index) => index < 2 || !stopWords.has(token));

  return tokens.join("-").slice(0, 70).replace(/^-+|-+$/g, "");
};

const DegreeManagement = () => {
  const [degrees, setDegrees] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [universityFilter, setUniversityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const initialDegreeState = {
    name: "",
    slug: "",
    level: "",
    code: "",
    about: "",
    keyInformation: "",
    overview: "",
    structure: "",
    admissionRequirements: "",
    fees: "",
    scholarships: "",
    visaInfo: "",
    workPermit: "",
    tuitionFee: "",
    duration: "",
    applyDate: "",
    intake: "",
    applicationDeadline: "",
    campusLocation: "",
    taughtIn: "",
    universityAffiliation: "",
    progression: "",
    faqs: "",
    universityId: "",
    additionalInfo: "[]",
  };

  const [newDegree, setNewDegree] = useState(initialDegreeState);
  const [extraInfoFields, setExtraInfoFields] = useState([]);
  const [faqEntries, setFaqEntries] = useState([]);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const levelSuggestions = useMemo(() => {
    const defaults = ["BA", "HND", "MA", "Certificate", "Undergraduate", "Postgraduate", "PHD", "Foundation"];
    const existing = Array.from(
      new Set((degrees || []).map((d) => (d?.level || "").trim()).filter(Boolean)),
    );
    return Array.from(new Set([...defaults, ...existing]));
  }, [degrees]);

  const degreeUniversityOptions = useMemo(() => {
    const linkedNames = Array.from(
      new Set(
        (degrees || [])
          .map((degree) =>
            degree?.universityId
              ? universities.find((u) => u.id === degree.universityId)?.name
              : null,
          )
          .filter(Boolean),
      ),
    );
    return linkedNames.sort((a, b) => a.localeCompare(b));
  }, [degrees, universities]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [degreesData, unisData] = await Promise.all([
        apiService.getAllDegrees(),
        apiService.getUniversities(),
      ]);
      const normalized = Array.isArray(degreesData) ? degreesData : [];
      setDegrees(normalized);
      localStorage.setItem("matsols_degrees", JSON.stringify(normalized));
      setUniversities(Array.isArray(unisData) ? unisData : []);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  const handleOpenModal = (degree = null) => {
    if (degree) {
      setEditingId(degree.id);
      setNewDegree({ ...initialDegreeState, ...degree, universityId: degree.universityId || "" });
      try {
        const parsed = JSON.parse(degree.additionalInfo || "[]");
        setExtraInfoFields(Array.isArray(parsed) ? parsed : []);
      } catch {
        setExtraInfoFields([]);
      }
      try {
        const parsedFaqs = JSON.parse(degree.faqs || "[]");
        if (Array.isArray(parsedFaqs)) {
          setFaqEntries(parsedFaqs.filter((item) => item && (item.question || item.answer)));
        } else {
          setFaqEntries([]);
        }
      } catch {
        setFaqEntries([]);
      }
    } else {
      setEditingId(null);
      setNewDegree(initialDegreeState);
      setExtraInfoFields([]);
      setFaqEntries([]);
    }
    setActiveStep(0);
    setIsModalOpen(true);
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
    setExtraInfoFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFaq = () => {
    setFaqEntries((prev) => [...prev, { question: "", answer: "" }]);
  };

  const handleFaqChange = (index, key, value) => {
    setFaqEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleRemoveFaq = (index) => {
    setFaqEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDegree = async (e) => {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);
    if (!newDegree.name?.trim() || !newDegree.slug?.trim()) {
      setSaveError("Degree name and URL slug are required.");
      setIsSaving(false);
      return;
    }
    const cleanedExtraInfo = extraInfoFields.filter(
      (field) => (field.label || "").trim() !== "" && (field.value || "").trim() !== "",
    );

    const payload = {
      ...newDegree,
      level: (newDegree.level || "").trim(),
      universityId: newDegree.universityId?.trim() ? newDegree.universityId.trim() : null,
      faqs: JSON.stringify(
        faqEntries.filter(
          (item) => (item.question || "").trim() !== "" || (item.answer || "").trim() !== "",
        ),
      ),
      additionalInfo: JSON.stringify(cleanedExtraInfo),
    };

    if (editingId) {
      const resp = await apiService.updateDegree(editingId, payload);
      if (resp?.error) {
        setSaveError(resp.details ? `${resp.error} (${resp.details})` : resp.error);
        setIsSaving(false);
        return;
      }
    } else {
      const resp = await apiService.createDegree(payload);
      if (resp?.error) {
        setSaveError(resp.details ? `${resp.error} (${resp.details})` : resp.error);
        setIsSaving(false);
        return;
      }
    }

    await fetchData();
    setIsModalOpen(false);
    setNewDegree(initialDegreeState);
    setExtraInfoFields([]);
    setFaqEntries([]);
    setEditingId(null);
    setActiveStep(0);
    setIsSaving(false);
  };

  const deleteDegree = (degree) => {
    setDeleteTarget(degree);
  };

  const confirmDeleteDegree = async () => {
    if (!deleteTarget?.id) return;
    await apiService.deleteDegree(deleteTarget.id);
    await fetchData();
    setDeleteTarget(null);
  };

  const openDegreeDetail = (degree) => {
    setSelectedDegree(degree);
    setDetailOpen(true);
  };

  const closeDegreeDetail = () => {
    setDetailOpen(false);
    setSelectedDegree(null);
  };

  const parseExtraInfo = (value) => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const parseFaqEntries = (value) => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredAndSortedDegrees = useMemo(() => {
    const safe = Array.isArray(degrees) ? [...degrees] : [];
    const filtered = safe.filter((degree) => {
      const linkedUniversity = degree?.universityId
        ? universities.find((u) => u.id === degree.universityId)?.name || ""
        : "Not Linked";
      const matchesSearch =
        !normalizedSearch ||
        [degree.name, degree.slug, degree.level, linkedUniversity]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesLevel = levelFilter === "All" || degree.level === levelFilter;
      const matchesUniversity =
        universityFilter === "All" ||
        linkedUniversity === universityFilter ||
        (universityFilter === "Not Linked" && !degree.universityId);
      return matchesSearch && matchesLevel && matchesUniversity;
    });

    filtered.sort((a, b) => {
      const getUniversityName = (degree) =>
        degree?.universityId
          ? universities.find((u) => u.id === degree.universityId)?.name || "Linked Uni"
          : "Not Linked";

      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "level-asc") return (a.level || "").localeCompare(b.level || "");
      if (sortBy === "level-desc") return (b.level || "").localeCompare(a.level || "");
      if (sortBy === "university-asc") return getUniversityName(a).localeCompare(getUniversityName(b));
      if (sortBy === "university-desc") return getUniversityName(b).localeCompare(getUniversityName(a));
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [degrees, universities, normalizedSearch, levelFilter, universityFilter, sortBy]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedDegrees.length / pageSize));
  const paginatedDegrees = filteredAndSortedDegrees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, levelFilter, universityFilter, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const renderRichEditor = (label, key, placeholder = "") => (
    <div className="form-group degree-field-block">
      <label className="degree-field-label">{label}</label>
      <ReactQuill
        theme="snow"
        modules={quillModules}
        formats={quillFormats}
        value={newDegree[key] || ""}
        onChange={(value) => setNewDegree((prev) => ({ ...prev, [key]: value }))}
        placeholder={placeholder}
        className="degree-rich-editor"
      />
    </div>
  );

  const renderStepContent = () => {
    const step = breadcrumbSteps[activeStep]?.id;

    if (step === "basic") {
      return (
        <>
          <div className="admin-form-row">
            <div className="form-group">
              <label className="degree-field-label">Degree Name</label>
              <input
                type="text"
                className="ai-input"
                required
                value={newDegree.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewDegree((prev) => ({
                    ...prev,
                    name: val,
                    slug: editingId ? prev.slug : slugifyDegreeName(val),
                  }));
                }}
                placeholder="e.g. BA (Hons) International Business"
                style={{ color: "#1e293b" }}
              />
            </div>
            <div className="form-group">
              <label className="degree-field-label">URL Slug</label>
              <input
                type="text"
                className="ai-input"
                required
                value={newDegree.slug}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="ba-hons-international-business"
                style={{ color: "#1e293b" }}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="form-group">
              <label className="degree-field-label">University Partner</label>
              <select
                className="ai-input degree-select-input"
                value={newDegree.universityId}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, universityId: e.target.value }))}
                style={{ color: "#1e293b" }}
              >
                <option value="">Select University (Optional)</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.country})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="degree-field-label">Level</label>
              <input
                list="degree-level-options"
                type="text"
                className="ai-input"
                required
                value={newDegree.level}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, level: e.target.value }))}
                placeholder="e.g. BA, HND, MA, Undergraduate"
                style={{ color: "#1e293b" }}
              />
              <datalist id="degree-level-options">
                {levelSuggestions.map((level) => (
                  <option key={level} value={level} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="form-group">
              <label className="degree-field-label">UCAS/Program Code</label>
              <input
                type="text"
                className="ai-input"
                value={newDegree.code}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="e.g. BA24"
                style={{ color: "#1e293b" }}
              />
            </div>
            <div className="form-group">
              <label className="degree-field-label">Duration</label>
              <input
                type="text"
                className="ai-input"
                value={newDegree.duration}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g. 3 Years"
                style={{ color: "#1e293b" }}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="form-group">
              <label className="degree-field-label">Tuition Fee (per year)</label>
              <input
                type="text"
                className="ai-input"
                value={newDegree.tuitionFee}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, tuitionFee: e.target.value }))}
                placeholder="e.g. £15,000"
                style={{ color: "#1e293b" }}
              />
            </div>
            <div className="form-group">
              <label className="degree-field-label">Campus Location</label>
              <input
                type="text"
                className="ai-input"
                value={newDegree.campusLocation}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, campusLocation: e.target.value }))}
                placeholder="e.g. London, UK"
                style={{ color: "#1e293b" }}
              />
            </div>
          </div>
        </>
      );
    }

    if (step === "about") return renderRichEditor("About Course", "about", "Describe the course in detail...");
    if (step === "key") return renderRichEditor("Key Information", "keyInformation", "Entry route, delivery mode, key facts...");
    if (step === "overview") return renderRichEditor("Programme Overview", "overview", "Year-wise or module-wise overview...");
    if (step === "structure") return renderRichEditor("Course Structure", "structure", "Structure, credits, stages...");

    if (step === "admission") {
      return (
        <>
          {renderRichEditor("Admission Requirements", "admissionRequirements", "Entry requirements and documents...")}
          {renderRichEditor("Fees & Funding", "fees", "Tuition breakdown, payment plans...")}
          {renderRichEditor("Scholarships", "scholarships", "Scholarship details and criteria...")}
        </>
      );
    }

    if (step === "visa") {
      return (
        <>
          {renderRichEditor("Visa Information", "visaInfo", "Visa process and required docs...")}
          {renderRichEditor("Work Permit", "workPermit", "Work rights during/after study...")}
        </>
      );
    }

    if (step === "details") {
      return (
        <>
          <div className="admin-form-row">
            <div className="form-group">
              <label className="degree-field-label">Apply & Start Date</label>
              <input
                type="text"
                className="ai-input"
                value={newDegree.applyDate}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, applyDate: e.target.value }))}
                placeholder="e.g. Apply by July, intake in September"
                style={{ color: "#1e293b" }}
              />
            </div>
            <div className="form-group">
              <label className="degree-field-label">Application Deadline</label>
              <input
                type="text"
                className="ai-input"
                value={newDegree.applicationDeadline}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, applicationDeadline: e.target.value }))}
                placeholder="e.g. 31st July 2026"
                style={{ color: "#1e293b" }}
              />
            </div>
            <div className="form-group">
              <label className="degree-field-label">Intake Months</label>
              <input
                type="text"
                className="ai-input"
                value={newDegree.intake}
                onChange={(e) => setNewDegree((prev) => ({ ...prev, intake: e.target.value }))}
                placeholder="e.g. Sept, Jan"
                style={{ color: "#1e293b" }}
              />
            </div>
          </div>
          {renderRichEditor("Taught In", "taughtIn", "Language(s) of instruction...")}
          {renderRichEditor("University Affiliation", "universityAffiliation", "Affiliated campuses and awarding body...")}
          {renderRichEditor("Progressions & Careers", "progression", "Career outcomes and pathways...")}
        </>
      );
    }

    if (step === "faqs") {
      return (
        <div className="form-group degree-field-block">
          <div className="degree-specs-header">
            <label className="degree-field-label">General Info & FAQs</label>
            <button type="button" onClick={handleAddFaq} className="degree-add-field-btn">
              + Add FAQ
            </button>
          </div>
          {faqEntries.length === 0 && (
            <small style={{ color: "#64748b" }}>
              Add questions and answers separately. Example: Question: What IELTS score is required?
            </small>
          )}
          {faqEntries.map((faq, idx) => (
            <div key={`faq-${idx}`} className="degree-faq-row">
              <div className="degree-faq-head">
                <span>FAQ #{idx + 1}</span>
                <button type="button" onClick={() => handleRemoveFaq(idx)} className="degree-remove-field-btn">
                  <iconify-icon icon="ri:delete-bin-line"></iconify-icon>
                </button>
              </div>
              <label className="degree-field-label">Question</label>
              <input
                type="text"
                className="ai-input"
                placeholder="e.g. What are the admission requirements?"
                value={faq.question || ""}
                onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                style={{ color: "#1e293b", marginBottom: "10px" }}
              />
              <label className="degree-field-label">Answer</label>
              <ReactQuill
                theme="snow"
                modules={quillModules}
                formats={quillFormats}
                value={faq.answer || ""}
                onChange={(value) => handleFaqChange(idx, "answer", value)}
                placeholder="Write the answer here..."
                className="degree-rich-editor"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="form-group degree-field-block">
        <div className="degree-specs-header">
          <label className="degree-field-label">Key Specifications (Label/Value)</label>
          <button type="button" onClick={handleAddExtraField} className="degree-add-field-btn">
            + Add Field
          </button>
        </div>
        {extraInfoFields.length === 0 && (
          <small style={{ color: "#64748b" }}>Add key specs like IELTS, Credits, Mode, Accreditation, etc.</small>
        )}
        {extraInfoFields.map((field, idx) => (
          <div key={idx} className="degree-spec-row">
            <input
              type="text"
              className="ai-input"
              placeholder="Label (e.g. IELTS)"
              value={field.label}
              onChange={(e) => handleExtraFieldChange(idx, "label", e.target.value)}
              style={{ color: "#1e293b" }}
            />
            <input
              type="text"
              className="ai-input"
              placeholder="Value (e.g. 6.0 overall)"
              value={field.value}
              onChange={(e) => handleExtraFieldChange(idx, "value", e.target.value)}
              style={{ color: "#1e293b" }}
            />
            <button type="button" onClick={() => handleRemoveExtraField(idx)} className="degree-remove-field-btn">
              <iconify-icon icon="ri:delete-bin-line"></iconify-icon>
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (loading && degrees.length === 0) {
    return (
      <div className="fuckin-loader-overlay">
        <div className="fuckin-loader"></div>
        <div className="loader-text">Loading Degree Database...</div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Degree Management</h1>
          <p>Manage courses, degrees, and program details.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Add Degree
        </button>
      </div>

      <div className="degree-toolbar">
        <div className="degree-toolbar-group degree-toolbar-search">
          <label className="degree-toolbar-label">Search</label>
          <input
            type="text"
            className="ai-input degree-toolbar-input"
            placeholder="Search by name, slug, level, university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="degree-toolbar-group">
          <label className="degree-toolbar-label">Level</label>
          <select
            className="ai-input degree-toolbar-input degree-select-input"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="All">All levels</option>
            {levelSuggestions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div className="degree-toolbar-group">
          <label className="degree-toolbar-label">University</label>
          <select
            className="ai-input degree-toolbar-input degree-select-input"
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
          >
            <option value="All">All universities</option>
            <option value="Not Linked">Not Linked</option>
            {degreeUniversityOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="degree-toolbar-group">
          <label className="degree-toolbar-label">Sort</label>
          <select
            className="ai-input degree-toolbar-input degree-select-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="level-asc">Level A-Z</option>
            <option value="level-desc">Level Z-A</option>
            <option value="university-asc">University A-Z</option>
            <option value="university-desc">University Z-A</option>
          </select>
        </div>
      </div>

      <div className="admin-card-list" style={{ marginTop: "24px" }}>
        <div className="admin-chart-card">
          <div className="admin-table-responsive" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "12px", background: "#f8fafc" }}>Name</th>
                  <th style={{ textAlign: "left", padding: "12px", background: "#f8fafc" }}>Level</th>
                  <th style={{ textAlign: "left", padding: "12px", background: "#f8fafc" }}>University</th>
                  <th style={{ textAlign: "left", padding: "12px", background: "#f8fafc" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDegrees.map((deg) => (
                  <tr key={deg.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px" }}>
                      <div>
                        <strong>{deg.name}</strong>
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{deg.slug}</div>
                    </td>
                    <td style={{ padding: "12px" }}>{deg.level}</td>
                    <td style={{ padding: "12px" }}>
                      {deg.universityId ? (
                        universities.find((u) => u.id === deg.universityId)?.name || "Linked Uni"
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not Linked</span>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => openDegreeDetail(deg)}
                          className="degree-action-btn degree-action-view"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenModal(deg)}
                          className="degree-action-btn degree-action-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDegree(deg)}
                          className="degree-action-btn degree-action-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedDegrees.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: "38px", textAlign: "center", color: "#64748b" }}>
                      No degrees match the current search/filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="degree-pagination">
            <div className="degree-pagination-meta">
              Showing {filteredAndSortedDegrees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredAndSortedDegrees.length)} of {filteredAndSortedDegrees.length}
            </div>
            <div className="degree-pagination-actions">
              <button
                type="button"
                className="btn-outline degree-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <span className="degree-page-indicator">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className="btn-outline degree-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {detailOpen && selectedDegree && (
        <div
          className="admin-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeDegreeDetail();
          }}
        >
          <div className="admin-modal degree-detail-modal">
            <div className="modal-header">
              <h3>Degree Detail</h3>
              <button className="btn-close degree-sticky-close" onClick={closeDegreeDetail}>
                <iconify-icon icon="ri:close-line"></iconify-icon>
              </button>
            </div>
            <div className="modal-body degree-detail-body">
              <div className="degree-detail-hero">
                <div>
                  <div className="degree-detail-chips">
                    <span className="degree-detail-chip">{selectedDegree.level || "No level"}</span>
                    <span className="degree-detail-chip degree-detail-chip-muted">
                      {selectedDegree.universityId
                        ? universities.find((u) => u.id === selectedDegree.universityId)?.name || "Linked University"
                        : "Not Linked"}
                    </span>
                  </div>
                  <h2>{selectedDegree.name}</h2>
                  <p>{selectedDegree.slug}</p>
                </div>
                <button
                  type="button"
                  className="btn-apply degree-detail-edit-btn"
                  onClick={() => {
                    closeDegreeDetail();
                    handleOpenModal(selectedDegree);
                  }}
                >
                  Edit Degree
                </button>
              </div>

              <div className="degree-detail-grid">
                <div className="degree-detail-card">
                  <h4>Commercial Snapshot</h4>
                  <div className="degree-detail-kv"><span>Tuition Fee</span><strong>{selectedDegree.tuitionFee || "N/A"}</strong></div>
                  <div className="degree-detail-kv"><span>Duration</span><strong>{selectedDegree.duration || "N/A"}</strong></div>
                  <div className="degree-detail-kv"><span>Intake</span><strong>{selectedDegree.intake || "N/A"}</strong></div>
                  <div className="degree-detail-kv"><span>Deadline</span><strong>{selectedDegree.applyDate || "N/A"}</strong></div>
                  <div className="degree-detail-kv"><span>Campus</span><strong>{selectedDegree.campusLocation || "N/A"}</strong></div>
                  <div className="degree-detail-kv"><span>Code</span><strong>{selectedDegree.code || "N/A"}</strong></div>
                </div>

                <div className="degree-detail-card">
                  <h4>Requirements</h4>
                  <div
                    className="degree-detail-richtext"
                    dangerouslySetInnerHTML={{ __html: selectedDegree.admissionRequirements || "<p>No admission requirements added.</p>" }}
                  />
                </div>
              </div>

              <div className="degree-detail-card">
                <h4>Overview</h4>
                <div
                  className="degree-detail-richtext"
                  dangerouslySetInnerHTML={{ __html: selectedDegree.about || selectedDegree.overview || "<p>No overview added.</p>" }}
                />
              </div>

              <div className="degree-detail-grid">
                <div className="degree-detail-card">
                  <h4>Fees, Scholarships & Visa</h4>
                  <div
                    className="degree-detail-richtext"
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedDegree.fees ||
                        selectedDegree.scholarships ||
                        selectedDegree.visaInfo ||
                        "<p>No fee or visa detail added.</p>",
                    }}
                  />
                </div>
                <div className="degree-detail-card">
                  <h4>Key Specifications</h4>
                  {parseExtraInfo(selectedDegree.additionalInfo).length === 0 ? (
                    <p className="degree-detail-empty">No key specifications added.</p>
                  ) : (
                    <div className="degree-detail-specs">
                      {parseExtraInfo(selectedDegree.additionalInfo).map((item, idx) => (
                        <div key={`${item.label}-${idx}`} className="degree-detail-spec-item">
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="degree-detail-card">
                <h4>FAQs</h4>
                {parseFaqEntries(selectedDegree.faqs).length === 0 ? (
                  <p className="degree-detail-empty">No FAQs added.</p>
                ) : (
                  <div className="degree-detail-faqs">
                    {parseFaqEntries(selectedDegree.faqs).map((faq, idx) => (
                      <div key={`faq-view-${idx}`} className="degree-detail-faq-item">
                        <strong>{faq.question || `FAQ ${idx + 1}`}</strong>
                        <div
                          className="degree-detail-richtext"
                          dangerouslySetInnerHTML={{ __html: faq.answer || "<p>No answer provided.</p>" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="admin-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className="degree-delete-modal">
            <div className="degree-delete-modal-icon">
              <iconify-icon icon="ri:error-warning-line"></iconify-icon>
            </div>
            <h3>Delete Degree?</h3>
            <p>
              Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
            </p>
            <div className="degree-delete-modal-actions">
              <button type="button" className="btn-outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="degree-delete-confirm-btn" onClick={confirmDeleteDegree}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="admin-modal degree-modal">
            <div className="modal-header">
              <h3>{editingId ? "Edit Degree" : "Add New Degree"}</h3>
              <button className="btn-close degree-sticky-close" onClick={() => setIsModalOpen(false)}>
                <iconify-icon icon="ri:close-line"></iconify-icon>
              </button>
            </div>
            <form onSubmit={handleSaveDegree} className="degree-form">
              <div className="modal-body degree-modal-body">
                <div className="degree-breadcrumbs">
                  {breadcrumbSteps.map((step, idx) => (
                    <button
                      key={step.id}
                      type="button"
                      className={`degree-breadcrumb-btn ${activeStep === idx ? "active" : ""}`}
                      onClick={() => setActiveStep(idx)}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>

                <div className="degree-step-panel">
                  <div className="degree-step-shell">
                    <div className="degree-step-meta">
                      <span className="degree-step-index">
                        Step {activeStep + 1} of {breadcrumbSteps.length}
                      </span>
                      <h4>{breadcrumbSteps[activeStep]?.label}</h4>
                      <p>{degreeStepDescriptions[breadcrumbSteps[activeStep]?.id] || "Fill in the required degree information."}</p>
                    </div>
                    {renderStepContent()}
                  </div>
                </div>
              </div>
              {saveError && <div className="degree-form-error">{saveError}</div>}
              <div className="modal-actions degree-modal-actions">
                <button
                  type="button"
                  className="btn-outline degree-step-btn degree-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn-outline degree-step-btn"
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn-outline degree-step-btn"
                  onClick={() => setActiveStep((prev) => Math.min(breadcrumbSteps.length - 1, prev + 1))}
                  disabled={activeStep === breadcrumbSteps.length - 1}
                >
                  Next
                </button>
                <button type="submit" className="btn-apply degree-submit-btn" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingId ? "Update Degree" : "Add Degree Info"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DegreeManagement;
