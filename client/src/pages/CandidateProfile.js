import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { FaEye, FaTrash } from "react-icons/fa"; 
import api from "../api/axios"; 
import { useAuth } from "../context/AuthContext";
import "./CandidateProfile.css"; 

// --- Shared Constants ---
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

// --- Helper Component: Profile Item ---
const ProfileItem = ({ item, onRemove, onUpdate, type }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdate = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="cp-item-editor">
        {type === 'exp' && (
          <>
            <div className="cp-form-group">
                <input name="position" value={formData.position} onChange={handleChange} placeholder="Position *" className="cp-input" />
            </div>
            <div className="cp-form-group">
                <input name="company" value={formData.company} onChange={handleChange} placeholder="Company *" className="cp-input" />
            </div>
          </>
        )}
        {type === 'edu' && (
          <>
             <div className="cp-form-group">
                <input name="institution" value={formData.institution} onChange={handleChange} placeholder="Institution *" className="cp-input" />
             </div>
             <div className="cp-form-group">
                <input name="degree" value={formData.degree} onChange={handleChange} placeholder="Degree *" className="cp-input" />
             </div>
             <div className="cp-form-group">
                <input name="field" value={formData.field} onChange={handleChange} placeholder="Field of Study *" className="cp-input" />
             </div>
          </>
        )}
        <div className="cp-form-row">
            <div className="cp-form-group">
                <label>Start Date</label>
                <input name="startDate" type="date" value={formData.startDate?.split('T')[0] || ''} onChange={handleChange} className="cp-input" />
            </div>
            {!formData.current && (
            <div className="cp-form-group">
                <label>End Date</label>
                <input name="endDate" type="date" value={formData.endDate?.split('T')[0] || ''} onChange={handleChange} className="cp-input" />
            </div>
            )}
        </div>
        <div className="cp-form-group">
             <label><input name="current" type="checkbox" checked={formData.current} onChange={handleChange} style={{width:'auto', marginRight:'8px'}} /> Current</label>
        </div>
        {type === 'exp' && (
          <div className="cp-form-group">
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="cp-input" />
          </div>
        )}
        <div className="cp-item-actions">
            <button onClick={handleUpdate} className="cp-btn-save-item" style={{marginRight:'10px'}}>Save</button>
            <button onClick={() => setIsEditing(false)} className="cp-btn-cancel-item">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-item">
      <div>
        {type === 'exp' && <h4>{item.position} at {item.company}</h4>}
        {type === 'edu' && <h4>{item.degree} in {item.field}</h4>}
        {type === 'edu' && <p>{item.institution}</p>}
        <p className="cp-item-dates">
          {new Date(item.startDate).toLocaleDateString()} - {item.current ? 'Present' : new Date(item.endDate).toLocaleDateString()}
        </p>
        {type === 'exp' && <p>{item.description}</p>}
      </div>
      <div>
        <button onClick={() => setIsEditing(true)} className="cp-btn-edit-item">Edit</button>
        <button onClick={() => onRemove(item._id)} className="cp-btn-delete-item">Delete</button>
      </div>
    </div>
  );
};

