import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Table, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { 
  FaSearch, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight,
  FaChevronDown // Added Import
} from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import './HiringManagerDashboard.css';
import './AgencyInvites.css';

const ITEMS_PER_PAGE = 5;

export default function AgencyInvites() {
  const [invites, setInvites] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [email, setEmail] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [sending, setSending] = useState(false);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    if (!token) {
        setLoading(false);
        return;
    }
    try {
      const [invitesRes, positionsRes] = await Promise.all([
        fetch("/api/agencies/invites", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/positions", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData);
      }
      
      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !selectedPosition) return toast.error("Please provide email and select a position");

    try {
      setSending(true);
      const res = await fetch("/api/agencies/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            agencyEmail: email, 
            positionId: selectedPosition 
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send invite");

      toast.success(`Invite sent to ${email}`);
      setEmail(""); 
      setSelectedPosition("");
      
      setInvites([data, ...invites]); 
    } catch (err) {
      console.error("Error sending invite:", err);
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invite?")) return;
    try {
      const res = await fetch(`/api/agencies/invite/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete invite");
      
      toast.success("Invite deleted");
      setInvites(invites.filter(i => i._id !== id));
    } catch (err) {
      toast.error("Error deleting invite");
    }
  };

  // --- Filter Logic ---
  const processedInvites = useMemo(() => {
    let data = [...invites];

    // 1. Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(invite => 
        invite.agencyEmail.toLowerCase().includes(lowerTerm) ||
        (invite.position && invite.position.title.toLowerCase().includes(lowerTerm))
      );
    }

    // 2. Status Filter
    if (statusFilter !== "All") {
      data = data.filter(invite => invite.status.toLowerCase() === statusFilter.toLowerCase());
    }

    return data;
  }, [invites, searchTerm, statusFilter]);

  // --- Pagination Logic ---
  const totalItems = processedInvites.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedInvites = processedInvites.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  if (loading)
    return (
      <div className="dashboard-wrapper">
        <div className="text-center mt-5" style={{ color: "#666" }}>
          <Spinner animation="border" variant="primary" /> Loading...
        </div>
      </div>
    );

  return (
    <div className="dashboard-wrapper">
      <Container className="py-4">
        <Toaster position="top-right" />
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <div className="mb-4">
              <h2 className="fw-bold text-purple mb-0">Manage Agency Invites</h2>
            </div>

            {/* Invite Form */}
            <Form onSubmit={handleInvite} className="p-3 bg-light rounded mb-5 border">
              <h5 className="mb-3 fw-bold text-dark">Send New Invite</h5>
              <Row className="g-2 align-items-end">
                <Col md={5}>
                  <Form.Label>Agency Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="agency@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Position</Form.Label>
                  <Form.Select 
                    value={selectedPosition} 
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    required
                    className="form-select-custom"
                  >
                    <option value="">Select Position...</option>
                    {positions.map(pos => (
                        <option key={pos._id} value={pos._id}>
                            {pos.title}
                        </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button type="submit" className="purple-btn w-100" disabled={sending}>
                    {sending ? <Spinner size="sm" animation="border" /> : "Send Invite"}
                  </Button>
                </Col>
              </Row>
            </Form>

            <h5 className="mb-3 fw-bold text-secondary">Sent Invites</h5>
            
            {/* --- Controls Row (Search & Filter) --- */}
            <Row className="mb-3 g-2">
                <Col md={8}>
                    <div className="search-wrapper">
                        <FaSearch className="search-icon" />
                        <Form.Control 
                            type="text"
                            placeholder="Search by Email or Position..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </Col>
                <Col md={4}>
                    <div className="filter-wrapper">
                        <FaFilter className="filter-icon" />
                        <Form.Select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="All">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </Form.Select>
                        {/* Chevron Down Icon */}
                        <FaChevronDown className="filter-chevron" />
                    </div>
                </Col>
            </Row>

            {/* --- Table --- */}
            {paginatedInvites.length === 0 ? (
              <div className="text-center py-5 border rounded bg-light text-muted">
                <p className="mb-0">No invites found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="bg-light table-light">
                    <tr>
                      <th className="p-3">Agency Email</th>
                      <th className="p-3">Position</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Sent Date</th>
                      <th className="p-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvites.map((invite) => (
                      <tr key={invite._id}>
                        <td className="p-3 fw-semibold">{invite.agencyEmail}</td>
                        <td className="p-3 text-secondary">
                            {invite.position ? invite.position.title : <span className="text-muted">Deleted Position</span>}
                        </td>
                        <td className="p-3" style={{ textTransform: 'capitalize', color: '#374151', fontWeight: '500' }}>
                          {invite.status}
                        </td>
                        <td className="p-3">{new Date(invite.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-end">
                          <Button
                            size="sm"
                            className="btn-delete"
                            onClick={() => handleDelete(invite._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* --- Pagination --- */}
            {totalItems > 0 && (
                <div className="d-flex justify-content-center mt-4">
                    <div className="pagination-box">
                        <button 
                            className="pagination-arrow"
                            disabled={currentPage === 1} 
                            onClick={handlePrev}
                        >
                            <FaChevronLeft size={12} />
                        </button>
                        
                        <span className="pagination-text">
                            Page {currentPage} of {totalPages}
                        </span>
                        
                        <button 
                            className="pagination-arrow" 
                            disabled={currentPage === totalPages} 
                            onClick={handleNext}
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}