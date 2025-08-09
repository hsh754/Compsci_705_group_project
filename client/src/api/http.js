// src/api/http.js
import axios from "axios";

export const http = axios.create({
    baseURL: process.env.REACT_APP_API_BASE || "http://localhost:5000",
    timeout: 15000,
});

// Request interceptor: attach token automatically
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
