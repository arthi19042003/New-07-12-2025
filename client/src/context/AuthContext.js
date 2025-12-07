import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios"; 

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      api.get("/profile")
        .then(res => {
          if (res.data && res.data.user) {
             setUser(res.data.user);
          } else {
             localStorage.removeItem("token");
             delete api.defaults.headers.common['Authorization'];
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false); 
    }
  }, []);

  
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password, role: "candidate" });
      if (res.data.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Login failed" };
    }
  };

  const register = async (emailOrData, password) => {
    let registrationData;

    if (typeof emailOrData === 'string') {
      registrationData = { email: emailOrData, password: password, role: 'candidate' };
    } else {
      registrationData = { ...emailOrData };
    }

    try {
      const res = await api.post("/auth/register", registrationData);
      if (res.data.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: "Waiting for Access" };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  const manuallySetUser = (userData) => {
    setUser(userData);
  };
  
  const updateUser = (newUserData) => {
     setUser(prevUser => ({...prevUser, ...newUserData}));
  }

  const recruiterProfile = async (profileData) => {
    try {
      const res = await api.put("/profile", profileData); 
      if (res.data && res.data.success && res.data.user) {
        setUser(res.data.user); 
        return { success: true, user: res.data.user };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Profile update failed" };
    }
  };

  const getRecruiterProfile = async () => {
     try {
      const res = await api.get("/profile"); 
      if (res.data && res.data.user) {
        setUser(res.data.user);
        return { success: true, recruiter: res.data.user };
      }
      return { success: false, error: "Profile not found" };
    } catch (err) {
       return { success: false, error: err.response?.data?.message || "Failed to fetch profile" };
    }
  };

  const value = {
    user,
    recruiter: user, 
    setUser: manuallySetUser,
    updateUser,
    loading,
    login,
    register,
    logout,
    recruiterProfile, 
    getRecruiterProfile, 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};