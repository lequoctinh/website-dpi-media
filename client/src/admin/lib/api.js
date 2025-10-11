import axios from "axios";

export const API_BASE   = (import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");
export const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || "").replace(/\/+$/, "");

export const assetUrl = (p="") =>
/^https?:\/\//i.test(p) ? p : `${ASSET_BASE}${p.startsWith("/")?p:`/${p}`}`;

export const api = axios.create({
baseURL: API_BASE,
withCredentials: true,       // admin đăng nhập qua cookie -> giữ
});

// (tuỳ) Nếu có JWT lưu localStorage thì bật đoạn này:
// api.interceptors.request.use(cfg => {
//   const t = localStorage.getItem("token");
//   if (t) cfg.headers.Authorization = `Bearer ${t}`;
//   return cfg;
// });

api.interceptors.response.use(
r => r,
err => {
    if (err?.response?.status === 401) {
    // nếu cần: localStorage.removeItem("token");
    if (!location.pathname.startsWith("/admin/login")) {
        location.assign("/admin/login");
    }
    }
    return Promise.reject(err);
}
);
