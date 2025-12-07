import React from "react";
import { useNavigate } from "react-router-dom";
import "./EmployerDashboard.css";

const EmployerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="ed-container">
      <div className="ed-header">
        <h1>Smart Submissions</h1>
        <p className="ed-subtitle">Manage your company, team, and interviews</p>
      </div>

      <div className="ed-card-grid">
        {/* Employer Profile */}
        <div className="ed-card">
          <h3>Employer Profile</h3>
          <p>Manage your company and recruiter details</p>
          <button className="ed-btn" onClick={() => navigate("/employer/profile")}>
            View Profile
          </button>
        </div>

        {/* Post a Job - FIXED LINK */}
        <div className="ed-card">
          <h3>Post a Job</h3>
          <p>Create new job listings and find talent</p>
          {/* UPDATED: Changed path to match App.js route */}
          <button className="ed-btn" onClick={() => navigate("/positions/new")}>
            Create Job
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="ed-card">
          <h3>Analytics</h3>
          <p>View hiring statistics and candidate pipeline</p>
          <button className="ed-btn" onClick={() => navigate("/manager/dashboard")}>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;