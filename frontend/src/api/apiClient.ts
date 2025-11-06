// src/api/apiClient.ts
import axios from "axios";

// Use Vite environment variable or fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://job-board-system.onrender.com/api";

// Create shared Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

//Helper: Get Authorization header dynamically
export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in again.");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };
};

//  Interceptor: Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (import.meta.env.DEV) {
      console.warn(" No token found (persisted auth may not be loaded yet)");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  Interceptor: Handle global 401s
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn(" Unauthorized – invalid or expired token.");
      // Optionally redirect or clear token here
    }
    return Promise.reject(err);
  }
);

export default api;
