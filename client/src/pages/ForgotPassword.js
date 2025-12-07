import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Login.css"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.data || "Reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p style={{textAlign: "center", marginBottom: "20px"}}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && <div className="success" style={{textAlign:'center', marginBottom: '15px'}}>{message}</div>}
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        <p style={{marginTop: "20px"}}>
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;