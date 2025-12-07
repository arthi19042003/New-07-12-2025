import React, { useEffect, useState, useMemo } from "react";
import { Container, Card, Table, Button, Modal, Form, Row, Col, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown, 
  FaChevronLeft, 
  FaChevronRight, 
  FaChevronDown,
  FaVideo,       // Icon for "Take Interview" / Setup
  FaPaperPlane   // Icon for "Resend Link"
} from 'react-icons/fa';
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import "./InterviewerDashboard.css";

const ITEMS_PER_PAGE = 5;

export default function InterviewerDashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter, Sort & Pagination State ---
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [sending, setSending] = useState(false);

  // --- Icon Styles (Consistent with other pages) ---
  const iconStyle = {
    cursor: "pointer",
    fontSize: "1.2rem",
    color: "#6d28d9", // Purple theme
    transition: "transform 0.2s ease-in-out",
    background: "transparent",
    border: "none",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.get("/interviews/my-schedule");
      setInterviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      toast.error("Failed to load schedule");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // --- FILTER & SORT LOGIC ---
  const filteredInterviews = useMemo(() => {
    let items = [...interviews];
    const filterLower = filterText.toLowerCase();

    // 1. Filter by Status & Text
    items = items.filter(item => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      
      const fName = item.candidateFirstName || "";
      const lName = item.candidateLastName || "";
      const fullName = `${fName} ${lName}`.toLowerCase();
      const pos = (item.jobPosition || "").toLowerCase();
      const status = (item.status || "").toLowerCase();

      const matchesSearch = !filterText || 
        fullName.includes(filterLower) || 
        pos.includes(filterLower) || 
        status.includes(filterLower);

      return matchesStatus && matchesSearch;
    });

    // 2. Sort
    items.sort((a, b) => {
        switch(sortOption) {
            case "newest": 
                return new Date(b.date || 0) - new Date(a.date || 0);
            case "oldest": 
                return new Date(a.date || 0) - new Date(b.date || 0);
            case "candidate_asc": 
                const nameA = `${a.candidateFirstName} ${a.candidateLastName}`.toLowerCase();
                const nameB = `${b.candidateFirstName} ${b.candidateLastName}`.toLowerCase();
                return nameA.localeCompare(nameB);
            case "position_asc": 
                return (a.jobPosition || "").localeCompare(b.jobPosition || "");
            case "status_asc": 
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
  }, [interviews, filterText, statusFilter, sortOption, currentPage]);

  const totalItems = filteredInterviews.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const paginatedInterviews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInterviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInterviews, currentPage]);

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };


  // --- HANDLERS ---
  const handleOpenModal = (interview) => {
    setSelectedInterview(interview);
    setMeetingLink(interview.meetingLink || ""); 
    setShowModal(true);
  };

  const handleSendLink = async () => {
    if (!meetingLink.trim()) return toast.error("Please enter a valid link");
    
    try {
      setSending(true);
      await api.put(`/interviews/${selectedInterview._id}/send-link`, {
        meetingLink
      });
      
      toast.success("Meeting link sent to candidate!");
      setShowModal(false);
      fetchSchedule(); // Refresh list
    } catch (err) {
      toast.error("Failed to send link");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
      if(!dateStr) return "-";
      try {
        const date = new Date(dateStr);
        if(isNaN(date.getTime())) return dateStr; 
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      } catch(e) {
          return dateStr;
      }
  };

  const renderTooltip = (props, text) => (
    <Tooltip id="button-tooltip" {...props}>{text}</Tooltip>
  );

  const name = user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : "Interviewer";

  if (loading) return (
    <div className="int-d-page text-center">
        <div className="py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading schedule...</p>
        </div>
    </div>
  );

  return (
    <div className="int-d-page">
      <Toaster position="top-center" />
      <Container>
        <div className="int-d-header text-center mb-5">
          <h2 className="fw-bold" style={{ color: "#4c1d95" }}>My Interview Schedule</h2>
          <p className="text-muted">Welcome, {name}. Manage your assigned interviews here.</p>
        </div>

        {/* --- FILTERS & SORT ROW --- */}
        <Row className="mb-4 g-3">
            {/* Search */}
            <Col md={6}>
            <div className="int-d-search-box bg-white rounded shadow-sm p-2 position-relative">
                <FaSearch className="int-d-search-icon text-primary ms-2" />
                <Form.Control 
                type="text" 
                placeholder="Search Candidate, Position or Status..." 
                className="int-d-search-input border-0 ps-5" 
                value={filterText} 
                onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }} 
                />
            </div>
            </Col>

            {/* Filter */}
            <Col md={3}>
            <div className="int-d-filter-box bg-white rounded shadow-sm p-2 d-flex align-items-center position-relative">
                <FaFilter className="text-muted ms-2 me-2" />
                <Form.Select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                className="int-d-filter-select border-0 shadow-none fw-semibold"
                >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                </Form.Select>
                <FaChevronDown className="int-d-chevron text-muted me-2" />
            </div>
            </Col>

            {/* Sort */}
            <Col md={3}>
            <div className="int-d-filter-box bg-white rounded shadow-sm p-2 d-flex align-items-center position-relative">
                <FaSortAmountDown className="text-muted ms-2 me-2" />
                <Form.Select 
                value={sortOption} 
                onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }} 
                className="int-d-filter-select border-0 shadow-none fw-semibold"
                >
                <option value="newest">Sort by: Newest</option>
                <option value="oldest">Sort by: Oldest</option>
                <option value="candidate_asc">Sort by: Candidate</option>
                <option value="position_asc">Sort by: Position</option>
                <option value="status_asc">Sort by: Status</option>
                </Form.Select>
                <FaChevronDown className="int-d-chevron text-muted me-2" />
            </div>
            </Col>
        </Row>

        <Card className="shadow-sm border-0 mb-5">
          <Card.Body className="p-0">
            <div className="table-responsive">
                <Table hover className="mb-0 align-middle int-d-table">
                <thead className="bg-light">
                    <tr>
                    <th className="p-3 ps-4">Date & Time</th>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Meeting Link</th>
                    <th className="p-3 text-center" style={{ minWidth: "100px" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedInterviews.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="text-center p-5 text-muted fst-italic">
                        {interviews.length === 0 ? "No interviews assigned yet." : "No interviews match your search."}
                        </td>
                    </tr>
                    ) : (
                    paginatedInterviews.map((item) => (
                        <tr key={item._id}>
                        <td className="p-3 ps-4 fw-bold text-dark">{formatDate(item.date)}</td>
                        <td className="p-3">
                            <span className="fw-semibold text-dark">{item.candidateFirstName} {item.candidateLastName}</span>
                        </td>
                        
                        <td className="p-3 text-secondary">
                            {item.jobPosition}
                        </td>
                        
                        <td className="p-3">
                            <span className={`int-d-status ${item.status?.toLowerCase() || ''}`}>
                                {item.status}
                            </span>
                        </td>

                        <td className="p-3" style={{maxWidth: '200px', overflow:'hidden', textOverflow:'ellipsis'}}>
                            {item.meetingLink ? (
                            <a href={item.meetingLink.startsWith('http') ? item.meetingLink : `https://${item.meetingLink}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none int-d-link">
                                {item.meetingLink}
                            </a>
                            ) : (
                            <span className="text-muted small">-</span>
                            )}
                        </td>
                        
                        {/* 🟢 CHANGED: Icons instead of Buttons */}
                        <td className="p-3 text-center">
                            <div className="d-flex justify-content-center">
                                {item.meetingLink ? (
                                    <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Resend Link")}>
                                        <button style={iconStyle} onClick={() => handleOpenModal(item)}>
                                            <FaPaperPlane />
                                        </button>
                                    </OverlayTrigger>
                                ) : (
                                    <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Set Interview Link")}>
                                        <button style={iconStyle} onClick={() => handleOpenModal(item)}>
                                            <FaVideo />
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
                <div className="d-flex justify-content-center py-4 border-top bg-light rounded-bottom">
                    <div className="int-d-pagination-box bg-white border rounded shadow-sm p-1">
                        <button 
                            className="int-d-page-btn"
                            onClick={handlePrev} 
                            disabled={currentPage === 1}
                        >
                            <FaChevronLeft size={12} className={currentPage === 1 ? "text-muted" : "text-dark"} />
                        </button>

                        <span className="fw-semibold text-secondary small mx-3">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button 
                            className="int-d-page-btn"
                            onClick={handleNext} 
                            disabled={currentPage === totalPages}
                        >
                            <FaChevronRight size={12} className={currentPage === totalPages ? "text-muted" : "text-dark"} />
                        </button>
                    </div>
                </div>
            )}

          </Card.Body>
        </Card>
      </Container>

      {/* Send Link Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Meeting Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Send the interview meeting link to <strong>{selectedInterview?.candidateFirstName}</strong>.</p>
          <Form.Group>
            <Form.Label>Meeting URL (Zoom, Teams, Meet)</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="https://..." 
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button 
            className="int-d-btn-primary"
            onClick={handleSendLink}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send & Update Status"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}