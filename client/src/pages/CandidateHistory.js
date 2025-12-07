import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import './CandidateHistory.css'; 

const CandidateHistory = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/candidates/${id}/details`);
        setData(response.data);
      } catch (err) {
        console.error("Error fetching candidate details:", err);
        setError("Failed to load candidate history.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return <div className="history-container"><p className="empty">Loading history...</p></div>;
  }

  if (error) {
    return <div className="history-container"><p className="error">{error}</p></div>;
  }

  if (!data) {
    return <div className="history-container"><p className="empty">No data found for this candidate.</p></div>;
  }

  const { candidate, submissions, interviews } = data;

  return (
    <div className="history-container">
      <h2>Candidate History</h2>
      
      <div className="history-card">
        <h3>{candidate.firstName} {candidate.lastName}</h3>
        <div className="details-grid">
          <p><strong>Email:</strong> {candidate.email}</p>
          <p><strong>Phone:</strong> {candidate.phone || 'N/A'}</p>
          <p><strong>Location:</strong> {candidate.currentLocation || 'N/A'}</p>
          <p><strong>Availability:</strong> {candidate.availability || 'N/A'}</p>
          <p><strong>Rate:</strong> {candidate.rate || 'N/A'}</p>
          <p><strong>Status:</strong> {candidate.status}</p>
        </div>
        <div className="details-grid-full">
           <p><strong>LinkedIn:</strong> {candidate.linkedinProfile ? <a href={candidate.linkedinProfile} target="_blank" rel="noopener noreferrer">{candidate.linkedinProfile}</a> : 'N/A'}</p>
           <p><strong>GitHub:</strong> {candidate.githubProfile ? <a href={candidate.githubProfile} target="_blank" rel="noopener noreferrer">{candidate.githubProfile}</a> : 'N/A'}</p>
        </div>
      </div>

      <div className="history-card">
        <h3>Submission History</h3>
        {submissions.length === 0 ? (
          <p>No submissions found for this candidate.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Department</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s._id}>
                  <td>{s.position?.title || 'N/A'}</td>
                  <td>{s.position?.department || 'N/A'}</td>
                  <td><span className={`status-badge ${s.status}`}>{s.status}</span></td>
                  <td>{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="history-card">
        <h3>Interview History</h3>
        {interviews.length === 0 ? (
          <p>No interviews found for this candidate.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map(i => (
                <tr key={i._id}>
                  <td>{i.position?.title || 'N/A'}</td>
                  <td>{formatDate(i.date)}</td>
                  <td>{i.type || 'N/A'}</td>
                  <td><span className={`status-badge ${i.status}`}>{i.status}</span></td>
                  <td><span className={`status-badge ${i.result?.toLowerCase()}`}>{i.result || 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CandidateHistory;