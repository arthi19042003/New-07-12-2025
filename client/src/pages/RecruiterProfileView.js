import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./RecruiterProfileView.css";

const RecruiterProfileView = () => {
  const { recruiter, getRecruiterProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      // 1. Call the API to get the profile
      const res = await getRecruiterProfile();
      
      // 2. Check for success and the recruiter object
      if (res.success && res.recruiter) {
        // 3. Set the profile state to the nested 'profile' object
        // The backend returns the User object, which contains 'profile'
        setProfile(res.recruiter.profile || {}); 
      }
    };
    loadProfile();
  }, [recruiter, getRecruiterProfile]);

  if (!profile)
    return (
      <div className="recruiter-profile-view-page text-center">
        <p className="loading-text">Loading profile...</p>
      </div>
    );

  // Helper variable to safely get certifications regardless of casing or type
  const certifications = profile.companyCertifications || profile.companycertifications;
  const certDisplay = Array.isArray(certifications) 
    ? certifications.join(", ") 
    : certifications;

  return (
    <div className="recruiter-profile-view-page">
      <div className="recruiter-profile-card">
        <h2 className="recruiter-profile-title">Recruiter Profile</h2>

        <div className="recruiter-profile-info">
          {/* Address */}
          <ProfileField label="Address" value={profile.address} />
          
          {/* Major Skills Area - Handle Array */}
          <ProfileField
            label="Major Skills Area"
            value={
              Array.isArray(profile.majorskillsarea)
                ? profile.majorskillsarea.join(", ")
                : profile.majorskillsarea
            }
          />
          
          {/* Resume Skills - Lowercase in Schema */}
          <ProfileField label="Resume Skills" value={profile.resumeskills} />
          
          {/* Partnerships - Lowercase in Schema */}
          <ProfileField label="Partnerships" value={profile.partnerships} />
          
          {/* Company Website - CamelCase (with fallback) */}
          <ProfileField label="Company Website" value={profile.companyWebsite || profile.companywebsite} />
          
          {/* Company Phone - CamelCase (with fallback) */}
          <ProfileField label="Company Phone" value={profile.companyPhone || profile.companyphone} />
          
          {/* Company Address - CamelCase (with fallback) */}
          <ProfileField label="Company Address" value={profile.companyAddress || profile.companyaddress} />
          
          {/* Location - CamelCase (with fallback) */}
          <ProfileField label="Location" value={profile.location || profile.companyLocation} />
          
          {/* Company Certifications - CamelCase (with fallback) */}
          <ProfileField
            label="Company Certifications"
            value={certDisplay}
          />
          
          {/* DUNS Number - CamelCase (with fallback) */}
          <ProfileField label="DUNS Number" value={profile.dunsNumber || profile.dunsnumber} />
          
          {/* Number of Employees - Lowercase in Schema */}
          <ProfileField
            label="Number of Employees"
            value={profile.numberofemployees}
          />

          {/* Rate Cards */}
          <div className="form-group">
            <label>Ratecards:</label>
            {profile.ratecards && profile.ratecards.length > 0 ? (
              <ul className="ratecard-list">
                {profile.ratecards.map((card, i) => (
                  <li key={i}>
                    <strong>{card.role}</strong> — {card.lpa} LPA
                  </li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
          </div>
        </div>

        <div className="actions text-center">
          <button
            onClick={() => navigate("/recruiter/profile/edit")}
            className="button"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Displaying Fields
const ProfileField = ({ label, value }) => (
  <div className="form-group">
    <label>{label}:</label>
    <p>{value || "—"}</p>
  </div>
);

export default RecruiterProfileView;