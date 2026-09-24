import axios from "axios";

// Normalize baseURL so it always has the "/api" suffix even if user omits it in Vercel
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const cleanUrl = rawUrl.trim().replace(/\/+$/, "");
const baseURL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;