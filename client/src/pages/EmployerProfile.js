import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./EmployerProfile.css";

const emptyTeamMember = () => ({ firstName: "", lastName: "", email: "", phone: "", role: "" });

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

export default function EmployerProfile() {
  const { user } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    hiringManagerFirstName: "",
    hiringManagerLastName: "",
    hiringManagerPhone: "",
    organization: "",
    department: "",
    costCenter: "",
    preferredCommunicationMode: "Email",
    address: "",
    companyWebsite: "",
    companyPhone: "",
    companyAddress: "",
    companyLocation: "",
    projectSponsors: [],
    projects: [], 
  });

  // Phone Code States for Main Form
  const [hmPhoneCode, setHmPhoneCode] = useState("+91");
  const [coPhoneCode, setCoPhoneCode] = useState("+91");
  
  // Phone Code State for Team Member Input
  const [teamPhoneCode, setTeamPhoneCode] = useState("+91");

  const [sponsorInput, setSponsorInput] = useState("");
  const [teamInput, setTeamInput] = useState(emptyTeamMember());

  const [editingIndex, setEditingIndex] = useState(null);

  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({}); 

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // ✅ CHANGED: Point to /employer instead of /profile
        const res = await api.get("/employer"); 
        const data = res.data?.user?.profile || {};
        const payload = data;
        
        if (payload) {
          // Logic to split Hiring Manager Phone
          let hmPhone = payload.hiringManagerPhone || "";
          let hmCode = "+91";
          const foundHmCode = countryCodes.find(c => hmPhone.startsWith(c.code));
          if (foundHmCode) {
            hmCode = foundHmCode.code;
            hmPhone = hmPhone.replace(foundHmCode.code, "");
          }
          setHmPhoneCode(hmCode);

          // Logic to split Company Phone
          let coPhone = payload.companyPhone || "";
          let coCode = "+91";
          const foundCoCode = countryCodes.find(c => coPhone.startsWith(c.code));
          if (foundCoCode) {
            coCode = foundCoCode.code;
            coPhone = coPhone.replace(foundCoCode.code, "");
          }
          setCoPhoneCode(coCode);

          setForm(prev => ({
            ...prev,
            companyName: payload.companyName || prev.companyName,
            hiringManagerFirstName: payload.hiringManagerFirstName || prev.hiringManagerFirstName,
            hiringManagerLastName: payload.hiringManagerLastName || prev.hiringManagerLastName,
            hiringManagerPhone: hmPhone, 
            organization: payload.organization || prev.organization,
            department: payload.department || prev.department,
            costCenter: payload.costCenter || prev.costCenter,
            preferredCommunicationMode: payload.preferredCommunicationMode || prev.preferredCommunicationMode,
            address: payload.address || prev.address,
            companyWebsite: payload.companyWebsite || prev.companyWebsite,
            companyPhone: coPhone, 
            companyAddress: payload.companyAddress || prev.companyAddress,
            companyLocation: payload.companyLocation || prev.companyLocation,
            projectSponsors: Array.isArray(payload.projectSponsors) ? payload.projectSponsors : prev.projectSponsors,
            projects: Array.isArray(payload.projects) ? payload.projects.map(p => ({ ...p, teamMembers: p.teamMembers || [] })) : prev.projects,
          }));
        }
      } catch (err) {
        console.warn("Could not load employer profile:", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Restrict phone inputs to numbers only
    if (name === 'hiringManagerPhone' || name === 'companyPhone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setForm(f => ({ ...f, [name]: numericValue }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }

    if (message.type === "error") setMessage({ type: "", text: "" }); 
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null })); 
  };

  const addSponsor = () => {
    const v = sponsorInput.trim();
    if (!v) return setMessage({ type: "error", text: "Sponsor name cannot be empty" });
    if (form.projectSponsors.includes(v)) {
      setMessage({ type: "error", text: "Sponsor already added" });
      return;
    }
    setForm(f => ({ ...f, projectSponsors: [...f.projectSponsors, v] }));
    setSponsorInput("");
    setMessage({ type: "success", text: "Sponsor added" });
  };
  const removeSponsor = (i) => {
    setForm(f => ({ ...f, projectSponsors: f.projectSponsors.filter((_, idx) => idx !== i) }));
  };

  const addProject = () => {
    setForm(f => ({
      ...f,
      projects: [...f.projects, { projectName: "", teamMembers: [], collapsed: false }] 
    }));
  };
  const removeProject = (index) => {
    setForm(f => ({ ...f, projects: f.projects.filter((_, i) => i !== index) }));
  };
  const updateProjectField = (index, field, value) => {
    setForm(f => {
      const projects = [...f.projects];
      projects[index] = { ...projects[index], [field]: value };
      return { ...f, projects };
    });
  };

  const handleAddOrUpdateMember = (projectIndex) => {
    const name = teamInput.firstName.trim();
    if (!name) {
        setMessage({ type: "error", text: "Team member first name is required" });
        return;
    }

    // Combine phone code and number
    const memberData = {
        ...teamInput,
        phone: teamInput.phone ? `${teamPhoneCode}${teamInput.phone}` : ""
    };

    if (editingIndex && editingIndex.project === projectIndex) {
      setForm(f => ({
        ...f,
        projects: f.projects.map((project, pIdx) => {
          if (pIdx !== projectIndex) return project;
          return {
            ...project,
            teamMembers: project.teamMembers.map((member, mIdx) => {
              if (mIdx !== editingIndex.member) return member;
              return memberData; 
            })
          };
        })
      }));
      setMessage({ type: "success", text: "Team member updated" });
    } else {
      setForm(f => ({
        ...f,
        projects: f.projects.map((project, index) => {
          if (index !== projectIndex) return project;
          return {
            ...project,
            teamMembers: [...(project.teamMembers || []), { ...memberData }]
          };
        })
      }));
      setMessage({ type: "success", text: "Team member added" });
    }

    setTeamInput(emptyTeamMember());
    setTeamPhoneCode("+91"); // Reset phone code
    setEditingIndex(null);
  };

  const handleEditMember = (projectIndex, memberIndex, member) => {
    // Parse phone number when editing
    let phone = member.phone || "";
    let code = "+91";
    const foundCode = countryCodes.find(c => phone.startsWith(c.code));
    if(foundCode) {
        code = foundCode.code;
        phone = phone.replace(foundCode.code, "");
    }
    
    setTeamInput({ ...member, phone: phone });
    setTeamPhoneCode(code);
    setEditingIndex({ project: projectIndex, member: memberIndex });
  };
  
  const handleCancelEdit = () => {
    setTeamInput(emptyTeamMember());
    setTeamPhoneCode("+91");
    setEditingIndex(null);
  };

  const removeTeamMember = (projectIndex, memberIndex) => {
    setForm(f => {
      const newProjects = f.projects.map((project, pIdx) => {
        if (pIdx !== projectIndex) return project;
        return {
          ...project,
          teamMembers: project.teamMembers.filter((_, mIdx) => mIdx !== memberIndex)
        };
      });
      return { ...f, projects: newProjects };
    });
    if (editingIndex?.project === projectIndex && editingIndex?.member === memberIndex) {
      handleCancelEdit();
    }
  };

  const validateBeforeSave = () => {
    const newErrors = {};
    const required = [
      "companyName", "hiringManagerFirstName", "hiringManagerLastName", "hiringManagerPhone",
      "companyWebsite", "companyPhone", "companyAddress", "companyLocation",
      "organization", "department"
    ];
    
    let hasError = false;
    for (const k of required) {
      if (!form[k] || !String(form[k]).trim()) {
        newErrors[k] = "This field is required";
        hasError = true;
      }
    }
    
    if (form.hiringManagerPhone.length !== 10) {
        newErrors.hiringManagerPhone = "Must be 10 digits";
        hasError = true;
    }
    
    if (form.companyPhone.length !== 10) {
        newErrors.companyPhone = "Must be 10 digits";
        hasError = true;
    }

    setErrors(newErrors);
    if (hasError) setMessage({ type: "error", text: "Please fill all required fields correctly" });
    return !hasError; 
  };

  const saveProfile = async () => {
    setMessage({ type: "", text: "" }); 
    if (!validateBeforeSave()) return;
    setSaving(true);
    
    // Combine codes and numbers for submission
    const payload = {
      ...form,
      hiringManagerPhone: `${hmPhoneCode}${form.hiringManagerPhone}`,
      companyPhone: `${coPhoneCode}${form.companyPhone}`,
      projects: form.projects.map(({ collapsed, ...rest }) => ({
        ...rest,
        teamSize: rest.teamMembers.length 
      }))
    };

    try {
      // ✅ CHANGED: Point to /employer instead of /profile
      await api.put("/employer", payload); 
      setMessage({ type: "success", text: "Profile saved successfully" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err?.response?.data?.message || "Error saving profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="emp-loading">Loading...</div>;

  return (
    <div className="emp-page">
      <div className="emp-inner">
        <h1 className="emp-title">Employer Profile</h1>
        <p className="emp-sub">Manage your company information and projects</p>

        {/* ... Account / Hiring Manager Section (Unchanged) ... */}
        <section className="card">
          <div className="card-header"><span className="side-bar" />Account Information</div>
          <div className="row">
            <label className="lbl">Company Name <span className="req">*</span></label>
            <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company Name" className={errors.companyName ? "error" : ""} />
          </div>
          <div className="two-cols">
            <div>
              <label className="lbl">Hiring Manager First Name <span className="req">*</span></label>
              <input name="hiringManagerFirstName" value={form.hiringManagerFirstName} onChange={handleChange} placeholder="First Name" className={errors.hiringManagerFirstName ? "error" : ""} />
            </div>
            <div>
              <label className="lbl">Hiring Manager Last Name <span className="req">*</span></label>
              <input name="hiringManagerLastName" value={form.hiringManagerLastName} onChange={handleChange} placeholder="Last Name" className={errors.hiringManagerLastName ? "error" : ""} />
            </div>
          </div>
          <div className="row">
            <label className="lbl">Hiring Manager Phone <span className="req">*</span></label>
            <div className="phone-group">
                <select 
                    className="phone-prefix-select"
                    value={hmPhoneCode}
                    onChange={(e) => setHmPhoneCode(e.target.value)}
                >
                    {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                </select>
                <input 
                    type="tel" 
                    name="hiringManagerPhone" 
                    value={form.hiringManagerPhone} 
                    onChange={handleChange} 
                    placeholder="10-digit number"
                    maxLength="10"
                    className={errors.hiringManagerPhone ? "error" : ""} 
                />
            </div>
            {errors.hiringManagerPhone && <span className="error-text" style={{fontSize:'12px', color:'red', marginTop:'4px'}}>{errors.hiringManagerPhone}</span>}
          </div>
          <div className="row">
            <label className="lbl">Login Email</label>
            <input value={user?.email || ""} disabled />
          </div>
        </section>

        {/* ... Company Info Section (Unchanged) ... */}
        <section className="card">
          <div className="card-header"><span className="side-bar" />Company Information</div>
          <div className="row">
            <label className="lbl">Address</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Enter primary address" />
          </div>
          <div className="two-cols">
            <div>
              <label className="lbl">Company Website <span className="req">*</span></label>
              <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange} placeholder="https://www.company.com" className={errors.companyWebsite ? "error" : ""} />
            </div>
            <div>
              <label className="lbl">Company Phone <span className="req">*</span></label>
              <div className="phone-group">
                <select 
                    className="phone-prefix-select"
                    value={coPhoneCode}
                    onChange={(e) => setCoPhoneCode(e.target.value)}
                >
                    {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                </select>
                <input 
                    type="tel" 
                    name="companyPhone" 
                    value={form.companyPhone} 
                    onChange={handleChange} 
                    placeholder="10-digit number"
                    maxLength="10"
                    className={errors.companyPhone ? "error" : ""} 
                />
              </div>
              {errors.companyPhone && <span className="error-text" style={{fontSize:'12px', color:'red', marginTop:'4px'}}>{errors.companyPhone}</span>}
            </div>
          </div>
          <div className="two-cols">
            <div>
              <label className="lbl">Company Address <span className="req">*</span></label>
              <input name="companyAddress" value={form.companyAddress} onChange={handleChange} placeholder="Street address" className={errors.companyAddress ? "error" : ""} />
            </div>
            <div>
              <label className="lbl">Company Location <span className="req">*</span></label>
              <input name="companyLocation" value={form.companyLocation} onChange={handleChange} placeholder="City, State, Country" className={errors.companyLocation ? "error" : ""} />
            </div>
          </div>
        </section>

        {/* ... Organization & Sponsors (Unchanged) ... */}
        <section className="card">
          <div className="card-header"><span className="side-bar" />Organization Details</div>
          <div className="two-cols">
            <div>
              <label className="lbl">Organization <span className="req">*</span></label>
              <input name="organization" value={form.organization} onChange={handleChange} placeholder="Organization name" className={errors.organization ? "error" : ""} />
            </div>
            <div>
              <label className="lbl">Cost Center</label>
              <input name="costCenter" value={form.costCenter} onChange={handleChange} placeholder="Cost center code" />
            </div>
          </div>
          <div className="row">
            <label className="lbl">Department <span className="req">*</span></label>
            <input name="department" value={form.department} onChange={handleChange} placeholder="Department name" className={errors.department ? "error" : ""} />
          </div>
          <div className="row">
            <label className="lbl">Preferred Communication Mode</label>
            <div className="radio-row">
              <label><input type="radio" name="preferredCommunicationMode" value="Email" checked={form.preferredCommunicationMode === "Email"} onChange={handleChange} /> Email</label>
              <label><input type="radio" name="preferredCommunicationMode" value="Phone" checked={form.preferredCommunicationMode === "Phone"} onChange={handleChange} /> Phone</label>
            </div>
          </div>
        </section>
        
        <section className="card">
          <div className="card-header"><span className="side-bar" />Project Sponsors</div>
          <div className="two-cols">
            <div>
              <label className="lbl small">Add key stakeholders and sponsors</label>
              <input placeholder="Add sponsor name" value={sponsorInput} onChange={(e) => setSponsorInput(e.target.value)} />
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button className="btn small violet" onClick={addSponsor}>Add</button>
            </div>
          </div>
          <div className="sponsor-list">
            {form.projectSponsors.length === 0 && <div className="muted">No sponsors added</div>}
            {form.projectSponsors.map((s, i) => (
              <div key={i} className="pill">
                <span>{s}</span>
                <button onClick={() => removeSponsor(i)} className="pill-remove">×</button>
              </div>
            ))}
          </div>
        </section>

        {/* --- Projects Section --- */}
        <section className="card">
          <div className="card-header"><span className="side-bar" />Projects</div>
          <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <div className="muted">Manage your projects and team members</div>
            <button className="btn small violet" onClick={addProject}>+ Add Project</button>
          </div>
          {form.projects.length === 0 && <div className="muted">No projects yet. Click “+ Add Project” to create one.</div>}
          {form.projects.map((p, pi) => (
            <div key={pi} className="project-card">
              <div className="project-top">
                <strong>Project {pi + 1}{p.collapsed ? `: ${p.projectName || 'Untitled'} (Team Size: ${p.teamMembers.length})` : ''}</strong>
                <div className="project-top-actions">
                  <button className="btn tiny violet" onClick={() => updateProjectField(pi, "collapsed", !p.collapsed)}>{p.collapsed ? "Expand" : "Collapse"}</button>
                  <button className="btn danger tiny" onClick={() => removeProject(pi)}>Remove Project</button>
                </div>
              </div>
              {!p.collapsed && (
                <>
                  <div className="two-cols">
                    <div>
                      <label className="lbl">Project Name</label>
                      <input value={p.projectName} onChange={(e) => updateProjectField(pi, "projectName", e.target.value)} placeholder="Enter project name" />
                    </div>
                  </div>
                  <div className="team-section">
                    <div className="team-top"><div><strong>Team Members</strong></div></div>
                    <div className="member-list">
                      { (p.teamMembers || []).length === 0 && <div className="muted">No team members</div> }
                      {(p.teamMembers || []).map((m, mi) => (
                        <div className="member-row" key={mi}>
                          <div className="member-info">
                            <div><strong>Member {mi + 1}</strong></div>
                            <div className="two-cols"><input value={m.firstName} readOnly placeholder="First name" /><input value={m.lastName} readOnly placeholder="Last name" /></div>
                            <div className="two-cols"><input value={m.email} readOnly placeholder="Email" /><input value={m.phone} readOnly placeholder="Phone" /></div>
                            <div><input value={m.role} readOnly placeholder="Role" /></div>
                          </div>
                          <div className="member-actions">
                            <button className="btn tiny violet" onClick={() => handleEditMember(pi, mi, m)}>Edit</button>
                            <button className="btn danger tiny" onClick={() => removeTeamMember(pi, mi)}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* --- Team Member Form with Updated Phone --- */}
                    <div className="add-member-form">
                      <div className="two-cols">
                        <input placeholder="First name" value={teamInput.firstName} onChange={(e) => setTeamInput(t => ({ ...t, firstName: e.target.value }))} />
                        <input placeholder="Last name" value={teamInput.lastName} onChange={(e) => setTeamInput(t => ({ ...t, lastName: e.target.value }))} />
                      </div>
                      <div className="two-cols">
                        <input placeholder="Email" value={teamInput.email} onChange={(e) => setTeamInput(t => ({ ...t, email: e.target.value }))} />
                        
                        {/* Updated Team Phone with Dropdown */}
                        <div className="phone-group">
                            <select 
                                className="phone-prefix-select"
                                value={teamPhoneCode}
                                onChange={(e) => setTeamPhoneCode(e.target.value)}
                            >
                                {countryCodes.map((c) => (
                                    <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                            </select>
                            <input 
                                type="tel" 
                                placeholder="10-digit number"
                                maxLength="10"
                                value={teamInput.phone} 
                                onChange={(e) => setTeamInput(t => ({ ...t, phone: e.target.value.replace(/\D/g, '') }))} 
                            />
                        </div>
                      </div>
                      <div className="row"><input placeholder="Role (e.g. Developer)" value={teamInput.role} onChange={(e) => setTeamInput(t => ({ ...t, role: e.target.value }))} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn violet" onClick={() => handleAddOrUpdateMember(pi)}>{editingIndex && editingIndex.project === pi ? 'Update Team Member' : '+ Add Team Member'}</button>
                          {editingIndex && editingIndex.project === pi && <button className="btn small" onClick={handleCancelEdit}>Cancel</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </section>

        <div style={{ marginTop: 18 }}>
          {message.text && <div className={`emp-alert ${message.type === "error" ? "error" : "success"}`}>{message.text}</div>}
          <button className="save-btn" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Employer Profile"}</button>
        </div>
      </div>
    </div>
  );
}