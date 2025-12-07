import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Session expired or unauthorized. Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const currentPath = window.location.pathname;
      if (!["/login", "/register", "/employer-register", "/hiring-manager-login"].includes(currentPath)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
