import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./LandingPage.css";

import bgPattern from "../assets/bg-network.jpg";

const LandingPage = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    if (!jobTitle.trim() && !location.trim()) {
      toast.error("Please enter a job title or location to search.");
      return;
    }

    navigate(
      `/candidate/jobs?q=${encodeURIComponent(jobTitle)}&loc=${encodeURIComponent(
        location
      )}`
    );
  };

  return (
    <div
      className="landing-container"
      style={{
        backgroundImage: `url(${bgPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <Toaster position="top-center" />

      <section className="hero-section">
        <h1 className="hero-title">Find Your Dream Job</h1>
        <p className="hero-subtitle">
          Search thousands of opportunities with quick apply
        </p>

        {/* Search Bar */}
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Job Title"
            className="search-input"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location"
            className="search-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button type="submit" className="purple-btn">
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="filters-box">
          <select className="filter-input">
            <option value="">Job Type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>

          <select className="filter-input">
            <option value="">Experience Level</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
          </select>

          <select className="filter-input">
            <option value="">Salary Range</option>
            <option value="50k">50k - 80k</option>
            <option value="80k">80k - 120k</option>
            <option value="120k">120k+</option>
          </select>

          <button className="alert-btn">Job Alerts</button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
