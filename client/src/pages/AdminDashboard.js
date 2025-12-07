import React, { useEffect, useState } from "react";
import { Container, Table, Button, Card, Modal } from "react-bootstrap"; // Removed Badge import
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Modal State ---
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [userToReject, setUserToReject] = useState(null);

  const navigate = useNavigate();

  const fetchPending = async () => {
    try {
      const res = await api.get("/admin/pending-users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      if(err.response?.status === 403 || err.response?.status === 401) navigate('/login/admin');
      toast.error("Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/approve/${id}`);
      toast.success("User Approved Successfully");
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const initiateReject = (id) => {
    setUserToReject(id);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!userToReject) return;

    try {
      await api.delete(`/admin/reject/${userToReject}`);
      toast.success("Request Rejected");
      setUsers(users.filter(u => u._id !== userToReject));
    } catch (err) {
      toast.error("Rejection failed");
    } finally {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setShowRejectModal(false);
    setUserToReject(null);
  };

  // Common style for Action buttons
  const actionButtonStyle = {
    backgroundColor: "#6d28d9",
    borderColor: "#6d28d9",
    color: "white",
    fontWeight: "500"
  };

  return (
    <Container fluid style={{ paddingTop: "120px", backgroundColor: "#f9fafc", minHeight: "100vh" }}>
      <Toaster position="top-center" />
      <Container>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
            <h2 className="fw-bold mb-0 text-nowrap" style={{ color: "#1e293b" }}>
                Admin Approval Dashboard
            </h2>
            
            {/* LOGOUT BUTTON REMOVED HERE */}
        </div>
        
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0 text-secondary">Pending Access Requests</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                <thead className="bg-light">
                    <tr>
                    <th className="p-3 ps-4">User Details</th>
                    <th className="p-3">Role Requested</th>
                    <th className="p-3">Company / Agency</th>
                    <th className="p-3">Registered Date</th>
                    <th className="p-3 text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                    <tr><td colSpan="5" className="text-center p-5 text-muted">Loading requests...</td></tr>
                    ) : users.length === 0 ? (
                    <tr><td colSpan="5" className="text-center p-5 text-muted">No pending requests at the moment.</td></tr>
                    ) : (
                    users.map(user => (
                        <tr key={user._id}>
                        <td className="p-3 ps-4">
                            <div className="fw-bold text-dark">{user.profile?.firstName} {user.profile?.lastName}</div>
                            <div className="small text-muted">{user.email}</div>
                            <div className="small text-muted">{user.profile?.phone}</div>
                        </td>
                        
                        {/* Clean text instead of Badge */}
                        <td className="p-3 text-uppercase fw-bold" style={{ color: "#6b7280", fontSize: "0.85rem", letterSpacing: "0.5px" }}>
                            {user.role}
                        </td>

                        <td className="p-3 text-secondary">
                            {user.role === 'employer' ? (user.profile?.companyName || 'N/A') : 
                            user.role === 'recruiter' ? (user.profile?.agencyName || 'N/A') : 
                            (user.profile?.companyName || 'N/A')}
                        </td>
                        <td className="p-3 text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                        
                        <td className="p-3 pe-4">
                            <div className="d-flex justify-content-end gap-2">
                                <Button 
                                  size="sm" 
                                  className="px-3"
                                  style={actionButtonStyle} 
                                  onClick={() => handleApprove(user._id)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm"
                                  className="px-3"
                                  style={actionButtonStyle} 
                                  onClick={() => initiateReject(user._id)} 
                                >
                                  Reject
                                </Button>
                            </div>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* --- Rejection Confirmation Modal --- */}
      <Modal show={showRejectModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to reject and delete this user request?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmReject}>
            Confirm Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}