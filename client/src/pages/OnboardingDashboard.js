import React, { useEffect, useState, useMemo } from "react";
import { Container, Card, Button, Table, Spinner, Row, Col, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  FaSearch, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight, 
  FaSortAmountDown,
  FaClock,        // Icon for Pending
  FaSync,         // Icon for In Progress
  FaCheck         // 🟢 CHANGED: Icon for Completed (Simple Tick)
} from 'react-icons/fa';
import toast, { Toaster } from "react-hot-toast";
import './OnboardingDashboard.css';

const ITEMS_PER_PAGE = 5;

export default function OnboardingDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter, Sort & Pagination State ---
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Icon Styles ---
  const iconStyle = {
    cursor: "pointer",
    fontSize: "1.2rem",
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

  const fetchOnboarding = async () => {
    try {
      const res = await fetch("/api/onboarding", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Cache-Control": "no-cache",
        },
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server Error: ${res.status}`);
      }
      
      // Validate Data Structure
      if (Array.isArray(data)) {
        setCandidates(data);
      } else if (data && Array.isArray(data.data)) {
         setCandidates(data.data);
      } else {
         console.warn("API response is not an array:", data);
         setCandidates([]); 
      }

    } catch (err) {
      console.error("Error fetching onboarding list:", err);
      if(err.message.includes("500") || err.message.includes("Server Error")) {
        toast.error("Backend Error (500). Check your server terminal.");
      } else {
        toast.error("Failed to load data.");
      }
      setCandidates([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboarding();
  }, []);

  const updateStatus = async (id, onboardingStatus) => {
    try {
      // Optimistic Update
      setCandidates(prevCandidates => 
        prevCandidates.map(c => 
          c._id === id ? { ...c, onboardingStatus } : c
        )
      );

      const res = await fetch(`/api/onboarding/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ onboardingStatus }),
      });

      if (res.ok) {
        toast.success(`Status updated to ${onboardingStatus}`);
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      console.error("Error updating onboarding status:", err);
      toast.error("Failed to update status");
      fetchOnboarding(); // Revert on error
    }
  };

  // --- FILTER, SORT & PAGINATION LOGIC ---
  const filteredCandidates = useMemo(() => {
    if (!candidates || !Array.isArray(candidates)) return [];

    let items = [...candidates];
    const filterLower = filterText.toLowerCase();

    // 1. Filter
    items = items.filter(c => {
      if (statusFilter !== 'All' && c.onboardingStatus !== statusFilter) return false;

      if (filterLower) {
        const name = (c.candidateName || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        const position = (c.position || '').toLowerCase();
        return name.includes(filterLower) || email.includes(filterLower) || position.includes(filterLower);
      }
      return true;
    });

    // 2. Sort Logic
    items.sort((a, b) => {
        switch(sortOption) {
            case "newest": 
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            case "oldest": 
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            case "candidate_asc": 
                return (a.candidateName || "").localeCompare(b.candidateName || "");
            case "position_asc": 
                return (a.position || "").localeCompare(b.position || "");
            case "status_asc": 
                return (a.onboardingStatus || "").localeCompare(b.onboardingStatus || "");
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
  }, [candidates, filterText, statusFilter, sortOption, currentPage]);

  const totalItems = filteredCandidates.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, currentPage]);

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  // Helper for tooltips
  const renderTooltip = (props, text) => (
    <Tooltip id="button-tooltip" {...props}>{text}</Tooltip>
  );

  if (loading)
    return (
      <Container fluid className="od-dashboard-container text-center">
        <div className="py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading onboarding list...</p>
        </div>
      </Container>
    );

  return (
    <Container fluid className="od-dashboard-container p-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold" style={{ color: "#5b21b6" }}>Onboarding Dashboard</h2>
      </div>

      {/* --- FILTERS & SORT ROW --- */}
      <Row className="mb-4 g-3">
        {/* Search */}
        <Col md={6}>
          <div className="od-search-box position-relative bg-white rounded shadow-sm p-2">
             <FaSearch className="od-search-icon text-primary ms-2" />
             <Form.Control
               type="text"
               placeholder="Filter by Candidate Name, Email, or Position..."
               className="ps-5 border-0 od-search-input"
               value={filterText}
               onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }}
             />
          </div>
        </Col>

        {/* Filter Status */}
        <Col md={3}>
            <div className="od-filter-box shadow-sm">
              <FaFilter className="text-muted ms-2 me-2" />
              <Form.Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="border-0 shadow-none fw-semibold"
                style={{ cursor: 'pointer', width: '100%' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </div>
        </Col>

        {/* Sort Dropdown */}
        <Col md={3}>
            <div className="od-filter-box shadow-sm">
              <FaSortAmountDown className="text-muted ms-2 me-2" />
              <Form.Select
                value={sortOption}
                onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                className="border-0 shadow-none fw-semibold"
                style={{ cursor: 'pointer', width: '100%' }}
              >
                <option value="newest">Sort by: Newest</option>
                <option value="oldest">Sort by: Oldest</option>
                <option value="candidate_asc">Sort by: Candidate (A-Z)</option>
                <option value="position_asc">Sort by: Position</option>
                <option value="status_asc">Sort by: Status</option>
              </Form.Select>
            </div>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-0">
            <div className="table-responsive od-table-responsive">
              <Table hover className="align-middle od-table mb-0">
                <thead className="bg-light table-light">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Hiring Status</th>
                    <th className="p-3">Onboarding Progress</th>
                    <th className="p-3 text-center" style={{ minWidth: "220px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCandidates.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                            <h5>No candidates found.</h5>
                        </td>
                    </tr>
                  ) : (
                    paginatedCandidates.map((c) => (
                        <tr key={c._id}>
                        <td className="p-3">
                            <strong className="text-dark">{c.candidateName}</strong>
                            <div className="text-muted small">{c.email}</div>
                        </td>
                        <td className="p-3 text-secondary">{c.position}</td>
                        <td className="p-3 text-secondary">{c.department || "-"}</td>

                        <td className="p-3">
                            <span style={{ fontWeight: "500", color: "black" }}>
                                {c.status}
                            </span>
                        </td>
                        <td className="p-3">
                             <span style={{ color: "black", fontWeight: "500" }}>
                                {c.onboardingStatus}
                            </span>
                        </td>

                        <td className="p-3 text-center">
                            <div className="d-flex flex-row gap-3 justify-content-center align-items-center">
                            
                              {/* 1. Pending Icon (Orange) */}
                              <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Mark as Pending")}>
                                <button
                                  style={c.onboardingStatus === "Pending" || c.onboardingStatus === "Completed" ? disabledIconStyle : { ...iconStyle, color: "#f59e0b" }}
                                  onClick={() => updateStatus(c._id, "Pending")}
                                  disabled={c.onboardingStatus === "Pending" || c.onboardingStatus === "Completed"}
                                >
                                  <FaClock />
                                </button>
                              </OverlayTrigger>

                              {/* 2. In Progress Icon (Blue/Purple) */}
                              <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Mark In Progress")}>
                                <button
                                  style={c.onboardingStatus === "In Progress" || c.onboardingStatus === "Completed" ? disabledIconStyle : { ...iconStyle, color: "#3b82f6" }}
                                  onClick={() => updateStatus(c._id, "In Progress")}
                                  disabled={c.onboardingStatus === "In Progress" || c.onboardingStatus === "Completed"}
                                >
                                  <FaSync />
                                </button>
                              </OverlayTrigger>

                              {/* 3. Completed Icon (Green) - 🟢 UPDATED to FaCheck */}
                              <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Mark Completed")}>
                                <button
                                  style={c.onboardingStatus === "Completed" ? disabledIconStyle : { ...iconStyle, color: "#10b981" }}
                                  onClick={() => updateStatus(c._id, "Completed")}
                                  disabled={c.onboardingStatus === "Completed"}
                                >
                                  <FaCheck /> 
                                </button>
                              </OverlayTrigger>

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
                    <div
                    className="d-flex align-items-center justify-content-between bg-white border rounded shadow-sm p-1"
                    style={{ minWidth: '250px' }}
                    >
                        <button
                            className="btn btn-light d-flex align-items-center justify-content-center border-0"
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            style={{ width: '32px', height: '32px', padding: 0, background: 'transparent' }}
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
                            style={{ width: '32px', height: '32px', padding: 0, background: 'transparent' }}
                        >
                            <FaChevronRight size={14} className={currentPage === totalPages ? "text-muted" : "text-dark"} />
                        </button>
                    </div>
                </div>
            )}
        </Card.Body>
      </Card>
    </Container>
  );
}