// src/api/apiClient.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3005/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const persistedRoot = localStorage.getItem("persist:root");
    if (persistedRoot) {
      const parsedRoot = JSON.parse(persistedRoot);

      if (parsedRoot.auth) {
        const auth = JSON.parse(parsedRoot.auth);

        if (auth?.token) {
          if (import.meta.env.DEV) {
            console.log("Attaching token:", auth.token);
          }
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${auth.token}`,
          };
        } else {
          if (import.meta.env.DEV) {
            console.warn("No token found in persisted auth slice");
          }
        }
      }
    }
  } catch (err) {
    console.error("Error reading persisted token:", err);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("Unauthorized – token missing, expired, or invalid");
    }
    return Promise.reject(err);
  }
);

export default api;
