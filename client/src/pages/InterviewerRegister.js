import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../styles/Login.css"; 

// Standard Country Codes
const countryCodes = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
  { code: "+86", label: "China (+86)" },
  { code: "+971", label: "UAE (+971)" },
];

export default function InterviewerRegister() {
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: ''
  });
  
  const [countryCode, setCountryCode] = useState("+91");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register, logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Allow numbers only for phone input
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/; // Min 6 chars, 1 number, 1 special

    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    
    if (!formData.email) {
        newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
    }
    
    if (!formData.phone) {
       newErrors.phone = "Phone is required";
    } else if (formData.phone.length !== 10) {
       newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.password) {
        newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
        newErrors.password = "Password must be 6+ chars with 1 number & 1 special char";
    }

    if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    
    const fullPhone = `${countryCode}${formData.phone}`;

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: fullPhone,
      password: formData.password,
      role: "interviewer" 
    });
    
    setLoading(false);

    if (result.success) {
      logout();
      navigate('/login/interviewer', { state: { message: 'Registration successful! Please wait for Admin approval.' } });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2>Interviewer Register</h2>
        <form onSubmit={handleSubmit} noValidate>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
                <label>First Name<span className="mandatory">*</span></label>
                <input 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  placeholder="First Name"
                  className={errors.firstName ? "error" : ""} 
                  required 
                />
                {errors.firstName && <span style={{color: 'red', fontSize: '12px'}}>{errors.firstName}</span>}
            </div>
            <div className="form-group">
                <label>Last Name<span className="mandatory">*</span></label>
                <input 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  placeholder="Last Name"
                  className={errors.lastName ? "error" : ""} 
                  required 
                />
                {errors.lastName && <span style={{color: 'red', fontSize: '12px'}}>{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Email"
              className={errors.email ? "error" : ""} 
              required 
            />
            {errors.email && <span style={{color: 'red', fontSize: '12px'}}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone<span className="mandatory">*</span></label>
            <div className="phone-group">
                <select 
                    className="phone-prefix-select"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                >
                    {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="10-digit number" 
                  className={errors.phone ? "error" : ""} 
                  required 
                />
            </div>
            {errors.phone && <span style={{color: 'red', fontSize: '12px', marginTop: '4px'}}>{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Password"
              className={errors.password ? "error" : ""} 
              required 
            />
            {errors.password && <span style={{color: 'red', fontSize: '12px'}}>{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password<span className="mandatory">*</span></label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="Confirm Password"
              className={errors.confirmPassword ? "error" : ""} 
              required 
            />
            {errors.confirmPassword && <span style={{color: 'red', fontSize: '12px'}}>{errors.confirmPassword}</span>}
          </div>

          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p>Already have an account? <Link to="/login/interviewer">Login here</Link></p>
      </div>
    </div>
  );
}