import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import '../styles/Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); 

  const navigate = useNavigate();
  const { login } = useAuth(); 

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return; 

    setLoading(true);

    try {
      const result = await login(email, password); 
      
      if (result.success) {
        navigate('/dashboard'); 
      } else {
        setLoading(false);
        setError(result.error || 'Login failed. Please check your credentials.');
      }

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-card"> 
        <h2>Candidate Login</h2>

        {message && (
          <div className="success">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email<span className="mandatory">*</span></label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(p => ({...p, email: null}));
              }}
              required
              className={errors.email ? "error" : ""} 
            />
            {errors.email && <span style={{color: 'red', fontSize: '12px', marginTop:'4px'}}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password<span className="mandatory">*</span></label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(p => ({...p, password: null}));
              }}
              required
              className={errors.password ? "error" : ""} 
            />
            {errors.password && <span style={{color: 'red', fontSize: '12px', marginTop:'4px'}}>{errors.password}</span>}
          </div>

          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <Link to="/forgot-password" style={{ fontSize: "14px", color: "#6d28d9" }}>Forgot Password?</Link>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>
          Don't have an account?{' '}
          <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;