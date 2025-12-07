import React, { useState, useEffect } from "react";
import api from "../api/axios"; 
import "./Onboarding.css";

const Onboarding = () => {
  const [onboardingList, setOnboardingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOnboardingData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get("/onboarding"); 
        setOnboardingList(response.data);
      } catch (err) {
        console.error("Error fetching onboarding data:", err);
        setError("Failed to load onboarding data. Please try again later.");
        setOnboardingList([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchOnboardingData();
  }, []);

  const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
     try {
       return new Date(dateString).toLocaleDateString("en-GB", {
         day: "2-digit", month: "short", year: "numeric",
       });
     } catch (e) { return 'Invalid Date'; }
  };

  const getStatusClass = (status) => {
    if (!status) return 'initiated'; 
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("progress")) return 'progress'; 
    if (lowerStatus.includes("completed")) return 'completed';
    if (lowerStatus.includes("pending")) return 'pending'; 
    if (lowerStatus.includes("initiated")) return 'initiated';
    return 'initiated'; 
  };

  if (loading) {
    return <div className="onboarding-container"><p className="loading">Loading onboarding data...</p></div>;
  }

  if (error) {
     return <div className="onboarding-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="onboarding-container">
      <h2>Onboarding Candidates</h2>
      <p className="subtitle">
        Track the onboarding process of newly hired candidates
      </p>

      {onboardingList.length === 0 ? (
        <p className="empty">No candidates currently in onboarding.</p>
      ) : (
        <div className="onboarding-grid">
          {onboardingList.map((entry) => (
            <div key={entry._id} className="onboarding-card">
              <div className="card-header">
                {/* Use populated candidate name */}
                <h3>{entry.candidate?.name || 'Unknown Candidate'}</h3>
                {/* Use status from API */}
                <span className={`status ${getStatusClass(entry.status)}`}>
                  {entry.status || 'Initiated'} {/* Default status */}
                </span>
              </div>
              {/* Use fields from Onboarding model */}
              <p><strong>Start Date:</strong> {formatDate(entry.startDate)}</p>
              <p><strong>Documents Completed:</strong> {entry.documentsCompleted ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Onboarding;