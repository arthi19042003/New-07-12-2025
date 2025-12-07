import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button } from "react-bootstrap";
import { 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown, 
  FaChevronDown, 
  FaChevronLeft, 
  FaChevronRight,
  FaEye,
  FaDownload,
  FaTrash
} from "react-icons/fa";
import api from "../api/axios";
import "./SubmissionStatus.css";

const ITEMS_PER_PAGE = 5;

const SubmissionStatus = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // --- Filter, Sort & Pagination State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Modal State ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await api.get("/submissions");
      setSubmissions(res.data);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOption]);

  const processedSubmissions = useMemo(() => {
    let data = [...submissions];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(sub => {
        const candidateName = sub.candidate ? `${sub.candidate.firstName} ${sub.candidate.lastName}` : "";
        const email = sub.candidate?.email || "";
        const position = sub.position?.title || "";
        const company = sub.candidate?.company || "";

        return (
          candidateName.toLowerCase().includes(lowerTerm) ||
          email.toLowerCase().includes(lowerTerm) ||
          position.toLowerCase().includes(lowerTerm) ||
          company.toLowerCase().includes(lowerTerm)
        );
      });
    }

    if (statusFilter !== "All") {
      data = data.filter(sub => 
        sub.status && sub.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    data.sort((a, b) => {
      switch (sortOption) {
        case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
        case "name_asc":
          const nameA = a.candidate ? `${a.candidate.firstName}` : "";
          const nameB = b.candidate ? `${b.candidate.firstName}` : "";
          return nameA.localeCompare(nameB);
        case "status": return (a.status || "").localeCompare(b.status || "");
        default: return 0;
      }
    });

    return data;
  }, [submissions, searchTerm, statusFilter, sortOption]);

  const totalItems = processedSubmissions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedSubmissions = processedSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  const handleView = async (candidateId) => {
    if (!candidateId) return alert("Candidate information missing.");
    try {
      const response = await api.get(`/candidates/resume/${candidateId}`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (error) {
      alert("Unable to view resume.");
    }
  };

  const handleDownload = async (candidateId, filename) => {
    if (!candidateId) return alert("Candidate information missing.");
    try {
      const response = await api.get(`/candidates/resume/${candidateId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download resume.");
    }
  };

  const initiateDelete = (id) => {
    setSubmissionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!submissionToDelete) return;
    try {
      await api.delete(`/submissions/${submissionToDelete}`);
      setSubmissions((prev) => prev.filter((s) => s._id !== submissionToDelete));
      setMessage("✅ Submission deleted successfully.");
    } catch (err) {
      alert("Failed to delete submission.");
    } finally {
      setShowDeleteModal(false);
      setSubmissionToDelete(null);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="ss-page-container">
      <div className="ss-card">
        <h2 className="ss-title">My Submissions</h2>

        <div className="ss-controls">
          <div className="ss-search-wrapper">
            <FaSearch className="ss-search-icon" />
            <input 
              type="text" 
              placeholder="Search Candidate, Email, or Position..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ss-search-input"
            />
          </div>

          <div className="ss-filter-wrapper">
            <FaFilter className="ss-filter-icon" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ss-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="interviewed">Interviewed</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
            <FaChevronDown className="ss-chevron" />
          </div>

          <div className="ss-filter-wrapper">
            <FaSortAmountDown className="ss-filter-icon" />
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="ss-filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="status">Status</option>
            </select>
            <FaChevronDown className="ss-chevron" />
          </div>
        </div>

        {message && <div className="ss-alert">{message}</div>}

        {loading ? (
          <p className="ss-loading">Loading Submissions...</p>
        ) : paginatedSubmissions.length === 0 ? (
          <div className="ss-empty">
            <p>No submissions found.</p>
          </div>
        ) : (
          <>
            <div className="ss-table-wrapper">
              <table className="ss-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Company / HM</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubmissions.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div className="fw-bold">{s.candidate?.firstName} {s.candidate?.lastName}</div>
                        <div className="text-muted small">{s.candidate?.email}</div>
                      </td>
                      <td className="text-secondary">{s.position?.title || "N/A"}</td>
                      <td>
                        <div className="small text-dark">{s.candidate?.company}</div>
                        <div className="small text-muted">{s.candidate?.hiringManager}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600', textTransform: 'capitalize', color: '#374151' }}>
                          {s.status || "Submitted"}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="ss-actions">
                          <button className="ss-btn-icon view" title="View Resume" onClick={() => handleView(s.candidate?._id)}>
                            <FaEye />
                          </button>
                          <button className="ss-btn-icon download" title="Download Resume" onClick={() => handleDownload(s.candidate?._id, s.candidate?.resumeOriginalName)}>
                            <FaDownload />
                          </button>
                          <button className="ss-btn-icon delete" title="Delete Submission" onClick={() => initiateDelete(s._id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- PAGINATION (Matched to Reference Code) --- */}
            {totalItems > 0 && (
              <div className="d-flex justify-content-center pb-4 pt-3">
                <div 
                  className="d-flex align-items-center justify-content-between bg-white border rounded shadow-sm p-1" 
                  style={{ minWidth: '250px' }}
                >
                  <button 
                    className="btn btn-light d-flex align-items-center justify-content-center border-0"
                    onClick={handlePrev} 
                    disabled={currentPage === 1}
                    style={{ width: '32px', height: '32px', padding: 0, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: 'transparent' }}
                  >
                    <FaChevronLeft size={14} className={currentPage === 1 ? "text-muted" : "text-dark"} />
                  </button>

                  <span className="fw-semibold text-secondary small mx-3" style={{ whiteSpace: 'nowrap' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button 
                    className="btn btn-light d-flex align-items-center justify-content-center border-0"
                    onClick={handleNext} 
                    disabled={currentPage === totalPages}
                    style={{ width: '32px', height: '32px', padding: 0, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: 'transparent' }}
                  >
                    <FaChevronRight size={14} className={currentPage === totalPages ? "text-muted" : "text-dark"} />
                  </button>
                </div>
              </div>
            )}

          </>
        )}
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this submission? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubmissionStatus;