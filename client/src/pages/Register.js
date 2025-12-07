import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../styles/Login.css"; 

// Updated Country Codes with Names
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

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
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
    // Password Regex: Min 6 chars, at least 1 number, at least 1 special char
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;

    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone) {
      newErrors.phone = "Mobile Number is required";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Mobile Number must be exactly 10 digits";
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
    
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: `${countryCode}${formData.phone}`, 
      city: formData.city,
      state: formData.state,
      password: formData.password,
      role: 'candidate'
    });
    
    setLoading(false);

    if (result.success) {
      logout(); 
      navigate('/login', { 
        state: { message: 'Registration successful! Please log in.' } 
      });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h2>Candidate Register</h2>

        <form onSubmit={handleSubmit} noValidate>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>First Name<span className="mandatory">*</span></label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                required 
                className={errors.firstName ? "error" : ""} 
              />
              {errors.firstName && <span style={{color: 'red', fontSize: '12px'}}>{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name<span className="mandatory">*</span></label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                required 
                className={errors.lastName ? "error" : ""} 
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
              required 
              className={errors.email ? "error" : ""} 
            />
            {errors.email && <span style={{color: 'red', fontSize: '12px'}}>{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Mobile Number<span className="mandatory">*</span></label>
            <div className="phone-group">
              <select 
                className="phone-prefix-select"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                {countryCodes.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="10-digit number"
                required 
                className={errors.phone ? "error" : ""} 
              />
            </div>
            {errors.phone && <span style={{color: 'red', fontSize: '12px', marginTop: '4px'}}>{errors.phone}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>City<span className="mandatory">*</span></label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                required 
                className={errors.city ? "error" : ""} 
              />
               {errors.city && <span style={{color: 'red', fontSize: '12px'}}>{errors.city}</span>}
            </div>
            <div className="form-group">
              <label>State<span className="mandatory">*</span></label>
              <input 
                type="text" 
                name="state" 
                value={formData.state} 
                onChange={handleChange} 
                required 
                className={errors.state ? "error" : ""} 
              />
               {errors.state && <span style={{color: 'red', fontSize: '12px'}}>{errors.state}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              className={errors.password ? "error" : ""} 
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
              required 
              className={errors.confirmPassword ? "error" : ""} 
            />
             {errors.confirmPassword && <span style={{color: 'red', fontSize: '12px'}}>{errors.confirmPassword}</span>}
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;