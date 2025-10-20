import axios from "axios";
const API_BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");

export const api = axios.create({
baseURL: API_BASE,
withCredentials: false, // đổi true nếu cần cookie
timeout: 15000,
});

api.interceptors.response.use(
(res) => res,
(err) => Promise.reject(err)
);
