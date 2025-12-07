import React from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateDashboard.css"; // Imports the separate CSS file

const CandidateDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="cd-container">
      <div className="cd-header">
        <h1>Smart Submissions</h1>
        <p className="cd-subtitle">Manage your profile, resume, and interviews</p>
      </div>

      <div className="cd-card-grid">
        {/* Profile Card */}
        <div className="cd-card">
          <h3>My Profile</h3>
          <p>Manage your personal information, work experience, and resume</p>
          <button className="cd-btn" onClick={() => navigate("/candidate-profile")}>
            Manage Profile
          </button>
        </div>

        {/* Jobs Card */}
        <div className="cd-card">
          <h3>Find Jobs</h3>
          <p>Browse open positions and apply instantly</p>
          <button className="cd-btn" onClick={() => navigate("/candidate/jobs")}>
            Search Jobs
          </button>
        </div>

        {/* Inbox Card */}
        <div className="cd-card">
          <h3>Inbox</h3>
          <p>Track your scheduled interviews and updates</p>
          <button className="cd-btn" onClick={() => navigate("/candidate/inbox")}>
            View Inbox
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;