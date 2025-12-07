import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import './PositionDetails.css'; 

const PositionDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null); // data structure: { position, invitations, sows }

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  
  const [sowFile, setSowFile] = useState(null);
  const [sowError, setSowError] = useState('');
  const [sowSuccess, setSowSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // NOTE: Assuming /positions/:id returns { position, invitations, sows }
      const response = await api.get(`/positions/${id}`);
      setData(response.data);
    } catch (err) {
      console.error("Error fetching position details:", err);
      setError("Failed to load position details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    if (!inviteEmail) {
      setInviteError('Email is required.');
      return;
    }
    try {
      // This route might not exist yet, assuming it uses /agencies/invite with positionId
      await api.post(`/agencies/invite`, { 
        agencyEmail: inviteEmail,
        positionId: id // Use the position ID
      });
      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      fetchData(); 
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invite.');
    }
  };

  const handleSowUpload = async (e) => {
    e.preventDefault();
    setSowError('');
    setSowSuccess('');
    if (!sowFile) {
      setSowError('Please select a file to upload.');
      return;
    }
    
    const formData = new FormData();
    formData.append('sowFile', sowFile);

    try {
      // NOTE: Assuming this endpoint is correct: /positions/:id/sow
      await api.post(`/positions/${id}/sow`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSowSuccess(`SOW "${sowFile.name}" uploaded successfully.`);
      setSowFile(null);
      e.target.reset(); 
      fetchData(); 
    } catch (err) {
      setSowError(err.response?.data?.message || 'Failed to upload SOW.');
    }
  };

  if (loading) {
    return <div className="pos-details-container"><p className="empty">Loading position...</p></div>;
  }
  if (error) {
    return <div className="pos-details-container"><p className="error">{error}</p></div>;
  }
  
  // FIX 1: Safely destructure data, providing empty defaults.
  // We expect data to look like { position: {...}, invitations: [...], sows: [...] }
  const position = data?.position || {};
  const invitations = data?.invitations || [];
  const sows = data?.sows || [];

  // If data is null or position is empty, return not found.
  if (!data || !position.title) return <div className="pos-details-container"><p className="empty">Position not found.</p></div>;

  return (
    <div className="pos-details-container">
      <Link to="/hiring-manager/open-positions" className="back-link">
        &larr; Back to all positions
      </Link>
      
      <div className="pos-details-card">
        {/* FIX 2: Check for status before using it */}
        {position.status && <span className={`status-tag ${position.status?.toLowerCase()}`}>{position.status}</span>}
        <h2>{position.title}</h2>
        <p className="subtitle">{position.department} {position.project ? ` / ${position.project}` : ''}</p>
        <p>{position.description}</p>
        <div className="skills-list">
          {/* FIX 3: Safely map over position.requiredSkills */}
          {(position.requiredSkills || []).map(skill => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>

      <div className="pos-details-grid">
        <div className="pos-details-card">
          <h3>Invite Agency / Recruiter</h3>
          <form onSubmit={handleInvite}>
            <p>Invite a recruiter or agency to submit candidates for this position.</p>
            <div className="form-group">
              <label>Agency/Recruiter Email</label>
              <input 
                type="email" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="recruiter@agency.com"
              />
            </div>
            {inviteSuccess && <p className="success-msg">{inviteSuccess}</p>}
            {inviteError && <p className="error-msg">{inviteError}</p>}
            <button type="submit" className="btn-primary">Send Invitation</button>
          </form>
          
          {/* FIX 4: Safely map over invitations */}
          <h4 className="list-title">Sent Invitations ({invitations.length})</h4>
          <ul className="item-list">
            {invitations.map(inv => (
              <li key={inv._id}>
                {inv.agencyEmail} - <span className={`status-tag ${inv.status}`}>{inv.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pos-details-card">
          <h3>SOWs & Proposals</h3>
          <form onSubmit={handleSowUpload}>
            <p>Upload a Statement of Work (SOW) or proposal for this position.</p>
            <div className="form-group">
              <label>SOW/Proposal File</label>
              <input 
                type="file" 
                onChange={(e) => setSowFile(e.target.files[0])}
              />
            </div>
            {sowSuccess && <p className="success-msg">{sowSuccess}</p>}
            {sowError && <p className="error-msg">{sowError}</p>}
            <button type="submit" className="btn-primary">Upload SOW</button>
          </form>

          {/* FIX 5: Safely map over sows */}
          <h4 className="list-title">Uploaded SOWs ({sows.length})</h4>
          <ul className="item-list">
             {sows.map(sow => (
              <li key={sow._id}>
                {sow.fileName} - <span className={`status-tag ${sow.status}`}>{sow.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PositionDetails;