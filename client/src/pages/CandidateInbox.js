import React, { useState, useEffect } from "react";
import api from '../api/axios';
import {
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaVideo,
  FaMapMarkerAlt,
  FaLink,
  FaSortAmountDown // 🟢 Added Sort Icon
} from "react-icons/fa";
import "./CandidateInbox.css"; 

const CandidateInbox = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, Filter, and Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOption, setSortOption] = useState("newest"); // 🟢 Added Sort State

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get("/interviews"); 
        setInterviews(response.data || []);
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError("Failed to load inbox. Please try again later.");
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // --- Date Parsing Helper ---
  const parseDateHelper = (dateStr) => {
    if (!dateStr) return null;
    const dmyPattern = /^\d{1,2}-\d{1,2}-\d{4}/;
    if (dmyPattern.test(dateStr)) {
      try {
        const cleanStr = dateStr.toLowerCase().replace(/(am|pm)/g, '').trim();
        const [datePart, timePart] = cleanStr.split(' ');
        if (datePart) {
          const [day, month, year] = datePart.split('-');
          let hours = 0;
          let minutes = 0;
          if (timePart) {
            const [h, m] = timePart.split(':');
            hours = parseInt(h, 10);
            minutes = parseInt(m, 10);
            if (dateStr.toLowerCase().includes('pm') && hours < 12) hours += 12;
            if (dateStr.toLowerCase().includes('am') && hours === 12) hours = 0;
          }
          const customDate = new Date(year, parseInt(month, 10) - 1, day, hours, minutes);
          if (!isNaN(customDate.getTime())) {
            return customDate;
          }
        }
      } catch (e) {
        console.error("Custom date parse error", e);
      }
    }
    const standardDate = new Date(dateStr);
    if (!isNaN(standardDate.getTime())) {
      return standardDate;
    }
    return null;
  };

  const formatDate = (dateString) => {
    const dateObj = parseDateHelper(dateString);
    if (!dateObj) return 'N/A';
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric"
    });
  };

  const formatTime = (dateString) => {
    const dateObj = parseDateHelper(dateString);
    if (!dateObj) return '';
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit"
    });
  };

  // --- 🟢 Processing Logic: Filter THEN Sort ---
  const processedInterviews = React.useMemo(() => {
    // 1. Filter
    let items = interviews.filter((interview) => {
        const position = interview.jobPosition ? interview.jobPosition.toLowerCase() : "";
        const interviewer = interview.interviewerName ? interview.interviewerName.toLowerCase() : "";
        const term = searchTerm.toLowerCase();
    
        const matchesSearch = position.includes(term) || interviewer.includes(term);
        const matchesFilter = filterStatus === "All" || (interview.status && interview.status.toLowerCase() === filterStatus.toLowerCase());
    
        return matchesSearch && matchesFilter;
    });

    // 2. Sort
    items.sort((a, b) => {
        const dateA = parseDateHelper(a.date) || new Date(0);
        const dateB = parseDateHelper(b.date) || new Date(0);

        if (sortOption === "newest") {
            return dateB - dateA;
        } else {
            return dateA - dateB;
        }
    });

    return items;
  }, [interviews, searchTerm, filterStatus, sortOption]);


  if (loading) {
    return (
      <div className="ci-container">
        <div className="ci-loading">Loading your inbox...</div>
      </div>
    );
  }

  return (
    <div className="ci-container">
      <h2>Inbox</h2>
      <p className="ci-subtitle">Check your interview updates, schedules, and joining links.</p>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* --- Search, Filters & Sort --- */}
      <div className="ci-controls">
          {/* Search */}
          <div className="ci-search-wrapper" style={{ flex: 2 }}>
              <FaSearch className="ci-search-icon" />
              <input 
                  type="text" 
                  placeholder="Search position or interviewer..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ci-search-input"
              />
          </div>
          
          {/* Filter */}
          <div className="ci-filter-wrapper" style={{ flex: 1 }}>
              <FaFilter className="ci-filter-icon" />
              <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="ci-filter-select"
              >
                  <option value="All">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
              </select>
              <FaChevronDown className="ci-filter-chevron" />
          </div>

          {/* 🟢 Sort Dropdown */}
          <div className="ci-filter-wrapper" style={{ flex: 1 }}>
              <FaSortAmountDown className="ci-filter-icon" />
              <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  className="ci-filter-select"
              >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
              </select>
              <FaChevronDown className="ci-filter-chevron" />
          </div>
      </div>

      {/* --- List Content --- */}
      {!loading && processedInterviews.length === 0 ? (
        <div className="ci-empty">
           {interviews.length > 0 ? (
              <p>No interviews match your search or filter.</p>
           ) : (
              <p>No interview messages yet.</p>
           )}
        </div>
      ) : (
        <div className="ci-list">
          {processedInterviews.map((interview) => (
            <div key={interview._id} className="ci-card">
              
              {/* 1. Header Row: Interviewer Name & Date */}
              <div className="ci-card-header">
                <h4>
                   Interviewer: {interview.interviewerName || "TBD"}
                </h4>
                <span className="ci-date">
                  {formatDate(interview.date)} • {formatTime(interview.date)}
                </span>
              </div>

              {/* 2. Subject Line (Position) */}
              <div className="ci-position">
                 Position: {interview.jobPosition || "N/A"}
              </div>

              {/* 3. Details */}
              <div className="ci-details">
                <div className="detail-row">
                   {interview.interviewMode === "Online" ? <FaVideo className="icon-small"/> : <FaMapMarkerAlt className="icon-small"/>}
                   <span>Mode: {interview.interviewMode || "Online"}</span>
                </div>
                
                {interview.meetingLink && (
                  <div className="detail-row link-row">
                    <FaLink className="icon-small"/>
                    <strong>Join Link: </strong>
                    <a
                      href={interview.meetingLink.startsWith("http") ? interview.meetingLink : `https://${interview.meetingLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {interview.meetingLink}
                    </a>
                  </div>
                )}
              </div>

              {/* 4. Footer: Status Badges */}
              <div className="ci-footer">
                <span className={`ci-status-tag ${interview.status?.toLowerCase() || 'pending'}`}>
                  {interview.status || "Pending"}
                </span>

                {interview.result && interview.result !== "Pending" && (
                  <span className={`ci-status-tag ${interview.result.toLowerCase() === "pass" ? "success" : "danger"}`}>
                    Result: {interview.result}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateInbox;