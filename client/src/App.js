import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import "./App.css";

import LandingPage from "./pages/LandingPage"; 

import Login from "./pages/Login";
import EmployerLogin from "./pages/EmployerLogin";
import HiringManagerLogin from "./pages/HiringManagerLogin";
import RecruiterLogin from "./pages/RecruiterLogin";
import AdminLogin from "./pages/AdminLogin";
import InterviewerLogin from "./pages/InterviewerLogin";

import Register from "./pages/Register";
import EmployerRegister from "./pages/EmployerRegister";
import HiringManagerRegister from "./pages/HiringManagerRegister";
import RecruiterRegister from "./pages/RecruiterRegister"; 
import InterviewerRegister from "./pages/InterviewerRegister";

// --- Dashboards ---
import Dashboard from "./pages/Dashboard"; // Fallback/Generic Dashboard
import CandidateDashboard from "./pages/CandidateDashboard"; // ✅ NEW
import EmployerDashboard from "./pages/EmployerDashboard";   // ✅ NEW
import ManagerDashboard from "./pages/ManagerDashboard";     // ✅ NEW (Analytics)
import RecruiterDashboard from "./pages/RecruiterDashboard";
import HiringManagerDashboard from "./pages/HiringManagerDashboard"; 
import AdminDashboard from "./pages/AdminDashboard";
import InterviewerDashboard from "./pages/InterviewerDashboard";

// --- Candidate Pages ---
import CandidateProfile from "./pages/CandidateProfile"; 
import CandidateInbox from "./pages/CandidateInbox"; 
import CandidateJobs from "./pages/CandidateJobs"; 

// --- Employer Pages ---
import EmployerProfile from "./pages/EmployerProfile";
import CreatePosition from "./pages/CreatePosition"; 

// --- Recruiter Pages ---
import RecruiterProfile from "./pages/RecruiterProfile"; 
import RecruiterProfileEdit from "./pages/RecruiterProfileEdit";
import RecruiterProfileView from "./pages/RecruiterProfileView";
import ResumeUploadRecruiter from "./pages/ResumeUploadRecruiter"; 
import SubmissionStatus from "./pages/SubmissionStatus";

// --- Hiring Manager Pages ---
import Inbox from "./pages/Inbox";
import OpenPositions from "./pages/OpenPositions"; 
import CandidateListPage from "./pages/CandidateList";
import InterviewDetails from "./pages/InterviewDetails"; 
import ApplicationsDashboard from "./pages/ApplicationsDashboard";
import OnboardingDashboard from "./pages/OnboardingDashboard";
import ViewPurchaseOrders from "./pages/ViewPurchaseOrders";
import CreatePurchaseOrder from "./pages/CreatePurchaseOrder";
import AgencyInvites from "./pages/AgencyInvites";
import ResumeDetailPage from "./pages/ResumeDetailPage";
import PositionDetails from "./pages/PositionDetails";
import CandidateHistory from "./pages/CandidateHistory";

// --- Auth & Misc ---
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function RoleBasedDashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  const role = (user.role || user.userType || "").toLowerCase();

  // ✅ Updated Redirects
  if (role === "candidate") return <Navigate to="/candidate/dashboard" />;
  if (role === "employer") return <Navigate to="/employer/dashboard" />;
  
  if (role === "recruiter") return <Navigate to="/recruiter/dashboard" />;
  if (role === "hiringmanager") return <Navigate to="/hiring-manager/dashboard" />;
  if (role === "admin") return <Navigate to="/admin/dashboard" />;
  if (role === "interviewer") return <Navigate to="/interviewer/dashboard" />;
  
  return <Dashboard />; 
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />

          <Routes>
            {/* ==================== Public Routes ==================== */}
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/login/employer" element={<EmployerLogin />} />
            <Route path="/login/hiring-manager" element={<HiringManagerLogin />} />
            <Route path="/login/recruiter" element={<RecruiterLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/login/interviewer" element={<InterviewerLogin />} />

            <Route path="/register" element={<Register />} />
            <Route path="/register/employer" element={<EmployerRegister />} />
            <Route path="/register/hiring-manager" element={<HiringManagerRegister />} />
            <Route path="/register/recruiter" element={<RecruiterRegister />} /> 
            <Route path="/register/interviewer" element={<InterviewerRegister />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            
            <Route path="/candidate/jobs" element={<CandidateJobs />} />

            {/* ==================== Role-Based Dashboard Redirect ==================== */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['candidate', 'employer', 'hiringmanager', 'recruiter', 'admin', 'interviewer']}>
                  <RoleBasedDashboard />
                </PrivateRoute>
              }
            />
            
            {/* ==================== Admin Routes ==================== */}
            <Route 
              path="/admin/dashboard" 
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />

            {/* ==================== Interviewer Routes ==================== */}
            <Route 
              path="/interviewer/dashboard" 
              element={
                <PrivateRoute allowedRoles={['interviewer']}>
                  <InterviewerDashboard />
                </PrivateRoute>
              } 
            />
            <Route
              path="/interviewer/interviews"
              element={
                <PrivateRoute allowedRoles={['interviewer']}>
                  <InterviewDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/interviewer/interviews/:id"
              element={
                <PrivateRoute allowedRoles={['interviewer']}>
                  <InterviewDetails />
                </PrivateRoute>
              }
            />

            {/* ==================== Candidate Routes (Role: 'candidate') ==================== */}
            
            {/* ✅ New Candidate Dashboard */}
            <Route
              path="/candidate/dashboard"
              element={
                <PrivateRoute allowedRoles={['candidate']}>
                  <CandidateDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/candidate-profile"
              element={
                <PrivateRoute allowedRoles={['candidate']}>
                  <CandidateProfile />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/candidate/inbox"
              element={
                <PrivateRoute allowedRoles={['candidate']}>
                  <CandidateInbox />
                </PrivateRoute>
              }
            />

            {/* ==================== Employer Routes (Role: 'employer') ==================== */}
            
            {/* ✅ New Employer Dashboard */}
            <Route
              path="/employer/dashboard"
              element={
                <PrivateRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </PrivateRoute>
              }
            />

            {/* ✅ Analytics Dashboard (Linked from Employer Dashboard) */}
            <Route
              path="/manager/dashboard"
              element={
                <PrivateRoute allowedRoles={['employer', 'hiringmanager']}>
                  <ManagerDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/profile"
              element={
                <PrivateRoute allowedRoles={['employer']}>
                  <EmployerProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/positions/new"
              element={
                <PrivateRoute allowedRoles={['employer', 'hiringmanager']}>
                  <CreatePosition />
                </PrivateRoute>
              }
            />
            
            {/* ==================== Recruiter Routes (Role: 'recruiter') ==================== */}
            <Route
              path="/recruiter/dashboard"
              element={
                <PrivateRoute allowedRoles={['recruiter']}>
                  <RecruiterDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/profile"
              element={
                <PrivateRoute allowedRoles={['recruiter']}>
                  <RecruiterProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/profile/view"
              element={
                <PrivateRoute allowedRoles={['recruiter']}>
                  <RecruiterProfileView />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/profile/edit"
              element={
                <PrivateRoute allowedRoles={['recruiter']}>
                  <RecruiterProfileEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/submit-resume"
              element={
                <PrivateRoute allowedRoles={['recruiter']}>
                  <ResumeUploadRecruiter />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/submission-status"
              element={
                <PrivateRoute allowedRoles={['recruiter']}>
                  <SubmissionStatus />
                </PrivateRoute>
              }
            />

            {/* ==================== Hiring Manager Routes (Role: 'hiringmanager') ==================== */}
            <Route
              path="/hiring-manager/dashboard"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <HiringManagerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/inbox"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <Inbox />
                </PrivateRoute>
              }
            />

            <Route
              path="/hiring-manager/schedule"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <InterviewDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/schedule/:id"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <InterviewDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/hiring-manager/open-positions"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <OpenPositions />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/candidates"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <CandidateListPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/applications"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <ApplicationsDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/onboarding"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <OnboardingDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/purchase-orders"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <ViewPurchaseOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/create-po"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <CreatePurchaseOrder />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/agencies"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <AgencyInvites />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/resume/:id"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <ResumeDetailPage />
                </PrivateRoute>
              }
            />

            {/* Details Pages */}
            <Route
              path="/hiring-manager/candidate/:id"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <CandidateHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/position/:id"
              element={
                <PrivateRoute allowedRoles={['hiringmanager']}>
                  <PositionDetails />
                </PrivateRoute>
              }
            />

            {/* ==================== Default Redirect ==================== */}
            <Route
              path="*"
              element={
                <div style={{ textAlign: "center", marginTop: "120px" }}>
                  <h2 style={{ fontSize: "2rem", color: "#333" }}>⚠️ 404 - Page Not Found</h2>
                  <p style={{ marginBottom: "20px", color: "#666" }}>
                    The page you are looking for doesn’t exist.
                  </p>
                  <Link
                    to="/"
                    style={{ color: "#007bff", textDecoration: "none", fontWeight: "600" }}
                  >
                    ⬅ Go back to Home
                  </Link>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;