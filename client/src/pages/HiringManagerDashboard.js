import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import './HiringManagerDashboard.css';

export default function HiringManagerDashboard() {
  const [newPosition, setNewPosition] = useState({
    title: "",
    department: "",
    location: "",
    requiredSkills: "",
    openings: 1,
    status: "Open",
  });
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    // Add any init logic here if needed
  }, [token]);

  const addPosition = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const payload = {
        ...newPosition,
        requiredSkills: newPosition.requiredSkills
          ? newPosition.requiredSkills.split(",").map((s) => s.trim())
          : [],
      };

      const res = await fetch("/api/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add position");

      setNewPosition({
        title: "",
        department: "",
        location: "",
        requiredSkills: "",
        openings: 1,
        status: "Open",
      });

      toast.success("Position added successfully!"); 
    } catch (err) {
      console.error("Error adding position:", err);
      toast.error("Failed to add position"); 
    }
  };

  const navItems = [
    { 
      title: "Applications", 
      text: "Review apps & schedule interviews.", 
      path: "/hiring-manager/applications", 
      btn: "View Apps" 
    },
    { 
      title: "Interviews", 
      text: "Manage timeslots & feedback.", 
      path: "/hiring-manager/schedule", 
      btn: "Manage" 
    },
    { 
      title: "Purchase Orders", 
      text: "Track purchase orders.", 
      path: "/hiring-manager/purchase-orders", 
      btn: "View POs" 
    },
    { 
      title: "Inbox", 
      text: "Messages from candidates.", 
      path: "/hiring-manager/inbox", 
      btn: "Open Inbox" 
    },
    { 
      title: "Onboarding", 
      text: "Track hired candidate progress.", 
      path: "/hiring-manager/onboarding", 
      btn: "Track" 
    },
    { 
      title: "Agencies", 
      text: "Invite recruiters.", 
      path: "/hiring-manager/agencies", 
      btn: "Invite" 
    },
  ];

  return (
    <div className="hm-container">
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER */}
      <div className="hm-header">
        <h2>Hiring Manager Dashboard</h2>
        <p className="hm-subtitle">Manage positions, interviews, and onboarding</p>
      </div>

      {/* --- MANAGE POSITIONS (Hero Section) --- */}
      <div className="hm-manage-section">
        <div className="hm-section-title">
          <span>Manage Positions</span>
          <button 
            className="hm-btn-outline"
            onClick={() => navigate("/hiring-manager/open-positions")}
          >
            View All Positions →
          </button>
        </div>

        <form onSubmit={addPosition}>
          <div className="hm-form-row">
            <div className="hm-form-group" style={{ flex: 2 }}>
              <label className="hm-form-label">Title</label>
              <input
                className="hm-form-input"
                type="text"
                placeholder="e.g. Senior Dev"
                required
                value={newPosition.title}
                onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
              />
            </div>
            <div className="hm-form-group">
              <label className="hm-form-label">Dept</label>
              <input
                className="hm-form-input"
                type="text"
                placeholder="Engineering"
                value={newPosition.department}
                onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })}
              />
            </div>
            <div className="hm-form-group">
              <label className="hm-form-label">Location</label>
              <input
                className="hm-form-input"
                type="text"
                placeholder="Remote / NY"
                value={newPosition.location}
                onChange={(e) => setNewPosition({ ...newPosition, location: e.target.value })}
              />
            </div>
            <div className="hm-form-group" style={{ flex: 2 }}>
              <label className="hm-form-label">Skills</label>
              <input
                className="hm-form-input"
                type="text"
                placeholder="React, Node..."
                value={newPosition.requiredSkills}
                onChange={(e) => setNewPosition({ ...newPosition, requiredSkills: e.target.value })}
              />
            </div>
            <div className="hm-form-group" style={{ maxWidth: '80px' }}>
              <label className="hm-form-label">Openings</label>
              <input
                className="hm-form-input"
                type="number"
                min="1"
                value={newPosition.openings}
                onChange={(e) => setNewPosition({ ...newPosition, openings: parseInt(e.target.value) })}
              />
            </div>
            <div className="hm-form-group" style={{ maxWidth: '60px' }}>
              <button type="submit" className="hm-btn" style={{ height: '42px' }}>
                <FaPlus />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* --- NAVIGATION GRID --- */}
      <div className="hm-card-grid">
        {navItems.map((item, idx) => (
          <div key={idx} className="hm-card">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <button
              className="hm-btn"
              onClick={() => navigate(item.path)}
            >
              {item.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}