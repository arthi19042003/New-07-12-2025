import React, { useEffect, useState } from "react";
import "./SubmissionStatus.css";
import api from "../api/axios";
import { Modal, Button } from "react-bootstrap"; // Import Modal components

const filterFields = {
  candidateName: "Candidate Name",
  email: "Email",
  phone: "Phone",
  hiringManager: "Hiring Manager",
  company: "Company",
};

const initialFilters = Object.keys(filterFields).reduce((acc, key) => {
  acc[key] = "";
  return acc;
}, {});

const SubmissionStatus = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- Modal State ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setMessage("");

      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v.trim() !== "")
      );

      const res = await api.get("/submissions", { params: activeFilters });

      const sorted = res.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setSubmissions(sorted);
      if (res.data.length === 0) {
        if (Object.keys(activeFilters).length > 0) {
          setMessage("ℹ️ No submissions found matching your filters.");
        } else {
          setMessage("ℹ️ You have not submitted any candidates yet.");
        }
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setMessage("❌ Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubmissions();
  };

  const handleView = async (candidateId) => {
    if (!candidateId) return alert("Candidate information missing.");
    try {
      const response = await api.get(`/candidates/resume/${candidateId}`, {
        responseType: 'blob'
      });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error("View error:", error);
      alert("Unable to view resume. File might be missing or invalid format.");
    }
  };

  const handleDownload = async (candidateId, filename) => {
    if (!candidateId) return alert("Candidate information missing.");
    try {
      const response = await api.get(`/candidates/resume/${candidateId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download resume.");
    }
  };

  // --- New: Open Modal Logic ---
  const initiateDelete = (id) => {
    setSubmissionToDelete(id);
    setShowDeleteModal(true);
  };

  // --- New: Confirm Delete Logic ---
  const confirmDelete = async () => {
    if (!submissionToDelete) return;

    try {
      await api.delete(`/submissions/${submissionToDelete}`);
      setSubmissions((prev) => prev.filter((s) => s._id !== submissionToDelete));
      setMessage(""); 
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete submission.");
    } finally {
      setShowDeleteModal(false);
      setSubmissionToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSubmissionToDelete(null);
  };

  return (
    <div className="submission-status-page">
      <div className="submission-status-card">
        <h2 className="submission-status-title">My Submissions</h2>

        <form onSubmit={handleSearch} className="submission-status-search">
          {Object.entries(filterFields).map(([key, placeholder]) => (
            <input
              key={key}
              type="text"
              name={key}
              placeholder={placeholder}
              value={filters[key]}
              onChange={handleChange}
              className="submission-status-input"
            />
          ))}
          <button type="submit" className="submission-status-btn">
            Search
          </button>
        </form>

        {loading && (
          <div className="submission-status-loading">
            Loading Submissions...
          </div>
        )}

        {message && (
          <div className={message.startsWith("❌") ? "error" : "success"} style={{textAlign: "center", marginBottom: "15px"}}>
            {message}
          </div>
        )}

        {submissions.length > 0 && (
          <div className="submission-status-table-wrapper">
            <table className="submission-status-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Company / HM</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{fontWeight: 'bold'}}>{s.candidate?.firstName} {s.candidate?.lastName}</div>
                      <div style={{fontSize: '0.85rem', color: '#666'}}>{s.candidate?.email}</div>
                    </td>
                    <td>{s.position?.title || "N/A"}</td> 
                    <td>
                      <div>{s.candidate?.company}</div>
                      <div style={{fontSize: '0.8rem', color: '#888'}}>{s.candidate?.hiringManager}</div>
                    </td>
                    <td>
                      <span style={{ color: "black", fontWeight: "500" }}>
                        {s.status || "submitted"}
                      </span>
                    </td>
                    <td className="submission-status-actions">
                      <button
                        className="submission-status-view"
                        onClick={() => handleView(s.candidate?._id)}
                      >
                        View
                      </button>
                      <button
                        className="submission-status-download"
                        onClick={() => handleDownload(s.candidate?._id, s.candidate?.resumeOriginalName)}
                      >
                        Download
                      </button>
                      {/* Updated Delete Button to use Modal */}
                      <button
                        className="submission-status-delete"
                        onClick={() => initiateDelete(s._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Delete Confirmation Modal --- */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this submission? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubmissionStatus;