import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./RecruiterProfile.css";

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

const RecruiterProfile = () => {
  const { recruiterProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    address: "",
    majorskillsarea: [],
    resumeskills: "",
    partnerships: "",
    companywebsite: "",
    companyphone: "",
    companyAddress: "",
    location: "",
    companycertifications: "",
    dunsnumber: "",
    numberofemployees: "",
    ratecards: [{ role: "", lpa: "" }],
  });

  // Phone Country Code State
  const [phoneCode, setPhoneCode] = useState("+91");

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (formError || successMessage) {
      const timer = setTimeout(() => {
        setFormError("");
        setSuccessMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [formError, successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate numeric input for companyphone
    if (name === "companyphone") {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCheckboxChange = (value) => {
    setData((prev) => {
      const updated = prev.majorskillsarea.includes(value)
        ? prev.majorskillsarea.filter((skill) => skill !== value)
        : [...prev.majorskillsarea, value];
      if (errors.majorskillsarea) setErrors((prevErrors) => ({ ...prevErrors, majorskillsarea: "" }));
      return { ...prev, majorskillsarea: updated };
    });
  };

  const handleRatecardChange = (index, field, value) => {
    const updated = [...data.ratecards];
    updated[index][field] = value;
    setData((prev) => ({ ...prev, ratecards: updated }));
    if (errors[`ratecard_${index}`]) setErrors((prevErrors) => ({ ...prevErrors, [`ratecard_${index}`]: "" }));
  };

  const addRatecard = () => {
    setData((prev) => ({
      ...prev,
      ratecards: [...prev.ratecards, { role: "", lpa: "" }],
    }));
  };

  const removeRatecard = (index) => {
    const updated = [...data.ratecards];
    updated.splice(index, 1);
    setData((prev) => ({ ...prev, ratecards: updated }));
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(data).forEach((key) => {
      if (
        key !== "dunsnumber" &&
        key !== "ratecards" &&
        ((Array.isArray(data[key]) && data[key].length === 0) ||
          (!Array.isArray(data[key]) && !data[key].toString().trim()))
      ) {
        newErrors[key] = "This field is required.";
      }
    });

    // Phone Validation
    if (data.companyphone.length !== 10) {
      newErrors.companyphone = "Phone number must be 10 digits.";
    }

    data.ratecards.forEach((rc, idx) => {
      if (!rc.role || !rc.lpa) {
        newErrors[`ratecard_${idx}`] = "Both Role and LPA are required.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!validateForm()) {
      setFormError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Combine Code and Number
      const payload = {
        ...data,
        companyphone: `${phoneCode}${data.companyphone}`
      };

      const response = await recruiterProfile(payload);
      if (response?.success) {
        setSuccessMessage("Profile Created Successfully");
      } else {
        setFormError(response?.error || "Failed to create profile.");
      }
    } catch (error) {
      console.error("Error submitting recruiter profile:", error);
      setFormError("Something went wrong while saving your profile.");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    "Sr. Developers",
    "Architects",
    "Developers",
    "Testers",
    "Business Analysts",
    "Infrastructure Professionals",
    "Project Managers",
    "UI Developers",
    "Full Stack Developers",
    "Java/Javascript Engineers",
  ];

  return (
    <div className="recruiter-profile-page">
      <div className="recruiter-profile-card">
        <h2 className="recruiter-profile-title">Recruiter Profile</h2>

        <form onSubmit={handleSubmit} className="recruiter-profile-form">
          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">Address<span className="mandatory">*</span></label>
            <input
              type="text"
              id="address"
              name="address"
              value={data.address}
              onChange={handleChange}
              placeholder="123, Business St, Suite 100"
              className={errors.address ? "error" : ""}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* Major Skills Area */}
          <div className="form-group">
            <label>Major Skills Area<span className="mandatory">*</span></label>
            <div className={`skills-grid ${errors.majorskillsarea ? "error" : ""}`}>
              {["Development", "Testing", "Operations", "Business Analyst"].map((skill) => {
                const isChecked = data.majorskillsarea.includes(skill);
                return (
                  <label key={skill} className={`skill-checkbox ${isChecked ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(skill)}
                    />
                    <span>{skill}</span>
                  </label>
                );
              })}
            </div>
            {errors.majorskillsarea && (
              <span className="error-text">{errors.majorskillsarea}</span>
            )}
          </div>

          {/* Resume Skills, Partnerships, Website */}
          {[
            { id: "resumeskills", label: "Resume Skills*", placeholder: "List key resume skills" },
            { id: "partnerships", label: "Partnerships*", placeholder: "Enter company partnerships" },
            { id: "companywebsite", label: "Company Website*", placeholder: "https://example.com" },
          ].map((field) => (
            <div className="form-group" key={field.id}>
              <label htmlFor={field.id}>{field.label.replace('*', '')}<span className="mandatory">*</span></label>
              <input
                type="text"
                id={field.id}
                name={field.id}
                value={data[field.id]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={errors[field.id] ? "error" : ""}
              />
              {errors[field.id] && <span className="error-text">{errors[field.id]}</span>}
            </div>
          ))}

          {/* Company Phone with Dropdown */}
          <div className="form-group">
            <label htmlFor="companyphone">Company Phone<span className="mandatory">*</span></label>
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
                type="tel"
                id="companyphone"
                name="companyphone"
                value={data.companyphone}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength="10"
                className={errors.companyphone ? "error" : ""}
              />
            </div>
            {errors.companyphone && <span className="error-text">{errors.companyphone}</span>}
          </div>

          {/* Other inputs */}
          {[
            { id: "companyAddress", label: "Company Address*", placeholder: "Corporate HQ address" },
            { id: "location", label: "Location*", placeholder: "City, State, Country" },
            { id: "companycertifications", label: "Company Certifications*", placeholder: "e.g., ISO 9001" },
            { id: "numberofemployees", label: "Number of Employees*", placeholder: "e.g., 250" },
          ].map((field) => (
            <div className="form-group" key={field.id}>
              <label htmlFor={field.id}>{field.label.replace('*', '')}<span className="mandatory">*</span></label>
              <input
                type="text"
                id={field.id}
                name={field.id}
                value={data[field.id]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={errors[field.id] ? "error" : ""}
              />
              {errors[field.id] && <span className="error-text">{errors[field.id]}</span>}
            </div>
          ))}
          
          {/* DUNS Number (Not Required) */}
           <div className="form-group">
              <label htmlFor="dunsnumber">DUNS Number</label>
              <input
                type="text"
                id="dunsnumber"
                name="dunsnumber"
                value={data.dunsnumber}
                onChange={handleChange}
                placeholder="Enter DUNS Number"
              />
            </div>

          {/* Ratecards Section */}
          <div className="form-group">
            <label>Ratecards with Skills<span className="mandatory">*</span></label>
            {data.ratecards.map((ratecard, index) => (
              <div className="ratecard-entry" key={index}>
                <div className="ratecard-row">
                  <select
                    value={ratecard.role}
                    onChange={(e) => handleRatecardChange(index, "role", e.target.value)}
                    className={errors[`ratecard_${index}`] ? "error" : ""}
                  >
                    <option value="">Select Role</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  
                  <div className="input-with-unit">
                    <span className="unit-symbol-start">₹</span>
                    <input
                      type="number"
                      placeholder="LPA"
                      value={ratecard.lpa}
                      onChange={(e) => handleRatecardChange(index, "lpa", e.target.value)}
                      className={`input-lpa ${errors[`ratecard_${index}`] ? "error" : ""}`}
                    />
                    <span className="unit-symbol-end">LPA</span>
                  </div>

                  {data.ratecards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRatecard(index)}
                      className="ratecard-entry remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {errors[`ratecard_${index}`] && <span className="error-text ratecard-error">{errors[`ratecard_${index}`]}</span>}
              </div>
            ))}
            <button
              type="button"
              onClick={addRatecard}
              className="recruiter-profile-btn save"
            >
              + Add Ratecard
            </button>
          </div>

          {/* Status messages */}
          {formError && <p className="error-text">{formError}</p>}
          {successMessage && <p className="success-text">{successMessage}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="recruiter-profile-btn save"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecruiterProfile;