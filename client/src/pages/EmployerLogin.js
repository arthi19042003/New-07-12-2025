import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; 
import "../styles/Login.css"; 

export default function EmployerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 
  const [errors, setErrors] = useState({}); 
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const location = useLocation();
  const message = location.state?.message;
  
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Password Regex: Min 6 chars, at least 1 number, at least 1 special char
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "Password must be 6+ chars with 1 number & 1 special char";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 
    if (!validate()) return; 
    
    setLoading(true); 
    try {
      const res = await api.post("/auth/login", { 
        email,
        password,
        role: "employer",
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/employer/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
      console.error(err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-card"> 
        <h2>Employer Login</h2>

        {message && (
          <div className="success" style={{ textAlign: 'center', marginBottom: '15px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(p => ({...p, email: null}));
              }} 
              placeholder="Email" 
              required 
              className={errors.email ? "error" : ""} 
            />
            {errors.email && <span style={{color: 'red', fontSize: '12px', marginTop:'4px'}}>{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(p => ({...p, password: null}));
              }} 
              placeholder="Password" 
              required 
              className={errors.password ? "error" : ""} 
            />
            {errors.password && <span style={{color: 'red', fontSize: '12px', marginTop:'4px'}}>{errors.password}</span>}
          </div>
          
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <Link to="/forgot-password" style={{ fontSize: "14px", color: "#6d28d9" }}>Forgot Password?</Link>
          </div>

          {error && <div className="error">{error}</div>} 
          
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p>
          Need an employer account? <Link to="/register/employer">Register here</Link>
        </p>
      </div>
    </div>
  );
}