import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const UniversityManagement = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedUniversityDegrees, setSelectedUniversityDegrees] = useState([]);
  const [selectedUniversityScholarships, setSelectedUniversityScholarships] = useState([]);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const initialUniState = {
    name: '',
    country: '',
    image: '',
    websiteUrl: '',
    description: '',
    about: '',
    campusLife: '',
    admissionCriteria: '',
    rank: '',
    location: '',
    status: 'Active',
    additionalInfo: '[]' // Stored as JSON string
  };

  const [newUni, setNewUni] = useState(initialUniState);
  const [extraInfoFields, setExtraInfoFields] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchUniversities = async () => {
    try {
      const data = await apiService.getUniversities();
      setUniversities(data);
    } catch (error) {
      console.error("Error fetching universities", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleOpenModal = (uni = null) => {
    if (uni) {
      setEditingId(uni.id);
      setNewUni({
        ...uni,
        additionalInfo: uni.additionalInfo || '[]'
      });
      try {
        const parsed = JSON.parse(uni.additionalInfo || '[]');
        setExtraInfoFields(Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ label: '', value: '' }]);
      } catch (e) {
        setExtraInfoFields([{ label: '', value: '' }]);
      }
    } else {
      setEditingId(null);
      setNewUni(initialUniState);
      setExtraInfoFields([{ label: '', value: '' }]);
    }
    setIsModalOpen(true);
  };

  const handleAddExtraField = () => {
    setExtraInfoFields([...extraInfoFields, { label: '', value: '' }]);
  };

  const handleExtraFieldChange = (index, key, value) => {
    const updated = [...extraInfoFields];
    updated[index][key] = value;
    setExtraInfoFields(updated);
  };

  const handleRemoveExtraField = (index) => {
    setExtraInfoFields(extraInfoFields.filter((_, i) => i !== index));
  };

  const handleUniversityImageUpload = async (file) => {
    if (!file) return;
    setImageUploading(true);
    const resp = await apiService.uploadImage(file);
    if (resp?.url) {
      setNewUni((prev) => ({ ...prev, image: resp.url }));
      setToast({ type: 'success', text: 'Image uploaded.' });
    } else {
      setToast({ type: 'error', text: resp?.error || "Image upload failed" });
    }
    setImageUploading(false);
  };

  const handleUniversityImageDelete = async () => {
    if (!newUni.image) return;
    const resp = await apiService.deleteImage({ url: newUni.image });
    if (resp?.success || resp?.result === "not found") {
      setNewUni((prev) => ({ ...prev, image: "" }));
      setToast({ type: 'success', text: 'Uploaded image removed.' });
    } else {
      setToast({ type: 'error', text: resp?.error || "Failed to delete image from Cloudinary." });
    }
  };

  const handleSaveUniversity = async (e) => {
    e.preventDefault();
    const cleanedExtraInfo = extraInfoFields.filter(
      (field) => (field.label || '').trim() !== '' && (field.value || '').trim() !== ''
    );
    const payload = {
      ...newUni,
      additionalInfo: JSON.stringify(cleanedExtraInfo)
    };

    if (editingId) {
      await apiService.updateUniversity(editingId, payload);
    } else {
      await apiService.createUniversity(payload);
    }

    await fetchUniversities();
    setIsModalOpen(false);
    setNewUni(initialUniState);
    setExtraInfoFields([]);
    setEditingId(null);
    setToast({ type: 'success', text: editingId ? 'University updated.' : 'University created.' });
  };

  const updateStatus = async (id, status) => {
    await apiService.updateUniversity(id, { status });
    await fetchUniversities();
  };

  const deleteUniversity = (uni) => {
    setDeleteTarget(uni);
  };

  const confirmDeleteUniversity = async () => {
    if (!deleteTarget?.id) return;
    await apiService.deleteUniversity(deleteTarget.id);
    await fetchUniversities();
    setDeleteTarget(null);
    setToast({ type: 'success', text: 'University deleted.' });
  };

  const openUniversityDetail = async (uni) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const [uniData, scholarshipsData, degreesData] = await Promise.all([
        apiService.getUniversityById(uni.id),
        apiService.getScholarships({ universityId: uni.id }),
        apiService.getAllDegrees(),
      ]);
      const allDegrees = Array.isArray(degreesData) ? degreesData : [];
      const linkedDegrees = allDegrees.filter((degree) => {
        const uniId = degree?.universityId || degree?.university?.id;
        return uniId && String(uniId) === String(uni.id);
      });
      setSelectedUniversity(uniData || uni);
      setSelectedUniversityDegrees(linkedDegrees);
      setSelectedUniversityScholarships(Array.isArray(scholarshipsData) ? scholarshipsData : []);
    } catch (error) {
      console.error('Failed to load university detail', error);
      setSelectedUniversity(uni);
      setSelectedUniversityDegrees([]);
      setSelectedUniversityScholarships([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeUniversityDetail = () => {
    setDetailModalOpen(false);
    setSelectedUniversity(null);
    setSelectedUniversityDegrees([]);
    setSelectedUniversityScholarships([]);
  };

  const parseAdditionalInfo = (value) => {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const controlStyle = {
    color: '#0f172a',
    minHeight: '46px',
    borderRadius: '14px',
    border: '1px solid #dbe4ef',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
    padding: '0 14px',
    fontSize: '14px',
    fontWeight: '600',
  };

  const actionButtonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    padding: '0',
  };

  const selectChevronStyle = {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    paddingRight: '42px',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '14px',
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const countryOptions = Array.from(
    new Set(
      universities
        .map((uni) => (uni.country || '').trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch =
      !normalizedSearch ||
      [uni.name, uni.country, uni.location, uni.description, uni.websiteUrl]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    const matchesStatus = statusFilter === 'All' || uni.status === statusFilter;
    const matchesCountry = countryFilter === 'All' || uni.country === countryFilter;
    return matchesSearch && matchesStatus && matchesCountry;
  });

  return (
    <div className="admin-content">
      {toast && (
        <div
          style={{
            marginBottom: '18px',
            padding: '12px 16px',
            borderRadius: '14px',
            fontWeight: 700,
            boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
            background: toast.type === 'error' ? '#fff1f2' : '#ecfdf5',
            border: toast.type === 'error' ? '1px solid #fecdd3' : '1px solid #a7f3d0',
            color: toast.type === 'error' ? '#be123c' : '#166534',
          }}
        >
          {toast.text}
        </div>
      )}
      <div className="admin-header">
        <div className="admin-title">
          <h1>University Management</h1>
          <p>Configure institutional partners and program offerings.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          + Add University
        </button>
      </div>

      <div
        style={{
          marginTop: '18px',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '12px',
          alignItems: 'end',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Search
          </label>
          <input
            type="text"
            className="ai-input"
            placeholder="Search by name, country, location, website..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={controlStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Status
          </label>
          <select
            className="ai-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...controlStyle, ...selectChevronStyle }}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Country
          </label>
          <select
            className="ai-input"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            style={{ ...controlStyle, ...selectChevronStyle }}
          >
            <option value="All">All countries</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-wrapper" style={{ marginTop: '24px' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>Country</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUniversities.map(uni => (
              <tr key={uni.id}>
                <td>
                  {uni.image ? (
                    <img
                      src={uni.image}
                      alt={uni.name}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://placehold.co/40x40?text=Uni'; }}
                    />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>No Logo</div>
                  )}
                </td>
                <td><strong>{uni.name}</strong></td>
                <td>{uni.country}</td>
                <td>
                  <select
                    className="ai-input"
                    value={uni.status}
                    onChange={(e) => updateStatus(uni.id, e.target.value)}
                    style={{
                      ...selectChevronStyle,
                      padding: '0 14px',
                      fontSize: '13px',
                      width: 'auto',
                      minHeight: '38px',
                      borderRadius: '999px',
                      border: '1px solid transparent',
                      fontWeight: '700',
                      boxShadow: 'none',
                      background: uni.status === 'Active' ? '#dcfce7' : uni.status === 'Under Review' ? '#fef9c3' : '#fee2e2',
                      color: uni.status === 'Active' ? '#166534' : uni.status === 'Under Review' ? '#854d0e' : '#991b1b',
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openUniversityDetail(uni)}
                      style={{ ...actionButtonStyle, color: '#0f172a' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleOpenModal(uni)}
                      style={{ ...actionButtonStyle, color: '#0891b2' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUniversity(uni)}
                      style={{ ...actionButtonStyle, color: '#ef4444' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUniversities.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No universities match the current search/filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>{editingId ? 'Edit University' : 'Add New University'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <iconify-icon icon="ri:close-line"></iconify-icon>
              </button>
            </div>
            <form onSubmit={handleSaveUniversity} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>University Name</label>
                  <input
                    type="text"
                    className="ai-input"
                    required
                    value={newUni.name}
                    onChange={(e) => setNewUni({ ...newUni, name: e.target.value })}
                    placeholder="e.g. Harvard University"
                    style={{ color: '#1e293b' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Country</label>
                  <input
                    type="text"
                    className="ai-input"
                    required
                    value={newUni.country}
                    onChange={(e) => setNewUni({ ...newUni, country: e.target.value })}
                    placeholder="e.g. USA"
                    style={{ color: '#1e293b' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>University Image URL</label>
                  <input
                    type="text"
                    className="ai-input"
                    placeholder="https://example.com/logo.png"
                    value={newUni.image}
                    onChange={(e) => setNewUni({ ...newUni, image: e.target.value })}
                    style={{ color: '#1e293b' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUniversityImageUpload(e.target.files?.[0])}
                      style={{ color: '#1e293b', fontSize: '12px' }}
                    />
                    {imageUploading && <small style={{ color: '#64748b' }}>Uploading image...</small>}
                  </div>
                  {newUni.image && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <img
                        src={newUni.image}
                        alt="University preview"
                        style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <button
                        type="button"
                        onClick={handleUniversityImageDelete}
                        style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
                        Delete Uploaded Image
                      </button>
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>University Website Link</label>
                  <input
                    type="text"
                    className="ai-input"
                    placeholder="https://example.com"
                    value={newUni.websiteUrl}
                    onChange={(e) => setNewUni({ ...newUni, websiteUrl: e.target.value })}
                    style={{ color: '#1e293b' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Short Description</label>
                  <input
                    type="text"
                    className="ai-input"
                    placeholder="One-liner summary..."
                    value={newUni.description}
                    onChange={(e) => setNewUni({ ...newUni, description: e.target.value })}
                    style={{ color: '#1e293b' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Detailed About (Main Bio)</label>
                  <textarea
                    className="ai-input"
                    placeholder="Detailed history and vision..."
                    value={newUni.about}
                    onChange={(e) => setNewUni({ ...newUni, about: e.target.value })}
                    style={{ color: '#1e293b', minHeight: '80px', padding: '12px', resize: 'vertical' }}
                  />
                </div>
                <div className="admin-form-row">
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>World Rank</label>
                    <input
                      type="text"
                      className="ai-input"
                      placeholder="e.g. #150"
                      value={newUni.rank}
                      onChange={(e) => setNewUni({ ...newUni, rank: e.target.value })}
                      style={{ color: '#1e293b' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Specific Location/City</label>
                    <input
                      type="text"
                      className="ai-input"
                      placeholder="e.g. London, UK"
                      value={newUni.location}
                      onChange={(e) => setNewUni({ ...newUni, location: e.target.value })}
                      style={{ color: '#1e293b' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Campus Life</label>
                  <textarea
                    className="ai-input"
                    placeholder="Facilities, clubs, student experience..."
                    value={newUni.campusLife}
                    onChange={(e) => setNewUni({ ...newUni, campusLife: e.target.value })}
                    style={{ color: '#1e293b', minHeight: '80px', padding: '12px', resize: 'vertical' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Admission Criteria</label>
                  <textarea
                    className="ai-input"
                    placeholder="GPA, IELTS, specific documents required..."
                    value={newUni.admissionCriteria}
                    onChange={(e) => setNewUni({ ...newUni, admissionCriteria: e.target.value })}
                    style={{ color: '#1e293b', minHeight: '80px', padding: '12px', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Key Stats (Shown in Key Stats Tab)</label>
                    <button type="button" onClick={handleAddExtraField} style={{ fontSize: '12px', padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Key Stat</button>
                  </div>
                  <small style={{ display: 'block', color: '#64748b', marginBottom: '8px' }}>
                    Example: Label = Total Students, Value = 28,000+
                  </small>
                  {extraInfoFields.map((field, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="Stat Label (e.g. Acceptance Rate)"
                        value={field.label}
                        onChange={(e) => handleExtraFieldChange(idx, 'label', e.target.value)}
                        style={{ flex: 1, color: '#1e293b' }}
                      />
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="Stat Value (e.g. 18%)"
                        value={field.value}
                        onChange={(e) => handleExtraFieldChange(idx, 'value', e.target.value)}
                        style={{ flex: 1, color: '#1e293b' }}
                      />
                      <button type="button" onClick={() => handleRemoveExtraField(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <iconify-icon icon="ri:delete-bin-line"></iconify-icon>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>University Status</label>
                  <select
                    className="ai-input"
                    value={newUni.status}
                    onChange={(e) => setNewUni({ ...newUni, status: e.target.value })}
                    style={{ ...controlStyle, ...selectChevronStyle }}
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions" style={{ padding: '20px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                <button type="button" className="btn-outline" style={{ flex: 1, padding: '12px' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-apply" style={{ flex: 1, padding: '12px', background: '#0f172a', color: 'white', border: 'none' }}>
                  {editingId ? 'Update University' : 'Add University Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '980px' }}>
            <div className="modal-header">
              <h3>University Detail View</h3>
              <button className="btn-close" onClick={closeUniversityDetail}>
                <iconify-icon icon="ri:close-line"></iconify-icon>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px', maxHeight: '78vh', overflowY: 'auto' }}>
              {detailLoading || !selectedUniversity ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Loading university detail...
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                      gap: '18px',
                      alignItems: 'center',
                      marginBottom: '24px',
                      padding: '18px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <img
                      src={selectedUniversity.image || 'https://placehold.co/120x120?text=Logo'}
                      alt={selectedUniversity.name}
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #cbd5e1' }}
                    />
                    <div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span className="status-tag editor">{selectedUniversity.country || 'No country'}</span>
                        <span className="status-tag user">{selectedUniversity.status || 'Unknown'}</span>
                        {selectedUniversity.rank && (
                          <span className="status-tag marketing">Rank {selectedUniversity.rank}</span>
                        )}
                      </div>
                      <h2 style={{ color: '#0f172a', marginBottom: '8px' }}>{selectedUniversity.name}</h2>
                      <p style={{ color: '#475569', marginBottom: '12px' }}>
                        {selectedUniversity.description || 'No short description added yet.'}
                      </p>
                      <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', color: '#334155', fontSize: '13px' }}>
                        <span><strong>Location:</strong> {selectedUniversity.location || selectedUniversity.country || 'Not set'}</span>
                        <span><strong>Website:</strong> {selectedUniversity.websiteUrl || 'Not set'}</span>
                        <span><strong>Programs:</strong> {selectedUniversityDegrees.length}</span>
                        <span><strong>Scholarships:</strong> {selectedUniversityScholarships.length}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', background: 'white' }}>
                      <h4 style={{ marginBottom: '10px', color: '#0f172a' }}>Institution Overview</h4>
                      <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {selectedUniversity.about || 'No detailed about section added yet.'}
                      </p>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', background: 'white' }}>
                      <h4 style={{ marginBottom: '10px', color: '#0f172a' }}>Campus & Admission</h4>
                      <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
                        <strong style={{ color: '#0f172a' }}>Campus life:</strong>{' '}
                        {selectedUniversity.campusLife || 'Not added.'}
                      </p>
                      <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        <strong style={{ color: '#0f172a' }}>Admission criteria:</strong>{' '}
                        {selectedUniversity.admissionCriteria || 'Not added.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', background: 'white', marginBottom: '16px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#0f172a' }}>Key Stats / Partnership Details</h4>
                    {parseAdditionalInfo(selectedUniversity.additionalInfo).length === 0 ? (
                      <p style={{ color: '#64748b' }}>No key stats or partnership metadata added yet.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                        {parseAdditionalInfo(selectedUniversity.additionalInfo).map((entry, idx) => (
                          <div key={`${entry.label}-${idx}`} style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{entry.label}</div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{entry.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', background: 'white', marginBottom: '16px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#0f172a' }}>Programs, Fees & Deadlines</h4>
                    {selectedUniversityDegrees.length === 0 ? (
                      <p style={{ color: '#64748b' }}>No degrees linked to this university yet.</p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="modern-table">
                          <thead>
                            <tr>
                              <th>Program</th>
                              <th>Level</th>
                              <th>Fees</th>
                              <th>Intake</th>
                              <th>Deadline</th>
                              <th>Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUniversityDegrees.map((degree) => (
                              <tr key={degree.id}>
                                <td><strong>{degree.name}</strong></td>
                                <td>{degree.level || 'N/A'}</td>
                                <td>{degree.tuitionFee || degree.fees || 'N/A'}</td>
                                <td>{degree.intake || 'N/A'}</td>
                                <td>{degree.applyDate || 'N/A'}</td>
                                <td>{degree.duration || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', background: 'white' }}>
                    <h4 style={{ marginBottom: '10px', color: '#0f172a' }}>Scholarships</h4>
                    {selectedUniversityScholarships.length === 0 ? (
                      <p style={{ color: '#64748b' }}>No scholarships linked to this university yet.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {selectedUniversityScholarships.map((item) => (
                          <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                              <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                              <span style={{ color: '#334155', fontSize: '12px' }}>{item.status || 'Unknown'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', color: '#475569', fontSize: '13px' }}>
                              <span><strong>Amount:</strong> {item.amount || 'N/A'}</span>
                              <span><strong>Deadline:</strong> {item.deadline || 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="modal-actions" style={{ padding: '20px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
              <button type="button" className="btn-outline" style={{ flex: 1, padding: '12px' }} onClick={closeUniversityDetail}>
                Close
              </button>
              {selectedUniversity && (
                <button type="button" className="btn-apply" style={{ flex: 1, padding: '12px', background: '#0f172a', color: 'white', border: 'none' }} onClick={() => { closeUniversityDetail(); handleOpenModal(selectedUniversity); }}>
                  Edit University
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              background: '#fff',
              borderRadius: '20px',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 28px 60px rgba(15,23,42,0.22)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 16px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(239,68,68,0.1)',
                color: '#dc2626',
                fontSize: '28px',
              }}
            >
              <iconify-icon icon="ri:error-warning-line"></iconify-icon>
            </div>
            <h3 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '22px' }}>Delete University?</h3>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
              Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
            </p>
            <div style={{ marginTop: '22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button type="button" className="btn-outline" style={{ padding: '12px 16px' }} onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn-apply" style={{ padding: '12px 16px', background: '#dc2626', color: '#fff', border: 'none' }} onClick={confirmDeleteUniversity}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityManagement;