// --- Main Combined Component ---
const CandidateProfile = () => {
  const [activeTab, setActiveTab] = useState('details'); 

  // --- Profile Logic States ---
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [phoneCode, setPhoneCode] = useState("+91");
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", address: "", city: "", state: "", zipCode: "", bio: "", skills: [],
  });
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [newExp, setNewExp] = useState({ company: '', position: '', startDate: '', endDate: '', description: '', current: false });
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', field: '', startDate: '', endDate: '', current: false });
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);

  // --- Resume Logic States ---
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeMessage, setResumeMessage] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  // --- Effects ---
  useEffect(() => {
    if (user?.profile) {
      let initialPhone = user.profile.phone || "";
      let initialCode = "+91";
      const foundCode = countryCodes.find(c => initialPhone.startsWith(c.code));
      if (foundCode) {
        initialCode = foundCode.code;
        initialPhone = initialPhone.replace(foundCode.code, "");
      }
      setPhoneCode(initialCode);
      setFormData({
        firstName: user.profile.firstName || "",
        lastName: user.profile.lastName || "",
        phone: initialPhone,
        address: user.profile.address || "",
        city: user.profile.city || "",
        state: user.profile.state || "",
        zipCode: user.profile.zipCode || "",
        bio: user.profile.bio || "",
        skills: user.profile.skills || [],
      });
      setExperience(user.profile.experience || []);
      setEducation(user.profile.education || []);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'resume') {
        fetchResumes();
    }
  }, [activeTab]);

  // --- Handlers ---
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter((skill) => skill !== skillToRemove) });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required.";
    if (!formData.lastName) newErrors.lastName = "Last Name is required.";
    if (!formData.phone) newErrors.phone = "Phone is required.";
    else if (formData.phone.length !== 10) newErrors.phone = "Phone number must be 10 digits.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.state) newErrors.state = "State is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSubForm = (type, data) => {
    const newErrors = {};
    if (type === 'exp') {
      if (!data.position) newErrors.newExp_position = "Position is required.";
      if (!data.company) newErrors.newExp_company = "Company is required.";
      if (!data.startDate) newErrors.newExp_startDate = "Start Date is required.";
    }
    if (type === 'edu') {
      if (!data.institution) newErrors.newEdu_institution = "Institution is required.";
      if (!data.degree) newErrors.newEdu_degree = "Degree is required.";
      if (!data.field) newErrors.newEdu_field = "Field is required.";
      if (!data.startDate) newErrors.newEdu_startDate = "Start Date is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });
    if (!validateForm()) {
      setProfileMessage({ type: "error", text: "Please fill all mandatory fields correctly." });
      return;
    }
    setProfileLoading(true);
    try {
      const payload = { ...formData, phone: `${phoneCode}${formData.phone}` };
      const response = await api.put("/profile", payload);
      updateUser(response.data.user);
      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setProfileMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddExperience = async () => {
    if (!validateSubForm('exp', newExp)) return;
    try {
      const res = await api.post('/profile/experience', newExp);
      setExperience(res.data.experience);
      setNewExp({ company: '', position: '', startDate: '', endDate: '', description: '', current: false });
      setShowExpForm(false);
    } catch (err) { console.error(err); }
  };
  const handleUpdateExperience = async (data) => { try { const res = await api.put(`/profile/experience/${data._id}`, data); setExperience(res.data.experience); } catch (err) { console.error(err); } };
  const handleDeleteExperience = async (id) => { try { const res = await api.delete(`/profile/experience/${id}`); setExperience(res.data.experience); } catch (err) { console.error(err); } };

  const handleAddEducation = async () => {
    if (!validateSubForm('edu', newEdu)) return;
    try {
      const res = await api.post('/profile/education', newEdu);
      setEducation(res.data.education);
      setNewEdu({ institution: '', degree: '', field: '', startDate: '', endDate: '', current: false });
      setShowEduForm(false);
    } catch (err) { console.error(err); }
  };
  const handleUpdateEducation = async (data) => { try { const res = await api.put(`/profile/education/${data._id}`, data); setEducation(res.data.education); } catch (err) { console.error(err); } };
  const handleDeleteEducation = async (id) => { try { const res = await api.delete(`/profile/education/${id}`); setEducation(res.data.education); } catch (err) { console.error(err); } };


  // --- Resume Handlers ---
  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/resume', { headers: { Authorization: `Bearer ${token}` } });
      setResumes(response.data);
    } catch (error) { console.error('Error fetching resumes:', error); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setResumeMessage({ type: 'error', text: 'Only PDF, DOC & DOCX allowed' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeMessage({ type: 'error', text: 'File must be under 5MB' });
      return;
    }
    setSelectedFile(file);
    setResumeMessage({ type: '', text: '' });
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) { setResumeMessage({ type: 'error', text: 'Select a file first' }); return; }
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('title', resumeTitle || 'My Resume');
    setResumeLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } });
      setResumeMessage({ type: 'success', text: 'Resume uploaded successfully ✅' });
      setSelectedFile(null);
      setResumeTitle('');
      fetchResumes();
      const fileInput = document.getElementById('resume-file');
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setResumeMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed' });
    } finally { setResumeLoading(false); }
  };

  const handleSetActive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/resume/active/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchResumes();
    } catch { setResumeMessage({ type: 'error', text: 'Failed to set active' }); }
  };

  const handleResumeDelete = async () => {
    if (!resumeToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/resume/${resumeToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      setResumeMessage({ type: 'success', text: 'Deleted ✅' });
      fetchResumes();
    } catch { setResumeMessage({ type: 'error', text: 'Delete failed' }); }
    finally { setShowDeleteModal(false); setResumeToDelete(null); }
  };

  const formatSize = (b) => (b / 1024 / 1024).toFixed(2) + " MB";

  // --- Render ---
  if (!user) return <div className="cp-page-bg"><p style={{textAlign:"center", paddingTop:"50px"}}>Loading...</p></div>;

  return (
    <div className="cp-page-bg">
      <div className="cp-container">
        
        {/* TAB NAVIGATION HEADER */}
        <div className="cp-header-tabs">
            <h1 className="cp-heading">My Profile</h1>
            <div className="cp-tab-buttons">
                <button 
                    className={`cp-tab-btn ${activeTab === 'details' ? 'cp-active' : ''}`} 
                    onClick={() => setActiveTab('details')}
                >
                    Personal Details
                </button>
                <button 
                    className={`cp-tab-btn ${activeTab === 'resume' ? 'cp-active' : ''}`} 
                    onClick={() => setActiveTab('resume')}
                >
                    Resume & CV
                </button>
            </div>
        </div>

        {/* --- SECTION 1: PERSONAL DETAILS FORM --- */}
        {activeTab === 'details' && (
          <div className="cp-tab-content cp-fade-in">
            <form onSubmit={handleProfileSubmit}>
              <div className="cp-card">
                <h2>Personal Information</h2>
                <div className="cp-form-row">
                  <div className="cp-form-group">
                    <label>First Name<span className="cp-mandatory">*</span></label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleProfileChange} className={errors.firstName ? "cp-error cp-input" : "cp-input"} />
                  </div>
                  <div className="cp-form-group">
                    <label>Last Name<span className="cp-mandatory">*</span></label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleProfileChange} className={errors.lastName ? "cp-error cp-input" : "cp-input"} />
                  </div>
                </div>
                
                <div className="cp-form-group">
                  <label>Phone<span className="cp-mandatory">*</span></label>
                  <div className="cp-phone-group">
                    <select className="cp-phone-prefix-select" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)}>
                      {countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                    </select>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleProfileChange} placeholder="10-digit number" maxLength="10" className={errors.phone ? "cp-error cp-input" : "cp-input"} />
                  </div>
                  {errors.phone && <span className="cp-error-text">{errors.phone}</span>}
                </div>

                <div className="cp-form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleProfileChange} className="cp-input" />
                </div>
                <div className="cp-form-row">
                  <div className="cp-form-group">
                    <label>City<span className="cp-mandatory">*</span></label>
                    <input type="text" name="city" value={formData.city} onChange={handleProfileChange} className={errors.city ? "cp-error cp-input" : "cp-input"} />
                  </div>
                  <div className="cp-form-group">
                    <label>State<span className="cp-mandatory">*</span></label>
                    <input type="text" name="state" value={formData.state} onChange={handleProfileChange} className={errors.state ? "cp-error cp-input" : "cp-input"} />
                  </div>
                  <div className="cp-form-group">
                    <label>Zip Code</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleProfileChange} className="cp-input" />
                  </div>
                </div>
                <div className="cp-form-group">
                    <label>Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleProfileChange} placeholder="Tell us about yourself..." className="cp-input" />
                </div>
              </div>

              {/* Skills */}
              <div className="cp-card">
                <h2>Skills</h2>
                <div className="cp-skills-input">
                  <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())} placeholder="Add a skill" className="cp-input" />
                  <button type="button" onClick={handleAddSkill} className="cp-add-skill-btn">Add</button>
                </div>
                <div className="cp-skills-list">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="cp-skill-tag">{skill}<button type="button" onClick={() => handleRemoveSkill(skill)} className="cp-skill-remove">×</button></span>
                  ))}
                </div>
              </div>

              {profileMessage.text && <div className={`cp-form-message ${profileMessage.type === 'success' ? 'cp-success' : 'cp-error'}`}>{profileMessage.text}</div>}
              
              <button type="submit" className="cp-btn-primary" disabled={profileLoading}>{profileLoading ? "Saving..." : "Save Personal Info"}</button>
            </form>

            {/* Experience */}
            <div className="cp-card">
                <div className="cp-section-header">
                    <h2>Work Experience</h2>
                    <button onClick={() => setShowExpForm(!showExpForm)} className="cp-btn-add-section">{showExpForm ? 'Cancel' : '+ Add Experience'}</button>
                </div>
                {showExpForm && (
                    <div className="cp-item-editor">
                        <div className="cp-form-group">
                            <input name="position" value={newExp.position} onChange={(e) => setNewExp(p => ({ ...p, position: e.target.value }))} placeholder="Position *" className={errors.newExp_position ? "cp-error cp-input" : "cp-input"} />
                        </div>
                        <div className="cp-form-group">
                            <input name="company" value={newExp.company} onChange={(e) => setNewExp(p => ({ ...p, company: e.target.value }))} placeholder="Company *" className={errors.newExp_company ? "cp-error cp-input" : "cp-input"} />
                        </div>
                        <div className="cp-form-group">
                            <label>Start Date*</label>
                            <input name="startDate" type="date" value={newExp.startDate} onChange={(e) => setNewExp(p => ({ ...p, startDate: e.target.value }))} className={errors.newExp_startDate ? "cp-error cp-input" : "cp-input"} />
                        </div>
                        {!newExp.current && (
                            <div className="cp-form-group">
                                <label>End Date</label>
                                <input name="endDate" type="date" value={newExp.endDate} onChange={(e) => setNewExp(p => ({ ...p, endDate: e.target.value }))} className="cp-input" />
                            </div>
                        )}
                        <div className="cp-form-group">
                            <label><input name="current" type="checkbox" checked={newExp.current} onChange={(e) => setNewExp(p => ({ ...p, current: e.target.checked }))} style={{width:'auto', marginRight:'8px'}} /> Current</label>
                        </div>
                        <div className="cp-form-group">
                            <textarea name="description" value={newExp.description} onChange={(e) => setNewExp(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="cp-input" />
                        </div>
                        <button onClick={handleAddExperience} className="cp-btn-save-item">Save</button>
                    </div>
                )}
                <div className="cp-item-list">
                    {experience.map(exp => <ProfileItem key={exp._id} item={exp} type="exp" onRemove={handleDeleteExperience} onUpdate={handleUpdateExperience} />)}
                </div>
            </div>

            {/* Education */}
            <div className="cp-card">
                <div className="cp-section-header">
                    <h2>Education</h2>
                    <button onClick={() => setShowEduForm(!showEduForm)} className="cp-btn-add-section">{showEduForm ? 'Cancel' : '+ Add Education'}</button>
                </div>
                {showEduForm && (
                    <div className="cp-item-editor">
                        <div className="cp-form-group">
                            <input name="institution" value={newEdu.institution} onChange={(e) => setNewEdu(p => ({ ...p, institution: e.target.value }))} placeholder="Institution *" className={errors.newEdu_institution ? "cp-error cp-input" : "cp-input"} />
                        </div>
                        <div className="cp-form-group">
                            <input name="degree" value={newEdu.degree} onChange={(e) => setNewEdu(p => ({ ...p, degree: e.target.value }))} placeholder="Degree *" className={errors.newEdu_degree ? "cp-error cp-input" : "cp-input"} />
                        </div>
                        <div className="cp-form-group">
                            <input name="field" value={newEdu.field} onChange={(e) => setNewEdu(p => ({ ...p, field: e.target.value }))} placeholder="Field of Study *" className={errors.newEdu_field ? "cp-error cp-input" : "cp-input"} />
                        </div>
                        <div className="cp-form-group">
                            <label>Start Date*</label>
                            <input name="startDate" type="date" value={newEdu.startDate} onChange={(e) => setNewEdu(p => ({ ...p, startDate: e.target.value }))} className={errors.newEdu_startDate ? "cp-error cp-input" : "cp-input"} />
                        </div>
                        {!newEdu.current && (
                            <div className="cp-form-group">
                                <label>End Date</label>
                                <input name="endDate" type="date" value={newEdu.endDate} onChange={(e) => setNewEdu(p => ({ ...p, endDate: e.target.value }))} className="cp-input" />
                            </div>
                        )}
                        <div className="cp-form-group">
                            <label><input name="current" type="checkbox" checked={newEdu.current} onChange={(e) => setNewEdu(p => ({ ...p, current: e.target.checked }))} style={{width:'auto', marginRight:'8px'}} /> Current</label>
                        </div>
                        <button onClick={handleAddEducation} className="cp-btn-save-item">Save</button>
                    </div>
                )}
                <div className="cp-item-list">
                    {education.map(edu => <ProfileItem key={edu._id} item={edu} type="edu" onRemove={handleDeleteEducation} onUpdate={handleUpdateEducation} />)}
                </div>
            </div>
          </div>
        )}

        {/* --- SECTION 2: RESUME MANAGEMENT --- */}
        {activeTab === 'resume' && (
          <div className="cp-tab-content cp-fade-in">
             <div className="cp-resume-container-inner"> 
                <div className="cp-resume-card">
                  <h3 className="cp-section-title">Upload Resume</h3>
                  <form onSubmit={handleResumeUpload}>
                    {/* FIXED: Wrapped inputs in form-group for spacing */}
                    <div className="cp-form-group">
                        <label>Resume Title (Optional)</label>
                        <input type="text" placeholder="e.g. Frontend Developer Resume" value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} className="cp-input" />
                    </div>
                    
                    <div className="cp-form-group">
                        <label>Select Resume File</label>
                        <input id="resume-file" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="cp-input" />
                    </div>

                    {resumeMessage.text && <p className={resumeMessage.type === 'success' ? "cp-success" : "cp-error"}>{resumeMessage.text}</p>}
                    
                    <button className="cp-btn-primary" disabled={resumeLoading}>
                        {resumeLoading ? "Uploading..." : "Upload Resume"}
                    </button>
                  </form>
                </div>

                <div className="cp-resume-card">
                  <h3 className="cp-section-title">Your Resumes</h3>
                  {resumes.length === 0 ? (
                    <p className="cp-empty">No resumes uploaded</p>
                  ) : (
                    resumes.map(res => (
                      <div key={res._id} className={`cp-resume-item ${res.isActive ? "cp-active" : ""}`}>
                        <div>
                          <strong>{res.title}</strong>
                          <p>{res.fileName} • {formatSize(res.fileSize)}</p>
                        </div>
                        <div className="cp-actions">
                          {!res.isActive && <button onClick={() => handleSetActive(res._id)} className="cp-btn-secondary">Set Active</button>}
                          
                          {/* ✅ REPLACED: Text with Icons */}
                          <button 
                            onClick={() => window.open(`http://localhost:5000/${res.filePath.replace(/\\/g, "/")}`, "_blank")} 
                            className="cp-btn-icon cp-view"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          
                          <button 
                            onClick={() => { setResumeToDelete(res._id); setShowDeleteModal(true); }} 
                            className="cp-btn-icon cp-delete"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                          
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                  <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
                  <Modal.Body>Are you sure you want to delete this resume?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleResumeDelete}>Delete</Button>
                  </Modal.Footer>
                </Modal>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CandidateProfile;