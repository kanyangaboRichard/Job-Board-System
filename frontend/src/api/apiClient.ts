import axios from "axios";

// Read API URL from .env or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3005/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // optional if you handle cookies / JWT
});

export default api;
