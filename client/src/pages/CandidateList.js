import React, { useState, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom';
import { 
  Container, 
  Table, 
  Button, 
  Form, 
  Card, 
  Row, 
  Col, 
  Spinner 
} from "react-bootstrap";
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import "./CandidateList.css"; 

const ITEMS_PER_PAGE = 5; 

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters & Pagination State
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/candidates");
      setCandidates(response.data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to load candidates.");
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/candidates/${id}/status`, { status: newStatus });
      setCandidates(prev => 
        prev.map(c => (c._id === id ? response.data.candidate : c))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleResumeDownload = async (candidateId, fileName) => {
    try {
      const response = await api.get(`/candidates/resume/${candidateId}`, {
        responseType: 'blob', 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'resume.pdf'); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading resume:", err);
      toast.error("Failed to download resume.");
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredCandidates = useMemo(() => {
    let items = [...candidates];
    const filterLower = filterText.toLowerCase();

    items = items.filter(c => {
      // Status Filter
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      
      // Search Filter
      if (filterLower) {
        const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
        const email = (c.email || '').toLowerCase();
        const position = (c.position || '').toLowerCase();
        return fullName.includes(filterLower) || email.includes(filterLower) || position.includes(filterLower);
      }
      return true;
    });

    // Reset page if filter changes results
    if (currentPage > Math.ceil(items.length / ITEMS_PER_PAGE) && items.length > 0) {
      setCurrentPage(1);
    } else if (items.length === 0 && currentPage !== 1) {
       setCurrentPage(1);
    }
    
    return items;
  }, [candidates, filterText, statusFilter, currentPage]);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, currentPage]);

  const totalItems = filteredCandidates.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  // --- RENDER ---

  if (loading) {
    return (
      <Container fluid className="candidates-page-container text-center">
        <div className="py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading candidates...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return <Container className="candidates-page-container"><p className="text-danger text-center mt-5">{error}</p></Container>;
  }

  return (
    <Container fluid className="candidates-page-container p-4">
      <Toaster position="top-right" />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">All Candidates</h2>
      </div>

      {/* --- FILTERS SECTION --- */}
      <Row className="mb-4 g-3">
        <Col md={8}>
          <div className="search-box position-relative bg-white rounded shadow-sm p-2">
             <FaSearch className="search-icon text-primary ms-2" />
             <Form.Control 
               type="text" 
               placeholder="Search by name, email, or position..." 
               className="ps-5 border-0 search-input" 
               value={filterText} 
               onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }} 
             />
          </div>
        </Col>
        <Col md={4}>
           <div className="bg-white rounded shadow-sm p-2 d-flex align-items-center">
             <FaFilter className="text-muted ms-2 me-2" />
             <Form.Select 
               value={statusFilter} 
               onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
               className="border-0 shadow-none fw-semibold" 
               style={{ cursor: 'pointer' }}
             >
               <option value="All">All Statuses</option>
               <option value="Submitted">Submitted</option>
               <option value="Shortlisted">Shortlisted</option>
               <option value="Hired">Hired</option>
               <option value="Rejected">Rejected</option>
             </Form.Select>
           </div>
        </Col>
      </Row>

      {/* --- TABLE CARD --- */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle candidates-table mb-0">
              <thead className="bg-light table-light">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email & Phone</th>
                  <th className="p-3">Position</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <h5>No candidates found.</h5>
                    </td>
                  </tr>
                ) : (
                  paginatedCandidates.map((c) => (
                    <tr key={c._id}>
                      <td className="p-3">
                        <Link to={`/hiring-manager/candidate/${c._id}`} className="fw-bold text-decoration-none" style={{color: '#4c1d95'}}>
                          {c.firstName} {c.lastName}
                        </Link>
                      </td>
                      <td className="p-3">
                        <div className="text-dark">{c.email}</div>
                        <small className="text-muted">{c.phone}</small>
                      </td>
                      <td className="p-3 text-secondary">{c.position}</td>
                      <td className="p-3">
                        <span className={`status-badge ${c.status?.toLowerCase().replace(" ", "-")}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {/* View Resume Button */}
                          {c.resumePath && (
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => handleResumeDownload(c._id, c.resumeOriginalName)}
                            >
                              Resume
                            </Button>
                          )}

                          {/* Shortlist Button */}
                          {c.status !== "Shortlisted" && c.status !== "Hired" && c.status !== "Rejected" && (
                            <Button 
                              size="sm"
                              style={{backgroundColor: "#8b5cf6", border: "none"}}
                              onClick={() => handleStatusChange(c._id, "Shortlisted")}
                            >
                              Shortlist
                            </Button>
                          )}

                          {/* Hire Button */}
                          {c.status !== "Hired" && c.status !== "Rejected" && (
                            <Button 
                              size="sm"
                              variant="success"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to HIRE ${c.firstName} ${c.lastName}?`)) {
                                  handleStatusChange(c._id, "Hired");
                                }
                              }}
                            >
                              Hire
                            </Button>
                          )}

                          {/* Reject Button */}
                          {c.status !== "Rejected" && c.status !== "Hired" && (
                            <Button 
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to REJECT ${c.firstName} ${c.lastName}?`)) {
                                  handleStatusChange(c._id, "Rejected");
                                }
                              }}
                            >
                              Reject
                            </Button>
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
};

export default CandidateList;