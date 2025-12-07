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

const EmployerRegister = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    hiringManagerFirstName: '',
    hiringManagerLastName: '',
    email: '',
    hiringManagerPhone: '',
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
    if (name === 'hiringManagerPhone') {
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

    if (!formData.companyName) newErrors.companyName = "Company Name is required";
    if (!formData.hiringManagerFirstName) newErrors.hiringManagerFirstName = "First Name is required";
    if (!formData.hiringManagerLastName) newErrors.hiringManagerLastName = "Last Name is required";
    
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (formData.hiringManagerPhone && formData.hiringManagerPhone.length !== 10) {
       newErrors.hiringManagerPhone = "Phone number must be 10 digits";
    }

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

    const employerData = {
      companyName: formData.companyName.trim(),
      hiringManagerFirstName: formData.hiringManagerFirstName.trim(),
      hiringManagerLastName: formData.hiringManagerLastName.trim(),
      email: formData.email.trim(),
      hiringManagerPhone: formData.hiringManagerPhone ? `${countryCode}${formData.hiringManagerPhone}` : '',
      password: formData.password,
      role: "employer" 
    };

    const result = await register(employerData);
    setLoading(false);

    if (result.success) {
      logout();
      navigate('/login/employer', { state: { message: 'Registration successful! Please log in.' } });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-card"> 
        <h2>Employer Signup</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Company Name<span className="mandatory">*</span></label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className={errors.companyName ? "error" : ""} />
            {errors.companyName && <span style={{color: 'red', fontSize: '12px'}}>{errors.companyName}</span>}
          </div>

          <div className="form-group">
            <label>Manager First Name<span className="mandatory">*</span></label>
            <input type="text" name="hiringManagerFirstName" value={formData.hiringManagerFirstName} onChange={handleChange} required className={errors.hiringManagerFirstName ? "error" : ""} />
            {errors.hiringManagerFirstName && <span style={{color: 'red', fontSize: '12px'}}>{errors.hiringManagerFirstName}</span>}
          </div>

          <div className="form-group">
            <label>Manager Last Name<span className="mandatory">*</span></label>
            <input type="text" name="hiringManagerLastName" value={formData.hiringManagerLastName} onChange={handleChange} required className={errors.hiringManagerLastName ? "error" : ""} />
            {errors.hiringManagerLastName && <span style={{color: 'red', fontSize: '12px'}}>{errors.hiringManagerLastName}</span>}
          </div>

          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={errors.email ? "error" : ""} />
             {errors.email && <span style={{color: 'red', fontSize: '12px'}}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
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
                name="hiringManagerPhone" 
                value={formData.hiringManagerPhone} 
                onChange={handleChange}
                placeholder="10-digit number" 
                className={errors.hiringManagerPhone ? "error" : ""}
              />
            </div>
            {errors.hiringManagerPhone && <span style={{color: 'red', fontSize: '12px'}}>{errors.hiringManagerPhone}</span>}
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
        <p>Already registered? <Link to="/login/employer">Login here</Link></p>
      </div>
    </div>
  );
};

export default EmployerRegister;