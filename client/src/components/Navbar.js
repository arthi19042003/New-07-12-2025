import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../context/AuthContext';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FiMenu, FiX } from 'react-icons/fi'; 
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = (user?.role || 'candidate').toLowerCase();

  const handleLogout = () => {
    closeSidebar();
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderLinks = (isMobile = false) => {
    if (!user) {
      return (
        <>
          <HashLink smooth to="/#top" className="navbar-link" onClick={closeSidebar}>Home</HashLink>
          
          {isMobile ? (
            <div className="mobile-login-group">
              <span className="mobile-group-title">Login As:</span>
              <Link to="/login" className="navbar-link" onClick={closeSidebar}>Candidate</Link>
              <Link to="/login/recruiter" className="navbar-link" onClick={closeSidebar}>Recruiter</Link>
              <Link to="/login/employer" className="navbar-link" onClick={closeSidebar}>Employer</Link>
              <Link to="/login/hiring-manager" className="navbar-link" onClick={closeSidebar}>Hiring Manager</Link>
              <Link to="/login/interviewer" className="navbar-link" onClick={closeSidebar}>Interviewer</Link>
              <Link to="/login/admin" className="navbar-link" style={{color: '#dc2626'}} onClick={closeSidebar}>Admin</Link>
            </div>
          ) : (
            <NavDropdown title="Login" id="login-dropdown" className="navbar-dropdown">
              <NavDropdown.Item as={Link} to="/login">Candidate Login</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/login/recruiter">Recruiter Login</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/login/employer">Employer Login</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/login/hiring-manager">Hiring Manager Login</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/login/interviewer">Interviewer Login</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/login/admin" style={{ color: '#dc2626', fontWeight: '600' }}>Admin Login</NavDropdown.Item>
            </NavDropdown>
          )}

          <Link to="/register" className={isMobile ? "navbar-link" : "navbar-btn"} style={!isMobile ? { marginLeft: '15px' } : {}} onClick={closeSidebar}>
            Register
          </Link>
        </>
      );
    }

    return (
      <>
        {/* Candidate */}
        {role === 'candidate' && (
          <>
            <Link to="/dashboard" className="navbar-link" onClick={closeSidebar}>Dashboard</Link>
            <Link to="/candidate/jobs" className="navbar-link" onClick={closeSidebar}>Jobs</Link>
            
            {/* ✅ UPDATED: Combined Profile & Resume Link */}
            <Link to="/candidate-profile" className="navbar-link" onClick={closeSidebar}>My Profile</Link>
            
            <Link to="candidate/inbox" className="navbar-link" onClick={closeSidebar}>Inbox</Link>
          </>
        )}

        {/* Employer */}
        {role === 'employer' && (
          <>
            <Link to="/employer/dashboard" className="navbar-link" onClick={closeSidebar}>Dashboard</Link>
            <Link to="/employer/profile" className="navbar-link" onClick={closeSidebar}>Profile</Link>
            <Link to="/positions/new" className="navbar-link" onClick={closeSidebar}>Post Job</Link>
          </>
        )}

        {/* Hiring Manager */}
        {role === 'hiringmanager' && (
          <>
            <Link to="/hiring-manager/dashboard" className="navbar-link" onClick={closeSidebar}>Dashboard</Link>
            <Link to="/hiring-manager/open-positions" className="navbar-link" onClick={closeSidebar}>Positions</Link>
            <Link to="/hiring-manager/inbox" className="navbar-link" onClick={closeSidebar}>Inbox</Link>
          </>
        )}

        {/* Recruiter */}
        {role === 'recruiter' && ( 
          <>
            <Link to="/recruiter/dashboard" className="navbar-link" onClick={closeSidebar}>Dashboard</Link>
            <Link to="/recruiter/profile" className="navbar-link" onClick={closeSidebar}>Profile</Link>
            <Link to="/recruiter/profile/view" className="navbar-link" onClick={closeSidebar}>Edit Profile</Link>
            <Link to="/recruiter/submit-resume" className="navbar-link" onClick={closeSidebar}>Submit Resume</Link>
            <Link to="/recruiter/submission-status" className="navbar-link" onClick={closeSidebar}>Status</Link>
          </>
        )}

        {/* Interviewer */}
        {role === 'interviewer' && (
          <>
            <Link to="/interviewer/dashboard" className="navbar-link" onClick={closeSidebar}>Dashboard</Link>
          </>
        )}

        {/* Admin */}
        {role === 'admin' && (
            <Link to="/admin/dashboard" className="navbar-link" onClick={closeSidebar}>Admin Dashboard</Link>
        )}

        <button onClick={handleLogout} className={isMobile ? "navbar-link logout-link" : "navbar-btn"}>
          Logout
        </button>
      </>
    );
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        <HashLink smooth to={user ? '/dashboard' : '/#top'} className="navbar-logo">
          Smart Submissions
        </HashLink>

        <div className="navbar-menu desktop-only">
          {renderLinks(false)}
        </div>

        <div className="mobile-menu-icon" onClick={toggleSidebar}>
          <FiMenu size={28} />
        </div>

        <div className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={closeSidebar}></div>

        <div className={`sidebar-panel ${isSidebarOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-logo">Menu</span>
            <FiX size={28} className="close-icon" onClick={closeSidebar} />
          </div>
          <div className="sidebar-links">
            {renderLinks(true)}
          </div>
        </div>
      </div>
    </nav>
  );
}