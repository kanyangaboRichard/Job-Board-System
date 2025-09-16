import axios from "axios";

// Read API URL from .env
const API_URL = import.meta.env.VITE_API_URL || "VITE_API_URL";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
