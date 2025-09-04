import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";

export default function RequireAdmin({ children }) {
const [ok, setOk] = useState(null);

useEffect(() => {
    let mounted = true;
    (async () => {
    try {
        await api.get("/admin/auth/me");
        if (mounted) setOk(true);
    } catch {
        if (mounted) setOk(false);
    }
    })();
    return () => (mounted = false);
}, []);

if (ok === null) return (
    <div className="min-h-screen grid place-items-center text-zinc-600">
    Đang kiểm tra phiên đăng nhập…
    </div>
);

if (ok === false) return <Navigate to="/admin/login" replace />;

return children;
}
