import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  FaEnvelopeOpen, 
  FaEnvelope, 
  FaSearch, 
  FaFilter, 
  FaChevronDown,
  FaSortAmountDown, // Added for Sort
  FaChevronLeft,    // Added for Pagination
  FaChevronRight    // Added for Pagination
} from "react-icons/fa";
import "./Inbox.css";

const ITEMS_PER_PAGE = 5; // Defined items per page

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Search, Filter, Sort & Pagination States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOption, setSortOption] = useState("newest"); // 🟢 Added Sort State
  const [currentPage, setCurrentPage] = useState(1);      // 🟢 Added Pagination State

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

    const isCurrentlyUnread = targetMsg.status === "unread" || targetMsg.status === false;
    const newStatus = isCurrentlyUnread ? "read" : "unread";

    setMessages((prevMessages) =>
      prevMessages.map((m) =>
        m._id === id ? { ...m, status: newStatus } : m
      )
    );

    try {
      await api.put(`/inbox/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
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
      weekday: "short", month: "short", day: "numeric", year: "numeric"
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // --- 🟢 PROCESS DATA: Filter -> Sort -> Paginate ---
  
  // 1. Filter
  let processedMessages = messages.filter((msg) => {
    const sender = msg.from ? msg.from.toLowerCase() : "";
    const subject = msg.subject ? msg.subject.toLowerCase() : "";
    const term = searchTerm.toLowerCase();

    const isUnread = msg.status === "unread" || msg.status === false;
    const msgStatusStr = isUnread ? "unread" : "read";

    const matchesSearch = sender.includes(term) || subject.includes(term);
    const matchesFilter = filterStatus === "All" || msgStatusStr === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // 2. Sort
  processedMessages.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    if (sortOption === "newest") return dateB - dateA;
    if (sortOption === "oldest") return dateA - dateB;
    return 0;
  });

  // 3. Pagination Logic
  const totalItems = processedMessages.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // Reset page if search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortOption]);

  const paginatedMessages = processedMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };


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

      {/* --- Controls Row --- */}
      <div className="inbox-controls">
        
        {/* Search */}
        <div className="inbox-search-wrapper" style={{ flex: 2 }}>
          <FaSearch className="inbox-search-icon" />
          <input 
            type="text" 
            placeholder="Search sender or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inbox-search-input"
          />
        </div>
        
        {/* Filter */}
        <div className="inbox-filter-wrapper" style={{ flex: 1 }}>
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

        {/* 🟢 Sort (New) */}
        <div className="inbox-filter-wrapper" style={{ flex: 1 }}>
          <FaSortAmountDown className="inbox-filter-icon" />
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="inbox-filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <FaChevronDown className="inbox-filter-chevron" />
        </div>

      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && paginatedMessages.length === 0 && !error ? (
        <div className="empty">
           {messages.length > 0 ? (
             <p>No messages match your search.</p>
           ) : (
             <p>No messages found.</p>
           )}
        </div>
      ) : (
        <div className="message-list">
          {paginatedMessages.map((msg) => {
            const isUnread = msg.status === "unread" || msg.status === false;

            return (
              <div
                key={msg._id}
                className={`message-card clickable ${isUnread ? "unread" : ""}`}
                onClick={() => toggleReadStatus(msg._id)}
              >
                {/* 1. Header Row: Sender Name & Date */}
                <div className="message-header">
                  <h4>{msg.from || "System Notification"}</h4>
                  <span className="message-date">
                    {formatDate(msg.createdAt)} • {formatTime(msg.createdAt)}
                  </span>
                </div>

                {/* 2. Subject Line */}
                <div className="message-sender">
                   {msg.subject || "No Subject"}
                </div>

                {/* 3. Message Body */}
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

      {/* 🟢 PAGINATION FOOTER */}
      {totalItems > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', paddingBottom: '20px' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: 'white', 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                padding: '5px', 
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                minWidth: '250px'
            }}>
                <button 
                    onClick={handlePrev} 
                    disabled={currentPage === 1}
                    style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                        padding: '5px 10px',
                        display: 'flex', alignItems: 'center'
                    }}
                >
                    <FaChevronLeft color={currentPage === 1 ? "#ccc" : "#333"} />
                </button>

                <span style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 15px' }}>
                    Page {currentPage} of {totalPages}
                </span>

                <button 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages}
                    style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', 
                        padding: '5px 10px',
                        display: 'flex', alignItems: 'center'
                    }}
                >
                    <FaChevronRight color={currentPage === totalPages ? "#ccc" : "#333"} />
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Inbox;