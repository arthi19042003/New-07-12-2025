import React, { useState, useEffect } from "react";
import "./ResumeUploadRecruiter.css";
import api from "../api/axios";
import { useNavigate } from 'react-router-dom';

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

const ResumeUploadRecruiter = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    rate: "",
    currentLocation: "",
    availability: "",
    skypeId: "",
    githubProfile: "",
    linkedinProfile: "",
    positionId: "",
    hiringManagerId: "",
    company: "",
    hiringManager: "",
  });

  // State for Phone Country Code
  const [phoneCode, setPhoneCode] = useState("+91");

  const [positions, setPositions] = useState([]);
  const [managers, setManagers] = useState([]);

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [posRes, mgrRes] = await Promise.all([
          api.get('/positions/open'), 
          api.get('/recruiter/managers')
        ]);
        setPositions(posRes.data || []);
        setManagers(mgrRes.data.filter(u => u.role === 'hiringManager') || []);
      } catch (error) {
        setMessage({ type: 'error', text: 'Could not load positions or managers.' });
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Restrict phone input to numbers only, max 10 chars
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (errors.file) setErrors((prev) => ({ ...prev, file: "" }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!form.email) newErrors.email = "Email is required";
    
    // Phone Validation
    if (!form.phone) {
        newErrors.phone = "Phone is required";
    } else if (form.phone.length !== 10) {
        newErrors.phone = "Phone number must be 10 digits";
    }

    if (!form.rate) newErrors.rate = "Rate is required";
    if (!form.currentLocation) newErrors.currentLocation = "Location is required";
    if (!form.availability) newErrors.availability = "Availability is required";
    if (!form.positionId) newErrors.positionId = "Please select a position";
    if (!form.hiringManagerId) newErrors.hiringManagerId = "Please select a manager";
    if (!file) newErrors.file = "Please upload a resume file";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      setMessage("❌ Please fix the errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      // Append fields
      Object.entries(form).forEach(([k, v]) => {
         // Combine code and phone before sending
         if (k === 'phone') {
             fd.append(k, `${phoneCode}${v}`);
         } else {
             fd.append(k, v);
         }
      });
      fd.append("resume", file);

      await api.post("/recruiter/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Resume submitted successfully!");
      
      // Reset form
      setForm({
        firstName: "", lastName: "", email: "", phone: "", rate: "", currentLocation: "", availability: "", skypeId: "", githubProfile: "", linkedinProfile: "", positionId: "", hiringManagerId: "", company: "", hiringManager: ""
      });
      setFile(null);
      document.getElementById("resume").value = null;
      
      setTimeout(() => {
        navigate('/recruiter/submission-status'); 
      }, 1500);

    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Error submitting resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-upload-page">
      <div className="resume-upload-card">
        <h2 className="resume-upload-title">Submit Candidate Resume</h2>

        <form onSubmit={handleSubmit} className="resume-upload-form" noValidate>
          <div className="form-group">
            <label htmlFor="firstName">First Name<span className="mandatory">*</span></label>
            <input id="firstName" type="text" name="firstName" placeholder="Enter candidate's first name" value={form.firstName} onChange={handleChange} className={errors.firstName ? "error" : ""} />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name<span className="mandatory">*</span></label>
            <input id="lastName" type="text" name="lastName" placeholder="Enter candidate's last name" value={form.lastName} onChange={handleChange} className={errors.lastName ? "error" : ""} />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email<span className="mandatory">*</span></label>
            <input id="email" type="email" name="email" placeholder="Enter candidate email" value={form.email} onChange={handleChange} className={errors.email ? "error" : ""} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Updated Phone Input with Dropdown */}
          <div className="form-group">
            <label htmlFor="phone">Phone<span className="mandatory">*</span></label>
            <div className="phone-group">
              <select 
                className="phone-prefix-select"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input 
                id="phone" 
                type="tel" 
                name="phone" 
                placeholder="10-digit number" 
                value={form.phone} 
                onChange={handleChange} 
                maxLength="10"
                className={errors.phone ? "error" : ""} 
              />
            </div>
            {errors.phone && <span className="error-text" style={{marginTop: '4px', display: 'block'}}>{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="skypeId">Skype ID (Optional)</label>
            <input id="skypeId" type="text" name="skypeId" placeholder="Enter Skype ID" value={form.skypeId} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="rate">Desired Rate ($/hr)<span className="mandatory">*</span></label>
            <input id="rate" type="number" name="rate" placeholder="Enter rate in $/hr" value={form.rate} onChange={handleChange} className={errors.rate ? "error" : ""} />
            {errors.rate && <span className="error-text">{errors.rate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="currentLocation">Location (City, State)<span className="mandatory">*</span></label>
            <input id="currentLocation" type="text" name="currentLocation" placeholder="Enter location" value={form.currentLocation} onChange={handleChange} className={errors.currentLocation ? "error" : ""} />
            {errors.currentLocation && <span className="error-text">{errors.currentLocation}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="availability">Availability (e.g., Immediate)<span className="mandatory">*</span></label>
            <input id="availability" type="text" name="availability" placeholder="Enter availability" value={form.availability} onChange={handleChange} className={errors.availability ? "error" : ""} />
            {errors.availability && <span className="error-text">{errors.availability}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="githubProfile">GitHub URL (Optional)</label>
            <input id="githubProfile" type="url" name="githubProfile" placeholder="Enter GitHub profile URL" value={form.githubProfile} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="linkedinProfile">LinkedIn URL (Optional)</label>
            <input id="linkedinProfile" type="url" name="linkedinProfile" placeholder="Enter LinkedIn profile URL" value={form.linkedinProfile} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company Name (Optional)</label>
            <input id="company" type="text" name="company" placeholder="Enter company name" value={form.company} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label htmlFor="hiringManager">Hiring Manager (Optional)</label>
            <input id="hiringManager" type="text" name="hiringManager" placeholder="Enter hiring manager name" value={form.hiringManager} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Select Position <span className="mandatory">*</span></label>
            <select name="positionId" value={form.positionId} onChange={handleChange} required className={errors.positionId ? "error" : ""}>
              <option value="">-- Select a position --</option>
              {positions.map(pos => (
                <option key={pos._id} value={pos._id}>{pos.title} ({pos.department})</option>
              ))}
            </select>
            {errors.positionId && <span className="error-text">{errors.positionId}</span>}
          </div>

          <div className="form-group">
            <label>Select Hiring Manager (to notify) <span className="mandatory">*</span></label>
            <select name="hiringManagerId" value={form.hiringManagerId} onChange={handleChange} required className={errors.hiringManagerId ? "error" : ""}>
              <option value="">-- Select a manager --</option>
              {managers.map(mgr => (
                <option key={mgr._id} value={mgr._id}>
                  {mgr.profile.firstName} {mgr.profile.lastName} ({mgr.email})
                </option>
              ))}
            </select>
            {errors.hiringManagerId && <span className="error-text">{errors.hiringManagerId}</span>}
          </div>

          <div className="form-group file-upload">
            <label className="file-label" htmlFor="resume">
              📎 Upload Resume (PDF, DOC, DOCX)<span className="mandatory">*</span>
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {errors.file && <span className="error-text">{errors.file}</span>}
          </div>
          
          {message && (
            <p className={`resume-upload-message ${message.startsWith("✅") ? "success-text" : "error-text"}`}>
              {message}
            </p>
          )}

          <button type="submit" className="resume-upload-btn" disabled={loading}>
            {loading ? "Submitting..." : "Send Resume"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeUploadRecruiter;