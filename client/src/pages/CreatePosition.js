import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './CandidateProfile.css';

const CreatePosition = () => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    project: '',
    organization: '',
    requiredSkills: '',
    description: '',
    status: 'Open',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Convert comma-separated string to array
      const skillsArray = formData.requiredSkills
        ? formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s)
        : [];

      // Create payload with the array
      const postData = { ...formData, requiredSkills: skillsArray };
      
      // (Removed the delete line here because it was deleting the data we just created)

      await api.post('/positions', postData);

      setMessage({ type: 'success', text: 'Position created successfully!' });

      // Reset formData after successful creation
      setFormData({
        title: '',
        department: '',
        project: '',
        organization: '',
        requiredSkills: '',
        description: '',
        status: 'Open',
      });

      setTimeout(() => {
        navigate('/hiring-manager/open-positions');
      }, 1500);

    } catch (error) {
      console.error("Create Position Error:", error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create position',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-bg">
      <div className="profile-container">
        <h1>Create New Position</h1>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2>Position Details</h2>
            <div className="form-row">
              <div className="form-group">
                {/* UPDATED: Added red color to the asterisk */}
                <label>Title <span style={{ color: "red" }}>*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                {/* UPDATED: Added red color to the asterisk */}
                <label>Department <span style={{ color: "red" }}>*</span></label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Project</label>
                <input type="text" name="project" value={formData.project} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Organization</label>
                <input type="text" name="organization" value={formData.organization} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Required Skills (comma-separated)</label>
              <input
                type="text"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, MongoDB"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Job responsibilities, requirements..."
              />
            </div>
          </div>

          {message.text && (
            <div className={`form-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Position"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePosition;