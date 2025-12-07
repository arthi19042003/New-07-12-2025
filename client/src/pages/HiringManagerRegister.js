import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

export default function HiringManagerRegister() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", companyName: "", email: "", phone: "", password: "", confirmPassword: ""
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); 
  
  const navigate = useNavigate();
  const { register, logout } = useAuth(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
       const numericValue = value.replace(/\D/g, '').slice(0, 10);
       setForm({...form, [name]: numericValue });
    } else {
       setForm({...form, [name]: value });
    }
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;

    if (!form.firstName) newErrors.firstName = "First Name is required";
    if (!form.lastName) newErrors.lastName = "Last Name is required";
    if (!form.companyName) newErrors.companyName = "Company Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.email)) newErrors.email = "Invalid email format";

    if (!form.phone) newErrors.phone = "Phone is required";
    else if (form.phone.length !== 10) newErrors.phone = "Phone number must be 10 digits";

    if (!form.password) {
        newErrors.password = "Password is required";
    } else if (!passwordRegex.test(form.password)) {
        newErrors.password = "Password must be 6+ chars with 1 number & 1 special char";
    }

    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
    
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return; 
    
    setLoading(true);
    
    const result = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      companyName: form.companyName,
      email: form.email,
      phone: `${countryCode}${form.phone}`,
      password: form.password,
      role: "hiringManager" 
    });
    
    setLoading(false);

    if (result.success) {
      logout(); 
      navigate("/login/hiring-manager", { state: { message: "Registration successful! Please log in." } });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-card"> 
        <h2>Hiring Manager - Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name<span className="mandatory">*</span></label>
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" required className={errors.firstName ? "error" : ""} />
             {errors.firstName && <span style={{color: 'red', fontSize: '12px'}}>{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label>Last Name<span className="mandatory">*</span></label>
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" required className={errors.lastName ? "error" : ""} />
             {errors.lastName && <span style={{color: 'red', fontSize: '12px'}}>{errors.lastName}</span>}
          </div>
          <div className="form-group">
            <label>Company<span className="mandatory">*</span></label>
            <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company" required className={errors.companyName ? "error" : ""} />
             {errors.companyName && <span style={{color: 'red', fontSize: '12px'}}>{errors.companyName}</span>}
          </div>
          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className={errors.email ? "error" : ""} />
            {errors.email && <span style={{color: 'red', fontSize: '12px'}}>{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Mobile Number<span className="mandatory">*</span></label>
            <div className="phone-group">
              <select className="phone-prefix-select" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" required className={errors.phone ? "error" : ""} />
            </div>
            {errors.phone && <span style={{color: 'red', fontSize: '12px'}}>{errors.phone}</span>}
          </div>
          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required className={errors.password ? "error" : ""} />
             {errors.password && <span style={{color: 'red', fontSize: '12px'}}>{errors.password}</span>}
          </div>
          <div className="form-group">
            <label>Confirm Password<span className="mandatory">*</span></label>
            <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" type="password" required className={errors.confirmPassword ? "error" : ""} />
             {errors.confirmPassword && <span style={{color: 'red', fontSize: '12px'}}>{errors.confirmPassword}</span>}
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        </form>
         <p>Already have an account? <Link to="/login/hiring-manager">Login here</Link></p>
      </div>
    </div>
  );
}