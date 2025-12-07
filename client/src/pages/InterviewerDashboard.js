import React, { useEffect, useState } from "react";
import { Container, Card, Table, Button, Modal, Form } from "react-bootstrap";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function InterviewerDashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [sending, setSending] = useState(false);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      // Calls the backend endpoint for the specific interviewer
      const res = await api.get("/interviews/my-schedule");
      setInterviews(res.data);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

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
      return dateStr; 
  };

  const name = user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : "Interviewer";

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", paddingTop: "100px" }}>
      <Toaster position="top-center" />
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ color: "#4c1d95" }}>My Interview Schedule</h2>
          <p className="text-muted">Welcome, {name}. Manage your assigned interviews here.</p>
        </div>

        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="p-3 ps-4 text-uppercase text-secondary small fw-bold">Date & Time</th>
                  <th className="p-3 text-uppercase text-secondary small fw-bold">Candidate</th>
                  <th className="p-3 text-uppercase text-secondary small fw-bold">Position</th>
                  <th className="p-3 text-uppercase text-secondary small fw-bold">Status</th>
                  <th className="p-3 text-uppercase text-secondary small fw-bold">Meeting Link</th>
                  <th className="p-3 text-uppercase text-secondary small fw-bold text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center p-5">Loading...</td></tr>
                ) : interviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-5 text-muted fst-italic">
                      No interviews assigned yet. 
                      <br/>
                      <small>(Ensure the Hiring Manager selected you from the list)</small>
                    </td>
                  </tr>
                ) : (
                  interviews.map((item) => (
                    <tr key={item._id}>
                      <td className="p-3 ps-4 fw-bold text-dark">{formatDate(item.date)}</td>
                      <td className="p-3">{item.candidateFirstName} {item.candidateLastName}</td>
                      
                      {/* Position: Text is now Black */}
                      <td className="p-3" style={{ color: "black", fontWeight: "500" }}>
                        {item.jobPosition}
                      </td>
                      
                      {/* Status: Badge removed, simple text */}
                      <td className="p-3" style={{ color: "black", fontWeight: "500" }}>
                        {item.status}
                      </td>

                      <td className="p-3" style={{maxWidth: '200px', overflow:'hidden', textOverflow:'ellipsis'}}>
                        {item.meetingLink ? (
                          <a href={item.meetingLink} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            {item.meetingLink}
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="p-3 text-end pe-4">
                        <Button 
                          size="sm" 
                          style={{ backgroundColor: "#6d28d9", border: "none" }}
                          onClick={() => handleOpenModal(item)}
                        >
                          {item.meetingLink ? "Resend Link" : "Take Interview"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
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
            style={{ backgroundColor: "#6d28d9", border: "none" }} 
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