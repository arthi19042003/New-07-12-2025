import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Profile.css'; 

const SubmitCandidate = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rate: '',
    currentLocation: '',
    availability: '',
    skypeId: '',
    githubProfile: '',
    linkedinProfile: '',
    positionId: '',
    hiringManagerId: '',
  });
  
  const [resumeFile, setResumeFile] = useState(null);

  const [positions, setPositions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [posRes, mgrRes] = await Promise.all([
          api.get('/positions'),
          api.get('/recruiter/managers')
        ]);
        setPositions(posRes.data || []);
        setManagers(mgrRes.data.filter(u => u.role === 'hiringManager') || []);
      } catch (error) {
        setMessage({ type: 'error', text: 'Could not load positions or managers.' });
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.positionId || !formData.hiringManagerId) {
        setMessage({ type: 'error', text: 'Please select a position and a hiring manager.' });
        setLoading(false);
        return;
    }
    
    if (!resumeFile) {
        setMessage({ type: 'error', text: 'Please select a resume file to upload.' });
        setLoading(false);
        return;
    }

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      submissionData.append(key, formData[key]);
    });
    submissionData.append('resume', resumeFile);

    try {
      await api.post('/recruiter/submit', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage({ type: 'success', text: 'Candidate submitted successfully!' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit candidate',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-bg">
      <div className="profile-container" style={{maxWidth: "900px"}}>
        <h1>Submit New Candidate</h1>
        <p>Submit a candidate for an open position.</p>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2>Candidate Information</h2>
            <div className="form-group">
              <label>Resume *</label>
              <input 
                type="file" 
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange} 
                required 
              />
            </div>

          </div>
          
          <div className="card">
            <h2>Submission Details</h2>
             {/* ... (existing dropdowns for Position and HM) ... */}
            <div className="form-group">
              <label>Select Position *</label>
              <select name="positionId" value={formData.positionId} onChange={handleChange} required>
                <option value="">-- Select a position --</option>
                {positions.map(pos => (
                  <option key={pos._id} value={pos._id}>{pos.title} ({pos.department})</option>
                ))}
              </select>
            </div>
             <div className="form-group">
              <label>Select Hiring Manager (to notify) *</label>
              <select name="hiringManagerId" value={formData.hiringManagerId} onChange={handleChange} required>
                <option value="">-- Select a manager --</option>
                {managers.map(mgr => (
                  <option key={mgr._id} value={mgr._id}>
                    {mgr.profile.firstName} {mgr.profile.lastName} ({mgr.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {message.text && (
            <div className={`form-message ${message.type === 'success' ? 'success' : 'error'}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit Candidate"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitCandidate;