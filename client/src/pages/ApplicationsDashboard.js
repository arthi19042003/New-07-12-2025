import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Form,
  Spinner,
  Modal,
  Table,
  Container,
  Row,
  Col,
  Card,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { 
  FaSearch, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight, 
  FaChevronDown,
  FaFileAlt,       // Resume
  FaClipboardCheck,// Review
  FaCalendarAlt,   // Schedule
  FaHistory,       // History
  FaBan,           // Reject
  FaCheckCircle,   // Hire
  FaUserCheck,      // Hired Status
  FaSortAmountDown // Sort Icon
} from 'react-icons/fa';
import toast, { Toaster } from "react-hot-toast";
import "./ApplicationsDashboard.css";

const ITEMS_PER_PAGE = 5;

// --- Local API Helper ---
const api = {
  get: async (endpoint) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    const data = await res.json();
    return { data };
  },
  put: async (endpoint, payload) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api${endpoint}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return { status: res.status, data: await res.json() };
  }
};

export default function ApplicationsDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Filter, Sort & Pagination State ---
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("newest"); // 🟢 New Sort State
  const [currentPage, setCurrentPage] = useState(1);

  // --- Modal States ---
  const [showScheduleModal, setShowScheduleModal] = useState(false); 
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- Data States ---
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [history, setHistory] = useState([]);
  const [pendingAction, setPendingAction] = useState({ id: null, type: '' });
  
  const token = localStorage.getItem("token"); 

  // --- Icon Styles (Purple, No Background) ---
  const iconStyle = {
    cursor: "pointer",
    fontSize: "1.2rem",
    color: "#6d28d9", // Purple
    transition: "transform 0.2s ease-in-out",
    background: "transparent",
    border: "none",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const disabledIconStyle = {
    ...iconStyle,
    color: "#cbd5e1", // Grey
    cursor: "not-allowed"
  };

  const fetchApplications = async () => {
    if (!token) {
      setLoading(false);
      return; 
    }
    try {
      setLoading(true);
      const res = await api.get("/applications");
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, [token]);

  const updateStatus = async (id, action, payload = {}) => {
    if (!token) return;
    try {
      const res = await api.put(`/applications/${id}/${action}`, payload);
      if (res.status === 200) {
        toast.success(`Application updated successfully`);
        fetchApplications(); 
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      toast.error(`Failed to update application`);
    }
  };

  // --- Confirmation Handlers ---
  const initiateAction = (id, type) => {
    setPendingAction({ id, type });
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (pendingAction.id && pendingAction.type) {
      updateStatus(pendingAction.id, pendingAction.type);
    }
    setShowConfirmModal(false);
    setPendingAction({ id: null, type: '' });
  };

  // --- Actions ---
  const handleViewResume = (resumePath) => {
    if (!resumePath) {
        toast.error("No resume file available.");
        return;
    }
    const normalizedPath = resumePath.replace(/\\/g, "/");
    const fileUrl = `http://localhost:5000/${normalizedPath}`;
    window.open(fileUrl, "_blank");
  };

  const handleViewHistory = async (email) => {
    if (!token) return;
    try {
      const res = await api.get(`/applications/history/${email}`);
      setHistory(res.data);
      setShowHistoryModal(true); 
    } catch (err) {
      console.error("Error fetching history:", err);
      toast.error("Failed to load history.");
    }
  };

  const handleOpenSchedule = (app) => {
    setSelectedApp(app);
    setInterviewDate("");
    setInterviewTime("");
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = async () => {
    if(!selectedApp) return;
    if(!interviewDate || !interviewTime) {
      toast.error("Please select date and time");
      return;
    }
    try {
      await updateStatus(selectedApp._id, "review", { 
        interviewDate, 
        interviewTime,
        status: "Interview" 
      });
      setShowScheduleModal(false);
    } catch(err) {
      console.error(err);
    }
  };

  // --- FILTER, SORT & PAGINATION LOGIC ---
  const filteredApplications = useMemo(() => {
    let items = [...applications];
    const filterLower = filterText.toLowerCase();

    // 1. Filter
    items = items.filter(app => {
      if (statusFilter !== 'All' && app.status !== statusFilter) return false;
      if (filterLower) {
        const name = (app.candidateName || '').toLowerCase();
        const email = (app.email || '').toLowerCase();
        const position = (app.position || '').toLowerCase();
        return name.includes(filterLower) || email.includes(filterLower) || position.includes(filterLower);
      }
      return true;
    });

    // 2. 🟢 Sort
    items.sort((a, b) => {
        switch(sortOption) {
            case "newest": // Date Desc
                return new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0);
            case "oldest": // Date Asc
                return new Date(a.appliedAt || 0) - new Date(b.appliedAt || 0);
            case "candidate_asc": // Name A-Z
                return (a.candidateName || "").localeCompare(b.candidateName || "");
            case "position_asc": // Position A-Z
                return (a.position || "").localeCompare(b.position || "");
            case "status_asc": // Status A-Z
                return (a.status || "").localeCompare(b.status || "");
            default:
                return 0;
        }
    });

    // 3. Pagination Reset
    if (currentPage > Math.ceil(items.length / ITEMS_PER_PAGE) && items.length > 0) {
      setCurrentPage(1);
    } else if (items.length === 0 && currentPage !== 1) {
       setCurrentPage(1);
    }
    return items;
  }, [applications, filterText, statusFilter, sortOption, currentPage]);

  const totalItems = filteredApplications.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage]);
  
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  const renderTooltip = (props, text) => (
    <Tooltip id="button-tooltip" {...props}>{text}</Tooltip>
  );

  if (loading)
    return (
      <Container fluid className="ad-dashboard-container text-center">
        <div className="py-5">
          <Spinner animation="border" variant="primary" /> 
          <p className="mt-2 text-muted">Loading Applications...</p>
        </div>
      </Container>
    );

  return (
    <Container fluid className="ad-dashboard-container p-4">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: "#5b21b6" }}>Candidate Applications</h2>
      </div>

      {/* 🟢 Updated Row Layout for Search, Filter, and Sort */}
      <Row className="mb-4 g-3">
        {/* Search */}
        <Col md={6}>
          <div className="ad-search-box position-relative bg-white rounded shadow-sm p-2">
             <FaSearch className="ad-search-icon text-primary ms-2" />
             <Form.Control 
               type="text" 
               placeholder="Filter by Candidate Name, Email, or Position..." 
               className="ps-5 border-0 ad-search-input" 
               value={filterText} 
               onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }} 
             />
          </div>
        </Col>

        {/* Filter Status */}
        <Col md={3}>
           <div className="ad-filter-wrapper bg-white rounded shadow-sm p-2">
             <FaFilter className="ad-filter-icon-left" />
             <Form.Select 
               value={statusFilter} 
               onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
               className="ad-filter-select border-0 shadow-none"
             >
               <option value="All">All Statuses</option>
               <option value="Applied">Applied</option>
               <option value="Submitted">Submitted</option>
               <option value="Under Review">Under Review</option>
               <option value="Interview">Interview</option>
               <option value="Hired">Hired</option>
               <option value="Rejected">Rejected</option>
             </Form.Select>
             <FaChevronDown className="ad-filter-icon-right" />
           </div>
        </Col>

        {/* 🟢 New Sort Dropdown */}
        <Col md={3}>
           <div className="ad-filter-wrapper bg-white rounded shadow-sm p-2">
             <FaSortAmountDown className="ad-filter-icon-left" />
             <Form.Select 
               value={sortOption} 
               onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }} 
               className="ad-filter-select border-0 shadow-none"
             >
               <option value="newest">Sort by: Newest</option>
               <option value="oldest">Sort by: Oldest</option>
               <option value="candidate_asc">Sort by: Candidate (A-Z)</option>
               <option value="position_asc">Sort by: Position</option>
               <option value="status_asc">Sort by: Status</option>
             </Form.Select>
             <FaChevronDown className="ad-filter-icon-right" />
           </div>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle ad-table mb-0">
              <thead className="bg-light table-light">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Position</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Interview</th>
                  <th className="p-3 text-center" style={{ minWidth: "220px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <h5>No applications found.</h5>
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map((app) => (
                    <tr key={app._id}>
                      <td className="p-3">
                        <strong className="text-dark">{app.candidateName || "Name Unavailable"}</strong>
                        <div className="text-muted small">{app.email}</div>
                      </td>
                      <td className="p-3 text-secondary">{app.position}</td>
                      <td className="p-3">
                        <span className="fw-bold text-dark">
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {app.interviewDate ? (
                          <div className="small text-muted">
                            <div className="text-primary fw-bold"><FaCalendarAlt className="me-1"/> {new Date(app.interviewDate).toLocaleDateString()}</div>
                            {app.interviewTime && <div>{app.interviewTime}</div>}
                          </div>
                        ) : "-"}
                      </td>
                      
                      {/* --- ACTIONS COLUMN (ICONS ONLY) --- */}
                      <td className="p-3 text-center">
                        <div className="d-flex flex-row gap-2 justify-content-center align-items-center">
                          
                          {/* Resume */}
                          <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "View Resume")}>
                            <button style={iconStyle} onClick={() => handleViewResume(app.resumeUrl)}>
                              <FaFileAlt />
                            </button>
                          </OverlayTrigger>
                          
                          {/* Review */}
                          {["Applied", "Submitted", "submitted"].includes(app.status) && (
                            <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Mark Under Review")}>
                              <button style={iconStyle} onClick={() => updateStatus(app._id, "review")}>
                                <FaClipboardCheck />
                              </button>
                            </OverlayTrigger>
                          )}

                          {/* Schedule */}
                          {app.status !== "Hired" && app.status !== "Rejected" && (
                            <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Schedule Interview")}>
                              <button style={iconStyle} onClick={() => handleOpenSchedule(app)}>
                                <FaCalendarAlt />
                              </button>
                            </OverlayTrigger>
                          )}
                          
                          {/* Reject */}
                          {app.status !== "Rejected" && app.status !== "Hired" && (
                            <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Reject Candidate")}>
                              <button style={{...iconStyle, color: "#ef4444"}} onClick={() => initiateAction(app._id, "reject")}>
                                <FaBan />
                              </button>
                            </OverlayTrigger>
                          )}
                          
                          {/* History */}
                          <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "View History")}>
                            <button style={{...iconStyle, color: "#64748b"}} onClick={() => handleViewHistory(app.email)}>
                              <FaHistory />
                            </button>
                          </OverlayTrigger>
                          
                          {/* Hire */}
                          {app.status === "Hired" ? (
                            <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Candidate Hired")}>
                              <button style={{...iconStyle, cursor: "default", color: "#10b981"}}>
                                <FaUserCheck />
                              </button>
                            </OverlayTrigger>
                          ) : (
                            <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Hire Candidate")}>
                              <button 
                                style={app.status === "Rejected" ? disabledIconStyle : {...iconStyle, color: "#10b981"}} 
                                onClick={() => { if (app.status !== "Rejected") initiateAction(app._id, "hire"); }}
                                disabled={app.status === "Rejected"}
                              >
                                <FaCheckCircle />
                              </button>
                            </OverlayTrigger>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* --- PAGINATION SECTION --- */}
          {totalItems > 0 && ( 
            <div className="d-flex justify-content-center pb-4 pt-3">
                <div 
                  className="d-flex align-items-center justify-content-between bg-white border rounded shadow-sm p-1" 
                  style={{ minWidth: '250px' }}
                >
                    <button 
                        className="d-flex align-items-center justify-content-center border-0"
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
                        className="d-flex align-items-center justify-content-center border-0"
                        onClick={handleNext} 
                        disabled={currentPage === totalPages}
                        style={{ width: '32px', height: '32px', padding: 0, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: 'transparent' }}
                    >
                        <FaChevronRight size={14} className={currentPage === totalPages ? "text-muted" : "text-dark"} />
                    </button>
                </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* --- Action Confirmation Modal --- */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {pendingAction.type === 'hire' ? <strong className="text-success">HIRE</strong> : <strong className="text-danger">REJECT</strong>} this candidate?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
          <Button variant={pendingAction.type === 'hire' ? "success" : "danger"} onClick={confirmAction}>
            {pendingAction.type === 'hire' ? "Yes, Hire" : "Yes, Reject"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Schedule Modal --- */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp && <p className="text-muted mb-3">Scheduling for: <strong>{selectedApp.candidateName}</strong></p>}
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Time</Form.Label>
            <Form.Control type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmSchedule} style={{ backgroundColor: "#6d28d9", borderColor: "#6d28d9" }}>Confirm Schedule</Button>
        </Modal.Footer>
      </Modal>

      {/* --- History Modal --- */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Candidate Application History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {history.length === 0 ? (
            <p className="text-center text-muted">No history found.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Interview</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.position}</td>
                    <td>{h.status}</td>
                    <td>{new Date(h.appliedAt).toLocaleDateString()}</td>
                    <td>{h.interviewDate ? new Date(h.interviewDate).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}