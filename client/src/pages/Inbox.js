import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  FaEnvelopeOpen, 
  FaEnvelope, 
  FaSearch, 
  FaFilter, 
  FaChevronDown 
} from "react-icons/fa";
import "./Inbox.css";

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Search & Filter States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // --- Fetch Messages ---
  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/inbox");
      setMessages(response.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (err.response && err.response.status === 401) {
        setError("Unauthorized: Please log in again.");
      } else {
        setError("Failed to load messages.");
      }
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // --- Handle Read/Unread Toggle ---
  const toggleReadStatus = async (id) => {
    const targetMsg = messages.find((m) => m._id === id);
    if (!targetMsg) return;

    // Determine current logical status
    const isCurrentlyUnread = targetMsg.status === "unread" || targetMsg.status === false;
    const newStatus = isCurrentlyUnread ? "read" : "unread";

    // Optimistic Update
    setMessages((prevMessages) =>
      prevMessages.map((m) =>
        m._id === id ? { ...m, status: newStatus } : m
      )
    );

    try {
      await api.put(`/inbox/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert if error
      setMessages((prevMessages) =>
        prevMessages.map((m) =>
          m._id === id ? { ...m, status: targetMsg.status } : m
        )
      );
    }
  };

  // --- Date Formatter ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Just now";
    
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // --- Filtering Logic ---
  const filteredMessages = messages.filter((msg) => {
    // 1. Prepare data for search
    const sender = msg.from ? msg.from.toLowerCase() : "";
    const subject = msg.subject ? msg.subject.toLowerCase() : "";
    const term = searchTerm.toLowerCase();

    // 2. Determine Read/Unread status string
    const isUnread = msg.status === "unread" || msg.status === false;
    const msgStatusStr = isUnread ? "unread" : "read";

    // 3. Match Logic
    const matchesSearch = sender.includes(term) || subject.includes(term);
    const matchesFilter = filterStatus === "All" || msgStatusStr === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // --- Loading State ---
  if (loading) {
    return (
      <div className="inbox-container">
        <div className="loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="inbox-container">
      <h2>Inbox</h2>
      <p className="subtitle">Check your notifications, application updates, and system alerts.</p>

      {/* --- Search & Filter Controls --- */}
      <div className="inbox-controls">
        {/* Updated class name to be specific */}
        <div className="inbox-search-wrapper">
          <FaSearch className="inbox-search-icon" />
          <input 
            type="text" 
            placeholder="Search sender or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inbox-search-input"
          />
        </div>
        
        {/* Updated class name to be specific */}
        <div className="inbox-filter-wrapper">
          <FaFilter className="inbox-filter-icon" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="inbox-filter-select"
          >
            <option value="All">All Messages</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
          </select>
          <FaChevronDown className="inbox-filter-chevron" />
        </div>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && filteredMessages.length === 0 && !error ? (
        <div className="empty">
           {messages.length > 0 ? (
             <p>No messages match your search.</p>
           ) : (
             <p>No messages found.</p>
           )}
        </div>
      ) : (
        <div className="message-list">
          {filteredMessages.map((msg) => {
            const isUnread = msg.status === "unread" || msg.status === false;

            return (
              <div
                key={msg._id}
                className={`message-card clickable ${isUnread ? "unread" : ""}`}
                onClick={() => toggleReadStatus(msg._id)}
              >
                {/* 1. Header Row: Sender Name (Left) & Date (Right) */}
                <div className="message-header">
                  <h4>{msg.from || "System Notification"}</h4>
                  <span className="message-date">
                    {formatDate(msg.createdAt)} • {formatTime(msg.createdAt)}
                  </span>
                </div>

                {/* 2. Subject Line (Purple Text) */}
                <div className="message-sender">
                   {msg.subject || "No Subject"}
                </div>

                {/* 3. Message Body (Grey Text) */}
                <div className="message-text">
                  {msg.message || msg.body || "No content available."}
                </div>

                {/* 4. Footer: Status Badge */}
                <div style={{ marginTop: '12px' }}>
                  <span className={`status-tag ${isUnread ? "status-unread" : "status-read"}`}>
                    {isUnread ? <FaEnvelope style={{marginRight:'6px'}}/> : <FaEnvelopeOpen style={{marginRight:'6px'}}/>}
                    {isUnread ? "New Message" : "Read"}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inbox;