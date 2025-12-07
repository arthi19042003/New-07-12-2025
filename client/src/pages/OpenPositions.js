import React, { useEffect, useState, useMemo } from "react";
import { 
  Container, 
  Table, 
  Form, 
  Spinner, 
  Card, 
  Row, 
  Col,
  Modal,
  Button
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; 
// Added FaEdit, FaTrash, FaBan, FaCheck, FaTimes to imports
import { 
  FaSearch, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight, 
  FaChevronDown,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheck,
  FaTimes
} from 'react-icons/fa'; 
import './OpenPositions.css';

const ITEMS_PER_PAGE = 5; 

export default function OpenPositions() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", location: "", openings: 1, requiredSkills: "" });
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);
  
  // Filter State
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [currentPage, setCurrentPage] = useState(1); 

  const token = localStorage.getItem("token");

  // --- FETCH DATA ---
  const fetchPositions = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/positions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load positions");
      const data = await res.json();
      setPositions(data);
    } catch (err) {
      console.error("Error fetching positions:", err);
      toast.error("Could not load positions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    // eslint-disable-next-line
  }, [token]);

  // --- HANDLERS ---
  const handleEdit = (position) => {
    setEditingId(position._id);
    setEditData({
      title: position.title,
      location: position.location,
      openings: position.openings,
      requiredSkills: Array.isArray(position.requiredSkills) 
        ? position.requiredSkills.join(", ") 
        : (position.requiredSkills || ""),
    });
  };

  const handleSave = async (id) => {
    if (!token) return;
    try {
      const skillsArray = editData.requiredSkills 
        ? editData.requiredSkills.split(',').map(s => s.trim()).filter(s => s) 
        : [];
      const payload = { ...editData, requiredSkills: skillsArray };

      const res = await fetch(`/api/positions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update position");
      
      toast.success("Position updated successfully!");
      setEditingId(null);
      fetchPositions();
    } catch (err) {
      console.error(err);
      toast.error("Error updating position");
    }
  };

  const handleClosePosition = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "Closed" }),
      });
      if (!res.ok) throw new Error("Failed to close position");
      
      toast.success("Position closed!");
      fetchPositions();
    } catch (err) {
      console.error(err);
      toast.error("Error closing position");
    }
  };

  const initiateDelete = (id) => {
    setPositionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!token || !positionToDelete) return;
    
    try {
      const res = await fetch(`/api/positions/${positionToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete position");
      
      toast.success("Position deleted successfully"); 
      fetchPositions();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting position");
    } finally {
      setShowDeleteModal(false);
      setPositionToDelete(null);
    }
  };
  
  // --- FILTER LOGIC ---
  const filteredPositions = useMemo(() => {
    let items = [...positions];
    const filterLower = filterText.toLowerCase();

    items = items.filter(pos => {
      if (statusFilter !== 'All' && pos.status !== statusFilter) return false;
      if (filterLower) {
        const title = (pos.title || '').toLowerCase();
        const location = (pos.location || '').toLowerCase();
        const skills = Array.isArray(pos.requiredSkills) 
            ? pos.requiredSkills.join(", ").toLowerCase() 
            : (pos.requiredSkills || '').toLowerCase();
        return title.includes(filterLower) || location.includes(filterLower) || skills.includes(filterLower);
      }
      return true;
    });

    if (currentPage > Math.ceil(items.length / ITEMS_PER_PAGE) && items.length > 0) {
      setCurrentPage(1);
    } else if (items.length === 0 && currentPage !== 1) {
       setCurrentPage(1);
    }
    return items;
  }, [positions, filterText, statusFilter, currentPage]);

  // --- PAGINATION ---
  const totalItems = filteredPositions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  
  const paginatedPositions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPositions.slice(startIndex, endIndex);
  }, [filteredPositions, currentPage]);
  
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };

  // --- RENDER ---

  if (loading) return (
    <Container fluid className="op-page-container text-center"><div className="py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading positions...</p></div></Container>
  );

  return (
    <Container fluid className="op-page-container p-4">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: "#5b21b6" }}>Open Positions</h2>
      </div>

      <Row className="mb-4 g-3">
        <Col md={8}>
          <div className="op-search-wrapper">
             <FaSearch className="op-search-icon" />
             <Form.Control 
               type="text" 
               placeholder="Filter by Title, Location, or Skills..." 
               className="op-search-input" 
               value={filterText} 
               onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }} 
             />
          </div>
        </Col>
        <Col md={4}>
           <div className="op-filter-wrapper">
             <FaFilter className="op-filter-icon" />
             <Form.Select 
               value={statusFilter} 
               onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
               className="op-filter-select"
             >
               <option value="All">All Statuses</option>
               <option value="Open">Open Positions</option>
               <option value="Closed">Closed Positions</option>
             </Form.Select>
             <FaChevronDown className="op-filter-chevron" />
           </div>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle op-table mb-0">
              <thead className="bg-light table-light">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Required Skills</th>
                  <th className="p-3">Openings</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPositions.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted"><h5>No positions found.</h5></td></tr>
                ) : (
                  paginatedPositions.map((pos) => (
                    <tr key={pos._id}>
                      {/* Editable Fields */}
                      <td className="p-3">
                        {editingId === pos._id ? <Form.Control type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} size="sm" /> : <span className="fw-semibold text-dark">{pos.title}</span>}
                      </td>
                      <td className="p-3">
                        {editingId === pos._id ? <Form.Control type="text" value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} size="sm" /> : <span className="text-secondary">{pos.location}</span>}
                      </td>
                      <td className="p-3">
                        {editingId === pos._id ? <Form.Control type="text" value={editData.requiredSkills} onChange={(e) => setEditData({ ...editData, requiredSkills: e.target.value })} size="sm" /> : <small className="text-secondary">{Array.isArray(pos.requiredSkills) ? pos.requiredSkills.join(", ") : pos.requiredSkills || 'N/A'}</small>}
                      </td>
                      <td className="p-3">
                        {editingId === pos._id ? <Form.Control type="number" style={{ width: "80px" }} value={editData.openings} onChange={(e) => setEditData({ ...editData, openings: parseInt(e.target.value) })} size="sm" /> : <span className="fw-bold">{pos.openings}</span>}
                      </td>
                      <td className="p-3">
                        <span className={`fw-bold ${pos.status === 'Closed' ? 'text-muted' : 'text-success'}`}>
                          {pos.status}
                        </span>
                      </td>
                      
                      {/* ACTION ICONS COLUMN */}
                      <td className="p-3 text-end">
                        <div className="d-flex gap-3 justify-content-end align-items-center">
                          {editingId === pos._id ? (
                            <>
                              {/* Save Icon */}
                              <FaCheck 
                                className="op-icon-action op-icon-save" 
                                title="Save Changes"
                                onClick={() => handleSave(pos._id)} 
                              />
                              {/* Cancel Icon */}
                              <FaTimes 
                                className="op-icon-action op-icon-cancel" 
                                title="Cancel Edit"
                                onClick={() => setEditingId(null)} 
                              />
                            </>
                          ) : (
                            <>
                              {/* Edit Icon */}
                              <FaEdit 
                                className="op-icon-action op-icon-edit" 
                                title="Edit Position"
                                onClick={() => handleEdit(pos)} 
                              />
                              
                              {/* Close Position Icon (Only if Open) */}
                              {pos.status === "Open" && (
                                <FaBan 
                                  className="op-icon-action op-icon-close" 
                                  title="Close Position"
                                  onClick={() => handleClosePosition(pos._id)} 
                                />
                              )}
                              
                              {/* Delete Icon */}
                              <FaTrash 
                                className="op-icon-action op-icon-delete" 
                                title="Delete Position"
                                onClick={() => initiateDelete(pos._id)} 
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* --- PAGINATION --- */}
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

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this position? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Position
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}