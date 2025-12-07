import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./RecruiterDashboard.css";

const RecruiterDashboard = () => {
  const { recruiter } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: "Create Profile",
      desc: "Set up your recruiter profile to manage submissions.",
      path: "/recruiter/profile",
      btn: "Create Profile",
    },
    {
      title: "Submit Resume",
      desc: "Upload candidate resumes for review and tracking.",
      path: "/recruiter/submit-resume",
      btn: "Submit Resume",
    },
    {
      title: "Submission Status",
      desc: "Track your submitted resumes and their progress.",
      path: "/recruiter/submission-status",
      btn: "View Status",
    },
  ];

  return (
    <div className="rd-container">
      <div className="rd-header">
        <h1>Welcome, {recruiter?.email || "Recruiter"}</h1>
        <p className="rd-subtitle">Your Smart Submissions Control Panel</p>
      </div>

      <div className="rd-card-grid">
        {cards.map((card, index) => (
          <div key={index} className="rd-card">
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <button
              className="rd-btn"
              onClick={() => navigate(card.path)}
            >
              {card.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboard;