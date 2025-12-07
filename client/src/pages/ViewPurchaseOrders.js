import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight,
  FaChevronDown,
  FaSortAmountDown, 
  FaCheck,          
  FaTimes           
} from "react-icons/fa"; 
import { Container, Card, Table, Button, Spinner, Alert, Row, Col, Form } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import './HiringManagerDashboard.css'; 
import './ViewPurchaseOrders.css'; 

const ITEMS_PER_PAGE = 5;

export default function ViewPurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // --- Filter, Sort & Pagination State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("date_newest"); 
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPOs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/purchase-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      const result = await res.json();
      setPurchaseOrders(result);
    } catch (err) {
      console.error("Error fetching POs:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  // Reset page when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOption]);

  const updateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;

    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Status updated to ${newStatus}!`);
      fetchPOs();
    } catch (err) {
      console.error("Error updating PO status:", err);
      toast.error("Failed to update status");
    }
  };

  // --- Process Data (Filter -> Sort -> Paginate) ---
  const processedData = useMemo(() => {
    let data = [...purchaseOrders];

    // 1. Filter by Status
    if (statusFilter !== "All") {
      data = data.filter(item => item.status === statusFilter);
    }

    // 2. Filter by Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(item => 
        (item.poNumber && item.poNumber.toLowerCase().includes(lowerTerm)) ||
        (item.candidateName && item.candidateName.toLowerCase().includes(lowerTerm)) ||
        (item.positionTitle && item.positionTitle.toLowerCase().includes(lowerTerm))
      );
    }

    // 3. Sort Data
    data.sort((a, b) => {
      switch (sortOption) {
        case "date_newest":
          return new Date(b.startDate || 0) - new Date(a.startDate || 0);
        case "date_oldest":
          return new Date(a.startDate || 0) - new Date(b.startDate || 0);
        case "rate_high":
          return (b.rate || 0) - (a.rate || 0);
        case "rate_low":
          return (a.rate || 0) - (b.rate || 0);
        case "candidate_asc":
          return (a.candidateName || "").localeCompare(b.candidateName || "");
        case "status_asc":
          return (a.status || "").localeCompare(b.status || "");
        default:
          return 0;
      }
    });

    return data;
  }, [purchaseOrders, searchTerm, statusFilter, sortOption]);

  // --- Pagination Logic ---
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  if (loading)
    return (
      <div className="dashboard-wrapper">
        <div className="text-center mt-5" style={{ color: "#666" }}>
          <Spinner animation="border" variant="primary" /> Loading purchase orders...
        </div>
      </div>
    );

  return (
    <div className="dashboard-wrapper">
      <Container className="py-4">
        <Toaster position="top-center" reverseOrder={false} />
        
        <Card className="shadow-sm border-0">
          <Card.Body>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 vpo-header-row">
              <h2 className="fw-bold mb-0 text-purple text-nowrap">Purchase Orders</h2>
              <Button
                onClick={() => navigate("/hiring-manager/create-po")}
                className="purple-btn vpo-create-btn" 
                style={{ whiteSpace: 'nowrap' }}
              >
                <FaPlus /> Create New PO
              </Button>
            </div>

            {/* Controls Row (Search, Filter, Sort) */}
            <Row className="mb-3 g-2">
              <Col md={5}>
                <div className="vpo-search-wrapper">
                  <FaSearch className="vpo-search-icon" />
                  <Form.Control 
                    type="text"
                    placeholder="Search PO, Candidate..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="vpo-search-input"
                  />
                </div>
              </Col>
              
              {/* Filter Dropdown */}
              <Col md={3}>
                <div className="vpo-filter-wrapper">
                  <FaFilter className="vpo-filter-icon" />
                  <Form.Select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="vpo-filter-select"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                  <FaChevronDown className="vpo-filter-chevron" />
                </div>
              </Col>

              {/* Sort Dropdown */}
              <Col md={4}>
                <div className="vpo-filter-wrapper">
                  <FaSortAmountDown className="vpo-filter-icon" />
                  <Form.Select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                    className="vpo-filter-select"
                  >
                    <option value="date_newest">Sort by: Start Date (Newest)</option>
                    <option value="date_oldest">Sort by: Start Date (Oldest)</option>
                    <option value="rate_high">Sort by: Rate (High)</option>
                    <option value="rate_low">Sort by: Rate (Low)</option>
                    <option value="candidate_asc">Sort by: Candidate (A-Z)</option>
                    <option value="status_asc">Sort by: Status</option>
                  </Form.Select>
                  <FaChevronDown className="vpo-filter-chevron" />
                </div>
              </Col>
            </Row>

            {/* Table */}
            {paginatedData.length === 0 ? (
              <Alert variant="info" className="text-center mt-3">
                No purchase orders found matching your criteria.
              </Alert>
            ) : (
              <>
              <div className="table-responsive">
                <Table hover className="align-middle" style={{ minWidth: '950px' }}>
                  <thead className="bg-light table-light">
                    <tr>
                      <th className="p-3">PO Number</th>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Position</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Rate ($/hr)</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((po) => (
                      <tr key={po._id}>
                        <td className="p-3 fw-semibold">{po.poNumber}</td>
                        <td className="p-3">{po.candidateName}</td>
                        <td className="p-3">{po.positionTitle || po.position}</td>
                        <td className="p-3">{po.department || '-'}</td>
                        <td className="p-3">${po.rate}</td>
                        <td className="p-3">
                          {po.startDate ? new Date(po.startDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-3">
                          <span style={{ color: "#000", fontWeight: "500" }}>
                            {po.status}
                          </span>
                        </td>
                        
                        {/* Actions Column (Icons) */}
                        <td className="p-3 text-center">
                          <div className="d-flex gap-3 justify-content-center align-items-center">
                              {po.status === "Pending" ? (
                                <>
                                  <FaCheck 
                                    className="vpo-icon-action vpo-icon-approve"
                                    title="Approve"
                                    onClick={() => updateStatus(po._id, "Approved")}
                                  />
                                  <FaTimes 
                                    className="vpo-icon-action vpo-icon-reject"
                                    title="Reject"
                                    onClick={() => updateStatus(po._id, "Rejected")}
                                  />
                                </>
                              ) : (
                                <span className="vpo-no-action" style={{fontSize: '0.9rem'}}>—</span>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination UI */}
              {totalItems > 0 && (
                <div className="vpo-pagination-container">
                  <div className="vpo-pagination-box">
                     <button 
                       className="vpo-pagination-arrow"
                       disabled={currentPage === 1} 
                       onClick={handlePrev}
                     >
                       <FaChevronLeft />
                     </button>
                     
                     <span className="vpo-pagination-text">
                       Page {currentPage} of {totalPages}
                     </span>
                     
                     <button 
                       className="vpo-pagination-arrow" 
                       disabled={currentPage === totalPages} 
                       onClick={handleNext}
                     >
                       <FaChevronRight />
                     </button>
                  </div>
                </div>
              )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}