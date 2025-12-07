import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, Link } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext"; 
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { FaSearch, FaMapMarkerAlt, FaFilter, FaSortAmountDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import "./CandidateJobs.css";

const ITEMS_PER_PAGE = 8; 

const CandidateJobs = () => {
  const [jobs, setJobs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // --- FILTER, SORT, PAGINATION STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [sortOption, setSortOption] = useState("newest"); 
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useAuth(); 
  const location = useLocation();

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const jobsPromise = api.get("/positions/open").catch(err => {
          console.error("Failed to fetch jobs:", err);
          toast.error("Failed to load available jobs.");
          return { data: [] }; 
        });

        let resumePromise = Promise.resolve({ data: null });
        let submissionsPromise = Promise.resolve({ data: [] });

        if (user) { 
          resumePromise = api.get("/resume/active").catch(() => ({ data: null }));
          
          // Note: We check both submissions endpoints to be safe
          submissionsPromise = api.get("/applications/history/" + user.email).catch(err => {
            console.error("Failed to fetch history:", err);
            return { data: [] }; 
          });
        }

        const [jobsRes, resumeRes, submissionsRes] = await Promise.all([
          jobsPromise,
          resumePromise,
          submissionsPromise
        ]);

        setJobs(jobsRes.data);
        setResume(resumeRes.data);
        
        // Map history to check for already applied jobs
        const appliedIds = new Set(submissionsRes.data.map(sub => sub.positionId || sub.jobId || (sub.position && sub.position._id)));
        setAppliedJobIds(appliedIds);

      } catch (err) {
        console.error("Error loading page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // --- SYNC URL PARAMS TO STATE ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const loc = params.get('loc');
    
    if (q) setSearchTerm(q);
    if (loc) setLocationFilter(loc);
  }, [location.search]);

  // --- FILTERING & SORTING LOGIC ---
  const departments = useMemo(() => {
    const depts = new Set(jobs.map(j => j.department).filter(Boolean));
    return ["All", ...Array.from(depts).sort()];
  }, [jobs]);

  const processedJobs = useMemo(() => {
    let result = [...jobs];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(job => 
        (job.title || '').toLowerCase().includes(lowerTerm) ||
        (job.description || '').toLowerCase().includes(lowerTerm) ||
        (Array.isArray(job.requiredSkills) && job.requiredSkills.join(' ').toLowerCase().includes(lowerTerm))
      );
    }

    if (locationFilter) {
      const lowerLoc = locationFilter.toLowerCase();
      result = result.filter(job => (job.location || '').toLowerCase().includes(lowerLoc));
    }

    if (deptFilter !== "All") {
      result = result.filter(job => job.department === deptFilter);
    }

    result.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOption === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOption === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (sortOption === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [jobs, searchTerm, locationFilter, deptFilter, sortOption]);

  // --- PAGINATION LOGIC ---
  useEffect(() => { setCurrentPage(1); }, [searchTerm, locationFilter, deptFilter, sortOption]);

  const totalItems = processedJobs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = processedJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- 👇👇👇 UPDATED HANDLE APPLY FUNCTION 👇👇👇 ---
  const handleApply = async (job) => {
    if (!user || !resume) {
      toast.error("Please log in and upload an active resume to apply.");
      return;
    }

    try {
      setApplyingId(job._id);

      // 1. CHANGED ROUTE: Pointing to '/applications' instead of '/submissions'
      // 2. CHANGED DATA: Sending 'positionId' to match Backend requirement
      await api.post("/applications", {
        positionId: job._id,  
        resumeUrl: resume.filePath, 
      });

      toast.success(`Successfully applied for ${job.title}!`);
      setAppliedJobIds(prev => new Set(prev).add(job._id));

    } catch (err) {
      console.error("Application error:", err);
      toast.error(err.response?.data?.message || "Failed to apply.");
    } finally {
      setApplyingId(null);
    }
  };
  // -----------------------------------------------------

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setDeptFilter("All");
    setSortOption("newest");
  };

  if (loading) return <div className="jobs-container"><p style={{textAlign:'center', fontSize:'1.2rem', color:'#666', marginTop:'50px'}}>Loading available positions...</p></div>;

  return (
    <div className="jobs-container">
      <Toaster position="top-right" />
      
      <div className="jobs-header-section">
        <h2>Available Positions</h2>
        <p className="subtitle">Explore opportunities and find your next career move.</p>
      </div>

      {user && !resume && (
        <div className="alert-warning">
          <span>⚠️ No active resume found.</span> 
          <Link to="/resume">Upload Resume</Link>
        </div>
      )}
      
      {!user && (
         <div className="alert-info">
          <span>Join us to apply!</span>
          <div style={{display:'inline-block', marginLeft:'10px'}}>
            <Link to="/login">Log in</Link> or <Link to="/register">Register</Link>
          </div>
        </div>
      )}

      {/* --- CONTROLS SECTION --- */}
      <Container fluid className="controls-container mb-4">
        <Row className="g-3">
          <Col md={4} lg={3}>
            <div className="input-wrapper">
              <FaSearch className="input-icon" />
              <Form.Control 
                type="text" 
                placeholder="Job title or keyword..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="custom-input"
              />
            </div>
          </Col>
          <Col md={3} lg={3}>
            <div className="input-wrapper">
              <FaMapMarkerAlt className="input-icon" />
              <Form.Control 
                type="text" 
                placeholder="City or Remote..." 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="custom-input"
              />
            </div>
          </Col>
          <Col md={3} lg={3}>
            <div className="input-wrapper">
              <FaFilter className="input-icon" />
              <Form.Select 
                value={deptFilter} 
                onChange={(e) => setDeptFilter(e.target.value)}
                className="custom-input"
              >
                {departments.map(dept => <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>)}
              </Form.Select>
            </div>
          </Col>
          <Col md={2} lg={3}>
            <div className="input-wrapper">
              <FaSortAmountDown className="input-icon" />
              <Form.Select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="custom-input"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </Form.Select>
            </div>
          </Col>
        </Row>
        <div className="results-count mt-2">
            <span>Showing <strong>{processedJobs.length}</strong> jobs</span>
            {(searchTerm || locationFilter || deptFilter !== "All") && (
                <button className="clear-filters-btn" onClick={clearFilters}>Clear Filters</button>
            )}
        </div>
      </Container>

      {/* --- JOBS GRID --- */}
      <div className="jobs-grid">
        {paginatedJobs.length === 0 ? (
          <div className="empty-state">
            <p>No positions found matching your search.</p>
            <button onClick={clearFilters} className="btn-reset">Clear Filters</button>
          </div>
        ) : (
          paginatedJobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="card-content">
                <div className="card-top">
                  <span className="dept-badge">{job.department || "Engineering"}</span>
                  <h3>{job.title}</h3>
                </div>
                <div className="card-details">
                  <div className="detail-row">
                    <span className="label">Location:</span>
                    <span className="value">{job.location || "Remote"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Posted:</span>
                    <span className="value">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Skills:</span>
                    <span className="value">
                      {Array.isArray(job.requiredSkills) 
                        ? job.requiredSkills.slice(0, 3).join(", ") + (job.requiredSkills.length > 3 ? "..." : "")
                        : "General"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className={`btn-apply ${appliedJobIds.has(job._id) ? 'applied' : ''}`}
                  onClick={() => handleApply(job)}
                  disabled={!user || !resume || applyingId === job._id || appliedJobIds.has(job._id)}
                >
                  {applyingId === job._id ? "Sending..." : appliedJobIds.has(job._id) ? "✓ Applied" : !user ? "Log in to Apply" : "Apply Now"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- PAGINATION --- */}
      {totalItems > ITEMS_PER_PAGE && (
        <div className="pagination-wrapper">
          <div className="pagination-card">
             <button 
               className="pg-btn" 
               disabled={currentPage === 1}
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
             >
               <FaChevronLeft size={14} />
             </button>

             <span className="pg-info">
               Page {currentPage} of {totalPages}
             </span>

             <button 
               className="pg-btn"
               disabled={currentPage === totalPages}
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             >
               <FaChevronRight size={14} />
             </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidateJobs;