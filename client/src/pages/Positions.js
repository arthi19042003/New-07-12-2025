import React, { useEffect, useState, useMemo } from "react";
import { Link } from 'react-router-dom'; 
import api from '../api/axios';
import "./Positions.css";

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    project: '',
    department: '',
    skills: ''
  });

  const { departments, projects } = useMemo(() => {
    const allDepartments = new Set();
    const allProjects = new Set();
    positions.forEach(pos => {
      if (pos.department) allDepartments.add(pos.department);
      if (pos.project) allProjects.add(pos.project);
    });
    return {
      departments: Array.from(allDepartments).sort(),
      projects: Array.from(allProjects).sort()
    };
  }, [positions]);

  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (filters.project) params.append('project', filters.project);
      if (filters.department) params.append('department', filters.department);
      if (filters.skills) params.append('skills', filters.skills);

      try {
        const response = await api.get("/positions", { params }); 
        setPositions(response.data);
      } catch (err) {
        console.error("Error fetching positions:", err);
        setError("Failed to load positions. Please try again later.");
        setPositions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [filters]); 

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getStatusClass = (status) => {
    if (!status) return 'open';
    return status.toLowerCase() === 'closed' ? 'closed' : 'open';
  };

  return (
    <div className="positions-container">
      <h2>Open Positions</h2>
      <p className="subtitle">Manage and view your organization’s job openings</p>

      {/* --- Filter Section --- */}
      <div className="filter-grid">
        <select name="department" value={filters.department} onChange={handleFilterChange}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select name="project" value={filters.project} onChange={handleFilterChange}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          type="text"
          name="skills"
          placeholder="Filter by skill (e.g., React)"
          value={filters.skills}
          onChange={handleFilterChange}
        />
      </div>

      {loading && <p className="empty">Loading positions...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && positions.length === 0 && (
        <p className="empty">No positions found matching your criteria.</p>
      )}

      {!loading && !error && positions.length > 0 && (
        <div className="positions-grid">
          {positions.map((pos) => (
            <Link 
              key={pos._id}
              to={`/hiring-manager/position/${pos._id}`} 
              className={`position-card ${getStatusClass(pos.status)}`}
            >
              <div className="card-header">
                <h3>{pos.title || 'Untitled Position'}</h3>
                <span
                  className={`status-tag ${
                    getStatusClass(pos.status) === "open" ? "status-open" : "status-closed"
                  }`}
                >
                  {pos.status || 'Open'}
                </span>
              </div>
              <p>
                <strong>Department:</strong> {pos.department || 'N/A'}
              </p>
              <p>
                <strong>Project:</strong> {pos.project || 'N/A'}
              </p>
              <p>
                <strong>Skills:</strong>
                {Array.isArray(pos.skills) && pos.skills.length > 0
                  ? pos.skills.join(", ")
                  : 'N/A'}
              </p>
               {pos.description && <p><strong>Description:</strong> {pos.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Positions;