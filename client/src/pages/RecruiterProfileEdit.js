import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./RecruiterProfileEdit.css";

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

const RecruiterProfileEdit = () => {
  const { getRecruiterProfile, recruiterProfile } = useAuth();
  const navigate = useNavigate();

  // 1. Initialize State with EMPTY STRINGS (Prevents "Can't Type" / Locked inputs)
  const [profile, setProfile] = useState({
    address: "",
    majorskillsarea: [],
    resumeskills: "",
    partnerships: "",
    companyWebsite: "", 
    companyPhone: "",   
    companyAddress: "", 
    location: "",
    companyCertifications: "", 
    dunsNumber: "",    
    numberofemployees: "",
    ratecards: [{ role: "", lpa: "" }],
  });

  const [phoneCode, setPhoneCode] = useState("+91");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleOptions = [
    "Sr. Developers", "Architects", "Developers", "Testers",
    "Business Analysts", "Infrastructure Professionals",
    "Project Managers", "UI Developers", "Full Stack Developers",
    "Java/Javascript Engineers",
  ];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getRecruiterProfile();
        
        // FIX: Check for 'recruiter' OR 'user' to ensure data loads
        const userData = res.recruiter || res.user;

        if (res.success && userData) {
          const data = userData.profile || {};

          // Handle Phone Parsing
          let phone = data.companyPhone || data.companyphone || "";
          let code = "+91";
          if (phone) {
             const foundCode = countryCodes.find((c) => phone.startsWith(c.code));
             if (foundCode) {
               code = foundCode.code;
               phone = phone.replace(foundCode.code, "");
             }
          }
          setPhoneCode(code);

          // Handle Certifications (Array -> String)
          let certs = data.companyCertifications || data.companycertifications || "";
          if (Array.isArray(certs)) {
            certs = certs.join(", ");
          }

          // Map Data to State (CamelCase standardization)
          setProfile({
            address: data.address || "",
            majorskillsarea: data.majorskillsarea || [],
            resumeskills: data.resumeskills || "",
            partnerships: data.partnerships || "",
            
            companyWebsite: data.companyWebsite || data.companywebsite || "",
            companyPhone: phone,
            companyAddress: data.companyAddress || data.companyaddress || "",
            location: data.location || data.companyLocation || "",
            companyCertifications: certs,
            dunsNumber: data.dunsNumber || data.dunsnumber || "",
            numberofemployees: data.numberofemployees || "",
            
            ratecards: data.ratecards?.length > 0 ? data.ratecards : [{ role: "", lpa: "" }],
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
    // FIX: Removed dependencies to prevent re-render loops while typing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'companyPhone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setProfile((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (value) => {
    setProfile((prev) => {
      const currentSkills = prev.majorskillsarea || [];
      const updated = currentSkills.includes(value)
        ? currentSkills.filter((skill) => skill !== value)
        : [...currentSkills, value];
      return { ...prev, majorskillsarea: updated };
    });
  };

  const handleRatecardChange = (index, field, value) => {
    const updated = [...profile.ratecards];
    updated[index][field] = value;
    setProfile((prev) => ({ ...prev, ratecards: updated }));
  };

  const addRatecard = () => {
    setProfile((prev) => ({
      ...prev,
      ratecards: [...prev.ratecards, { role: "", lpa: "" }],
    }));
  };

  const removeRatecard = (index) => {
    const updated = [...profile.ratecards];
    updated.splice(index, 1);
    setProfile((prev) => ({ ...prev, ratecards: updated }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const phone = profile.companyPhone || "";
    if (phone.length !== 10) {
      setError("Company Phone must be exactly 10 digits.");
      return;
    }

    setSaving(true);

    try {
      // Convert Certifications String back to Array
      const certString = profile.companyCertifications || "";
      const certsArray = certString.split(",").map(c => c.trim()).filter(c => c !== "");

      const submissionData = {
        address: profile.address,
        majorskillsarea: profile.majorskillsarea,
        resumeskills: profile.resumeskills,
        partnerships: profile.partnerships,
        
        companyWebsite: profile.companyWebsite,
        companyPhone: `${phoneCode}${phone}`,
        companyAddress: profile.companyAddress,
        location: profile.location,
        companyCertifications: certsArray,
        dunsNumber: profile.dunsNumber,
        numberofemployees: profile.numberofemployees,
        ratecards: profile.ratecards,
      };

      const res = await recruiterProfile(submissionData);

      if (res?.success) {
        setMessage("✅ Profile updated successfully!");
        setTimeout(() => navigate("/recruiter/profile/view"), 1500);
      } else {
        setError(res?.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="recruiter-profile-edit-page"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="recruiter-profile-edit-page">
      <div className="recruiter-profile-edit-container">
        <h2>Edit Recruiter Profile</h2>

        <form onSubmit={handleSave} className="recruiter-profile-edit-form">
          
          <div className="form-group">
            <label>Address*</label>
            <input type="text" name="address" value={profile.address || ""} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Major Skills Area*</label>
            <div className="skills-grid">
              {["Development", "Testing", "Operations", "Business Analyst"].map((skill) => {
                const skills = profile.majorskillsarea || [];
                const isChecked = skills.includes(skill);
                return (
                  <label key={skill} className={`skill-checkbox ${isChecked ? "checked" : ""}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(skill)} />
                    <span>{skill}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-group"><label>Resume Skills</label><input type="text" name="resumeskills" value={profile.resumeskills || ""} onChange={handleChange} /></div>
          <div className="form-group"><label>Partnerships</label><input type="text" name="partnerships" value={profile.partnerships || ""} onChange={handleChange} /></div>

          {/* ---- Safe Inputs with Fallbacks ---- */}
          <div className="form-group">
            <label>Company Website</label>
            <input type="text" name="companyWebsite" value={profile.companyWebsite || ""} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Company Phone*</label>
            <div className="phone-group">
              <select className="phone-prefix-select" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)}>
                {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input type="tel" name="companyPhone" value={profile.companyPhone || ""} onChange={handleChange} placeholder="10-digit number" maxLength="10" />
            </div>
          </div>

          <div className="form-group"><label>Company Address</label><input type="text" name="companyAddress" value={profile.companyAddress || ""} onChange={handleChange} /></div>
          <div className="form-group"><label>Location</label><input type="text" name="location" value={profile.location || ""} onChange={handleChange} /></div>

          <div className="form-group">
            <label>Company Certifications</label>
            <input type="text" name="companyCertifications" value={profile.companyCertifications || ""} onChange={handleChange} placeholder="Comma separated (e.g. ISO, CMMI)" />
          </div>

          <div className="form-group"><label>Number of Employees</label><input type="text" name="numberofemployees" value={profile.numberofemployees || ""} onChange={handleChange} /></div>

          <div className="form-group">
            <label>DUNS Number</label>
            <input type="text" name="dunsNumber" value={profile.dunsNumber || ""} onChange={handleChange} />
          </div>

          {/* Ratecards */}
          <div className="form-group">
            <label>Ratecards with Skills</label>
            {profile.ratecards.map((ratecard, index) => (
              <div className="recruiter-rate-card-row" key={index}>
                <select value={ratecard.role} onChange={(e) => handleRatecardChange(index, "role", e.target.value)}>
                  <option value="">Select Role</option>
                  {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <input type="number" placeholder="LPA" value={ratecard.lpa || ""} onChange={(e) => handleRatecardChange(index, "lpa", e.target.value)} />
                {profile.ratecards.length > 1 && (
                  <button type="button" onClick={() => removeRatecard(index)} className="ratecard-entry remove-btn">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addRatecard} className="recruiter-profile-edit-btn save" style={{ width: "fit-content", marginTop: "0" }}>+ Add Ratecard</button>
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-text" style={{textAlign: 'center'}}>{error}</p>}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="submit" disabled={saving} className="recruiter-profile-edit-btn save" style={{ flex: 1 }}>{saving ? "Saving..." : "Save Changes"}</button>
            <button type="button" onClick={() => navigate("/recruiter/profile/view")} className="recruiter-profile-edit-btn cancel" style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterProfileEdit;