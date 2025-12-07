import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../styles/Login.css"; 

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

const RecruiterRegister = () => {
  const [formData, setFormData] = useState({
    accessCode: '', agencyName: '', firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
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
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;

    if (!formData.accessCode) newErrors.accessCode = "Access Code is required";
    if (!formData.agencyName) newErrors.agencyName = "Agency Name is required";
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.phone) newErrors.phone = "Phone is required";
    else if (formData.phone.length !== 10) newErrors.phone = "Phone number must be 10 digits";

    if (!formData.password) {
        newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
        newErrors.password = "Password must be 6+ chars with 1 number & 1 special char";
    }

    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
    
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
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

    const recruiterData = {
      agencyName: formData.agencyName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: `${countryCode}${formData.phone}`,
      password: formData.password,
      role: "recruiter", 
      accessCode: formData.accessCode 
    };

    const result = await register(recruiterData);
    setLoading(false);

    if (result.success) {
      logout();
      navigate('/login/recruiter', { state: { message: 'Registration successful! Please log in.' } });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h2>Recruiter Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Access Code<span className="mandatory">*</span></label>
            <input type="text" name="accessCode" value={formData.accessCode} onChange={handleChange} required className={errors.accessCode ? "error" : ""} />
          </div>
          <div className="form-group">
            <label>Agency Name<span className="mandatory">*</span></label>
            <input type="text" name="agencyName" value={formData.agencyName} onChange={handleChange} required className={errors.agencyName ? "error" : ""} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>First Name<span className="mandatory">*</span></label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={errors.firstName ? "error" : ""} />
            </div>
            <div className="form-group">
              <label>Last Name<span className="mandatory">*</span></label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={errors.lastName ? "error" : ""} />
            </div>
          </div>

          <div className="form-group">
            <label>Company Email<span className="mandatory">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={errors.email ? "error" : ""} />
            {errors.email && <span style={{color: 'red', fontSize: '12px'}}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Mobile Number<span className="mandatory">*</span></label>
            <div className="phone-group">
              <select className="phone-prefix-select" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                {countryCodes.map(item => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="10-digit number" className={errors.phone ? "error" : ""} />
            </div>
            {errors.phone && <span style={{color: 'red', fontSize: '12px'}}>{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className={errors.password ? "error" : ""} />
            {errors.password && <span style={{color: 'red', fontSize: '12px'}}>{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password<span className="mandatory">*</span></label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={errors.confirmPassword ? "error" : ""} />
             {errors.confirmPassword && <span style={{color: 'red', fontSize: '12px'}}>{errors.confirmPassword}</span>}
          </div>

          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Signing Up...' : 'Signup'}</button>
        </form>
        <p>Already registered? <Link to="/login/recruiter">Login here</Link></p>
      </div>
    </div>
  );
};

export default RecruiterRegister;