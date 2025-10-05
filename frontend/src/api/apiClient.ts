// src/api/apiClient.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3005/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ✅ Utility function to safely extract token from persisted Redux
function getStoredToken(): string | null {
  // Try plain token (set manually in MainLayout or login)
  const directToken = localStorage.getItem("token");
  if (directToken) return directToken;

  // Fallback: try Redux-persisted state
  const persistedRoot = localStorage.getItem("persist:root");
  if (!persistedRoot) return null;

  try {
    const parsedRoot = JSON.parse(persistedRoot);
    const authData = parsedRoot.auth ? JSON.parse(parsedRoot.auth) : null;
    return authData?.token || null;
  } catch (err) {
    console.error("Error parsing persisted token:", err);
    return null;
  }
}

// ✅ Intercept requests and attach token dynamically
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
      if (import.meta.env.DEV) {
        console.log("✅ Attaching token:", token);
      }
    } else if (import.meta.env.DEV) {
      console.warn("🚫 No token found (yet) in persisted auth slice");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

//  Handle unauthorized responses gracefully
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn(" Unauthorized – token expired, invalid, or missing");
      // optional: redirect or clear persisted state here
      // localStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

export default api;
