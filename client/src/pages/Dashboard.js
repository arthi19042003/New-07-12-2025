import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const userType = (user?.role || "candidate").toLowerCase(); 

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Smart Submissions</h2>

      <p className="dashboard-subtitle">
        {userType === "hiringmanager"
          ? "Manage positions, candidates, and hiring operations"
          : userType === "employer"
          ? "Manage your company, team, and interviews"
          : userType === "recruiter" 
          ? "Manage your profile and candidate submissions"
          : "Manage your profile, resume, and interviews"}
      </p>

      <div className="dashboard-grid">
        {/* ---------- Candidate Dashboard ---------- */}
        {userType === "candidate" && (
          <>
            {/* ✅ NEW COMBINED CARD: My Profile */}
            <div className="dashboard-card">
              <h3>My Profile</h3>
              <p>Manage your personal information, work experience, and resume</p>
              <Link to="/candidate-profile">
                <button className="purple-btn">Manage Profile</button>
              </Link>
            </div>
            
            <div className="dashboard-card">
              <h3>Find Jobs</h3>
              <p>Browse open positions and apply instantly</p>
              <Link to="/candidate/jobs">
                <button className="purple-btn">Search Jobs</button>
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>Inbox</h3>
              <p>Track your scheduled interviews and updates</p>
              <Link to="/inbox">
                <button className="purple-btn">View Inbox</button>
              </Link>
            </div>
          </>
        )}

        {/* ... (Other role dashboards remain unchanged) ... */}
        {userType === "employer" && (
          <>
            <div className="dashboard-card">
              <h3>Employer Profile</h3>
              <p>Manage your company and recruiter details</p>
              <Link to="/employer/profile">
                <button className="purple-btn">View Profile</button>
              </Link>
            </div>
          </>
        )}
        
        {userType === "recruiter" && (
          <>
            <div className="dashboard-card">
              <h3>Recruiter Profile</h3>
              <p>Manage your agency and company details</p>
              <Link to="/recruiter/profile">
                <button className="purple-btn">Edit Profile</button>
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>Submit Candidate</h3>
              <p>Submit a new candidate for an open position</p>
              <Link to="/recruiter/submit-resume"> 
                <button className="purple-btn">Submit Candidate</button>
              </Link>
            </div>
          </>
        )}

        {userType === "hiringmanager" && (
          <>
            <div className="dashboard-card">
              <h3>Inbox</h3>
              <p>View messages and candidate communications</p>
              <Link to="/hiring-manager/inbox">
                <button className="purple-btn">Open Inbox</button>
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>Open Positions</h3>
              <p>View and manage current job openings</p>
              <Link to="/hiring-manager/open-positions">
                <button className="purple-btn">View Positions</button>
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>Candidate Details</h3>
              <p>Review applicants and their interview feedback</p>
              <Link to="/hiring-manager/candidates">
                <button className="purple-btn">View Candidates</button>
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>Schedule Interviews</h3>
              <p>Plan and organize interviews with shortlisted candidates</p>
              <Link to="/hiring-manager/schedule">
                <button className="purple-btn">Schedule</button>
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>Hiring Reports</h3>
              <p>View hiring statistics and progress reports</p>
              <Link to="/hiring-manager/reports">
                <button className="purple-btn">View Reports</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;