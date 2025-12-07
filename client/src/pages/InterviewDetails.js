import React, { useEffect, useState } from "react";
import { FaStar, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaSearch, FaFilter, FaSortAmountDown } from "react-icons/fa"; 
import { useNavigate, useParams } from "react-router-dom"; 
import { Modal, Button } from "react-bootstrap"; 
import api from "../api/axios";
import "./InterviewDetails.css";

// --- Helper Function to Validate Date ---
const isDateInPast = (dateString) => {
  try {
    if (!dateString) return false;
    const inputDate = new Date(dateString);
    const now = new Date();
    return inputDate < now;
  } catch (err) {
    console.error("Date validation error:", err);
    return false; 
  }
};

// --- Helper to Format Date for Display ---
const formatDateForDisplay = (isoString) => {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    }).replace(',', '').toUpperCase(); 
  } catch (e) {
    return isoString;
  }
};

function InterviewDetails() {
  const initialState = {
    candidateId: "", 
    candidateFirstName: "",
    candidateLastName: "",
    interviewerName: "",
    interviewerId: "", 
    date: "", 
    jobPosition: "",
    interviewMode: "Online",
    status: "Pending",
    result: "Pending",
    rating: 0,
    questionsAsked: "",
    notes: "",
    feedback: "",
    notifyManager: false,
  };

  const [form, setForm] = useState(initialState);
  const [interviews, setInterviews] = useState([]);
  const [interviewersList, setInterviewersList] = useState([]); 
  const [candidatesList, setCandidatesList] = useState([]); 
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Sort State
  const [sortOption, setSortOption] = useState("date_newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const navigate = useNavigate();
  const { id } = useParams(); 
  const stars = [1, 2, 3, 4, 5];

  // --- API Calls ---
  const fetchInterviewers = async () => {
    try {
      const { data } = await api.get("/interviews/list-interviewers"); 
      setInterviewersList(Array.isArray(data) ? data : []);
    } catch (err) {
      setInterviewersList([]);
    }
  };

  const fetchCandidates = async () => {
    try {
      const { data } = await api.get("/candidates"); 
      setCandidatesList(Array.isArray(data) ? data : []);
    } catch (err) {
      setCandidatesList([]);
    }
  };

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get("/interviews");
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setInterviews([]);
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchInterviewers(); 
    fetchCandidates(); 
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get("/interviews")
        .then(res => {
            const found = res.data.find(i => i._id === id);
            if(found) populateForm(found);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, sortOption]);

  const populateForm = (item) => {
    setForm({
      ...item,
      date: item.date || "", 
      rating: Number(item.rating || 0),
      notifyManager: item.notifyManager || false,
      interviewerId: item.interviewerId || "", 
      candidateId: item.candidateId || "", 
    });
    setEditingId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getCandidatePosition = (c) => {
      if (!c) return "";
      if (c.jobId && c.jobId.title) return c.jobId.title;
      if (c.position) return c.position;
      if (c.jobPosition) return c.jobPosition;
      return "Unknown Position";
  };

  const handleCandidateChange = (e) => {
    const selectedId = e.target.value;
    const selectedCandidate = candidatesList.find(c => c._id === selectedId);

    if (selectedCandidate) {
        const positionTitle = getCandidatePosition(selectedCandidate);
        setForm(prev => ({
            ...prev,
            candidateId: selectedId,
            candidateFirstName: selectedCandidate.firstName || (selectedCandidate.candidateName ? selectedCandidate.candidateName.split(' ')[0] : ""),
            candidateLastName: selectedCandidate.lastName || (selectedCandidate.candidateName ? selectedCandidate.candidateName.split(' ')[1] : ""),
            jobPosition: positionTitle === "Unknown Position" ? "" : positionTitle, 
        }));
    } else {
        setForm(prev => ({
            ...prev,
            candidateId: "",
            candidateFirstName: "",
            candidateLastName: "",
            jobPosition: ""
        }));
    }
  };

  const handleInterviewerChange = (e) => {
    const selectedId = e.target.value;
    const selectedUser = interviewersList.find(u => u._id === selectedId);
    setForm(prev => ({
      ...prev,
      interviewerId: selectedId,
      interviewerName: selectedUser ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}` : ""
    }));
  };

  const handleStarClick = (val) => {
    setForm((prev) => ({ ...prev, rating: val }));
  };

  const resetForm = () => {
    setForm(initialState);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDateInPast(form.date)) {
      setMessage("❌ You cannot schedule an interview in the past.");
      setTimeout(() => setMessage(""), 3000);
      return; 
    }
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (id) {
        await api.put(`/interviews/${id}`, payload);
        setMessage("✅ Interview updated successfully");
      } else {
        await api.post("/interviews", payload);
        setMessage("✅ Interview scheduled successfully");
      }
      await fetchInterviews();
      resetForm();
      setTimeout(() => {
          navigate("/hiring-manager/schedule"); 
          setMessage("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error while saving. Try again.");
    }
  };

  const handleEdit = (item) => {
    navigate(`/hiring-manager/schedule/${item._id}`);
  };

  const handleDeleteClick = (itemId) => {
    setDeleteId(itemId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/interviews/${deleteId}`);
      setMessage("🗑️ Interview deleted");
      await fetchInterviews();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error deleting record");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // --- Filtering Logic ---
  const filteredData = interviews.filter((it) => {
    const searchValue = search.trim().toLowerCase();
    
    const fName = it.candidateFirstName || "";
    const lName = it.candidateLastName || "";
    const pos = it.jobPosition || "";

    const found =
      fName.toLowerCase().includes(searchValue) ||
      lName.toLowerCase().includes(searchValue) ||
      pos.toLowerCase().includes(searchValue);
      
    const statusMatch = filterStatus === "All" || it.status === filterStatus;
    return found && statusMatch;
  });

  // --- Sorting Logic ---
  const sortedData = [...filteredData].sort((a, b) => {
    switch(sortOption) {
        case "date_newest": 
            return new Date(b.date || 0) - new Date(a.date || 0);
        case "date_oldest": 
            return new Date(a.date || 0) - new Date(b.date || 0);
        
        case "candidate_asc": 
            const nameA = `${a.candidateFirstName} ${a.candidateLastName}`.toLowerCase();
            const nameB = `${b.candidateFirstName} ${b.candidateLastName}`.toLowerCase();
            return nameA.localeCompare(nameB);
        case "candidate_desc": 
            const nameADesc = `${a.candidateFirstName} ${a.candidateLastName}`.toLowerCase();
            const nameBDesc = `${b.candidateFirstName} ${b.candidateLastName}`.toLowerCase();
            return nameBDesc.localeCompare(nameADesc);

        case "position_asc": 
             return (a.jobPosition || "").localeCompare(b.jobPosition || "");
        
        case "interviewer_asc": 
             return (a.interviewerName || "").localeCompare(b.interviewerName || "");

        case "status_asc":
             return (a.status || "").localeCompare(b.status || "");
        
        case "result_asc":
             return (a.result || "").localeCompare(b.result || "");
             
        default:
            return 0;
    }
  });

  // --- Pagination ---
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  if (loading) return <div className="id-page-container"><p style={{textAlign:'center', paddingTop:'50px'}}>Loading...</p></div>;

  return (
    <div className="id-page-container">
      {/* Form Card */}
      <div className="id-card">
        <h2 className="id-form-title">{id ? "Update Interview" : "Schedule Interview"}</h2>

        <form onSubmit={handleSubmit}>
          <h3 className="id-section-label">Candidate Information</h3>
          
          <div className="id-grid-2">
            <div className="id-form-field">
              <label>Select Candidate <span>*</span></label>
              <select 
                name="candidateId" 
                value={form.candidateId} 
                onChange={handleCandidateChange} 
                required
              >
                <option value="">-- Choose a Candidate --</option>
                {candidatesList.length > 0 ? (
                  candidatesList.map(candidate => (
                    <option key={candidate._id} value={candidate._id}>
                      {candidate.candidateName || `${candidate.firstName} ${candidate.lastName}`} ({candidate.email}) - {getCandidatePosition(candidate)}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No candidates found</option>
                )}
              </select>
            </div>

            <div className="id-form-field">
              <label>Job Position <span>*</span></label>
              <input 
                name="jobPosition" 
                value={form.jobPosition} 
                onChange={handleChange} 
                required 
                placeholder="Auto-filled from candidate or enter manually"
              />
            </div>
          </div>

          <h3 className="id-section-label">Interview Details</h3>
          <div className="id-grid-2">
            <div className="id-form-field">
              <label>Assign Interviewer <span>*</span></label>
              <select 
                name="interviewerId" 
                value={form.interviewerId} 
                onChange={handleInterviewerChange} 
                required
              >
                <option value="">-- Select Interviewer --</option>
                {interviewersList.length > 0 ? (
                  interviewersList.map(interviewer => (
                    <option key={interviewer._id} value={interviewer._id}>
                      {interviewer.profile?.firstName} {interviewer.profile?.lastName} ({interviewer.email})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No interviewers available</option>
                )}
              </select>
            </div>

            <div className="id-form-field">
              <label>Interview Date & Time <span>*</span></label>
              <input 
                type="datetime-local" 
                name="date" 
                value={form.date} 
                onChange={handleChange} 
                required 
                style={{ cursor: "pointer" }}
              />
            </div>

            <div className="id-form-field">
              <label>Interview Mode</label>
              <select name="interviewMode" value={form.interviewMode} onChange={handleChange}>
                <option>Online</option>
                <option>Offline</option>
                <option>Phone</option>
              </select>
            </div>
          </div>

          <h3 className="id-section-label">Status & Configuration</h3>
          <div className="id-grid-2">
            <div className="id-form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Pending</option>
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="id-form-field">
                <label style={{ visibility: 'hidden' }}>Notify</label>
                <div style={{display:'flex', alignItems:'center', gap: '10px', height: '45px'}}>
                    <input
                    type="checkbox"
                    name="notifyManager"
                    id="notifyManager"
                    checked={form.notifyManager}
                    onChange={handleChange}
                    style={{ width: "20px", height: "20px", margin: 0, cursor: "pointer" }}
                    />
                    <label htmlFor="notifyManager" style={{ marginBottom: "0", cursor: "pointer", fontSize: "0.95rem", color: "#333" }}>
                    Notify Hiring Manager 
                    </label>
                </div>
            </div>
          </div>
          
          {/* 🟢 CHANGED: Removed {id && (...)} check here, so this section is always visible */}
            <>
                <h3 className="id-section-label">Evaluation Results</h3>
                <div className="id-grid-2">
                    <div className="id-form-field">
                        <label>Result</label>
                        <select name="result" value={form.result} onChange={handleChange}>
                            <option>Pending</option>
                            <option>Pass</option>
                            <option>Fail</option>
                        </select>
                    </div>
                      <div className="id-form-field">
                          <label>Rating</label>
                          <div className="id-rating-stars">
                            {stars.map((s) => (
                                <FaStar 
                                    key={s} 
                                    className={`id-star ${form.rating >= s ? 'active' : ''}`} 
                                    onClick={() => handleStarClick(s)} 
                                />
                            ))}
                          </div>
                      </div>
                </div>
                <div className="id-form-field">
                  <label>Feedback</label>
                  <textarea 
                    name="feedback"
                    value={form.feedback} 
                    onChange={handleChange}
                    placeholder="Enter feedback here..."
                  />
                </div>
            </>
          
          {message && <div style={{ padding: '10px', textAlign:'center', background: message.includes('❌') ? '#fee2e2' : '#dcfce7', color: message.includes('❌') ? 'red' : 'green', borderRadius: '8px', marginTop: '10px' }}>{message}</div>}
          
          <button type="submit" className="id-btn-purple">
            {id ? "Update Interview" : "Schedule Interview"}
          </button>
        </form>
      </div>

      {/* Records Section */}
      <div className="id-card" style={{ marginTop: '40px' }}>
        <h3 className="id-section-label">Interview Records</h3>

        <div className="id-search-row">
          <div className="id-search-wrapper">
            <FaSearch className="id-search-icon" />
            <input 
              placeholder="Search Candidate / Position" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          <div className="id-filter-wrapper">
            <FaFilter className="id-filter-icon" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option>Pending</option>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="id-filter-wrapper">
            <FaSortAmountDown className="id-filter-icon" />
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="date_newest">Sort by: Date (Newest)</option>
              <option value="date_oldest">Sort by: Date (Oldest)</option>
              <option value="candidate_asc">Sort by: Candidate (A-Z)</option>
              <option value="position_asc">Sort by: Position</option>
              <option value="status_asc">Sort by: Status</option>
              <option value="result_asc">Sort by: Result</option>
            </select>
          </div>

        </div>

        <div className="id-table-wrapper">
            <div className="id-table-header">
              <span>Candidate</span>
              <span>Date & Time</span>
              <span>Position</span>
              <span>Interviewer</span> 
              <span>Status</span>
              <span>Result</span>
              <span>Actions</span>
            </div>

            {paginatedData.length === 0 ? (
              <p className="no-records" style={{textAlign: "center", padding: "20px", color: "#666"}}>No records found.</p>
            ) : (
              paginatedData.map((it) => (
                <div className="id-table-row" key={it._id}>
                  <span>{it.candidateFirstName || ""} {it.candidateLastName || ""}</span>
                  
                  <span>{formatDateForDisplay(it.date)}</span>
                  
                  <span>{it.jobPosition || "N/A"}</span>
                  <span>{it.interviewerName || "Unassigned"}</span>
                  
                  <span>{it.status || "Pending"}</span>
                  
                  <span>{it.result || "Pending"}</span>

                  <div className="id-row-actions">
                    <FaEdit 
                      className="id-icon" 
                      onClick={() => {
                        if (it.result !== "Pass") handleEdit(it);
                      }} 
                      title={it.result === "Pass" ? "Cannot edit passed interview" : "Edit"}
                      style={{ 
                        opacity: it.result === "Pass" ? 0.3 : 1, 
                        cursor: it.result === "Pass" ? 'not-allowed' : 'pointer',
                        pointerEvents: it.result === "Pass" ? 'none' : 'auto'
                      }}
                    />
                    <FaTrash className="id-icon delete" onClick={() => handleDeleteClick(it._id)} title="Delete" />
                  </div>
                </div>
              ))
            )}
        </div>

        {totalItems > 0 && ( 
            <div className="d-flex justify-content-center py-4 border-top bg-light rounded-bottom" style={{ marginTop: '15px', paddingTop: '20px' }}>
                <div 
                  className="d-flex align-items-center justify-content-between bg-white border rounded shadow-sm p-1" 
                  style={{ minWidth: '250px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #eee', borderRadius: '8px', padding: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                >
                    <button 
                        className="btn btn-light d-flex align-items-center justify-content-center border-0"
                        onClick={handlePrev} 
                        disabled={currentPage === 1}
                        style={{ width: '32px', height: '32px', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaChevronLeft size={14} color={currentPage === 1 ? "#ccc" : "#333"} />
                    </button>

                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 15px', whiteSpace: 'nowrap' }}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button 
                        className="btn btn-light d-flex align-items-center justify-content-center border-0"
                        onClick={handleNext} 
                        disabled={currentPage === totalPages}
                        style={{ width: '32px', height: '32px', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaChevronRight size={14} color={currentPage === totalPages ? "#ccc" : "#333"} />
                    </button>
                </div>
            </div>
        )}
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this interview record? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InterviewDetails;