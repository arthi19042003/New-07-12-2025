import React, { useEffect, useState } from "react";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const [stats, setStats] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Using Promise.all to fetch both endpoints in parallel
        // Replaced axios with fetch to ensure stability
        const [summaryRes, candidatesRes] = await Promise.all([
          fetch("/api/manager/summary", { headers }),
          fetch("/api/manager/candidates", { headers }),
        ]);

        if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            setStats(summaryData);
        }
        
        if (candidatesRes.ok) {
            const candidatesData = await candidatesRes.json();
            setCandidates(candidatesData);
        }

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="md-loading">Loading dashboard...</div>;

  return (
    <div className="md-dashboard">
      <h1>Hiring Manager Dashboard</h1>

      {/* --- Summary Cards --- */}
      <div className="md-summary-grid">
        {[
          { label: "Total Interviews", value: stats.totalInterviews || 0, color: "blue" },
          { label: "Upcoming", value: stats.upcoming || 0, color: "orange" },
          { label: "Completed", value: stats.completed || 0, color: "green" },
          { label: "Passed", value: stats.passed || 0, color: "teal" },
          { label: "Failed", value: stats.failed || 0, color: "red" },
          { label: "Pending", value: stats.pending || 0, color: "gray" },
        ].map((item, i) => (
          <div key={i} className={`md-summary-card ${item.color}`}>
            <h3>{item.label}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>

      {/* --- Candidate Table --- */}
      <div className="md-candidate-section">
        <h2>Candidate Overview</h2>
        <div className="md-table-responsive">
            <table className="md-candidate-table">
            <thead>
                <tr>
                <th>Candidate</th>
                <th>Interviewer</th>
                <th>Date</th>
                <th>Result</th>
                <th>Status</th>
                <th>Rating</th>
                </tr>
            </thead>
            <tbody>
                {candidates.length === 0 ? (
                    <tr><td colspan="6" style={{textAlign: "center", color: "#888"}}>No candidates found.</td></tr>
                ) : (
                    candidates.map((c) => (
                    <tr key={c._id}>
                        <td><strong>{c.candidateName}</strong></td>
                        <td>{c.interviewerName}</td>
                        <td>{c.date ? new Date(c.date).toLocaleDateString() : "N/A"}</td>
                        <td>
                            <span className={`md-status ${c.result ? c.result.toLowerCase() : 'pending'}`}>
                                {c.result || '-'}
                            </span>
                        </td>
                        <td>
                            <span className={`md-status ${c.status ? c.status.toLowerCase() : 'pending'}`}>
                                {c.status || 'Pending'}
                            </span>
                        </td>
                        <td>{c.rating ? `${c.rating} / 5` : "N/A"}</td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;