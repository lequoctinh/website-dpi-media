// FILE: src/admin/pages/AdminLogin.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api"; 

export default function AdminLogin() {
const navigate = useNavigate();
const [showPw, setShowPw] = useState(false);
const [loading, setLoading] = useState(false);
const [errMsg, setErrMsg] = useState("");
const emailRef = useRef(null);
const passwordRef = useRef(null);
const rememberRef = useRef(null);

const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
    e.preventDefault(); 
    passwordRef.current?.focus();
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);

    const email = emailRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";
    const remember = !!rememberRef.current?.checked;

    if (!email || !password) {
    setErrMsg("Vui lòng nhập đầy đủ Email và Mật khẩu.");
    setLoading(false);
    return;
    }

    try {
    await api.post("/admin/auth/login", { username: email, password, remember });
    navigate("/admin/dashboard");
    } catch (err) {
    const msg =
        err?.response?.data?.error ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
    setErrMsg(msg);
    } finally {
    setLoading(false);
    }
};

return (
    <div className="min-h-screen grid md:grid-cols-2 bg-zinc-50">
    <aside className="relative hidden md:block overflow-hidden">
        <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/admin_login/login-cover.jpg')" }}
        aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
            backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        />

        <div className="relative z-10 flex items-center gap-3 p-6">
        <img src="/logoconty.png" alt="Logo công ty" className="h-9 w-auto drop-shadow" />
        <span className="text-white/90 font-semibold tracking-wide">Media Studio</span>
        </div>

        <div className="relative z-10 h-[calc(100%-72px)] flex flex-col justify-end p-6 lg:p-10 text-white">
        <h1 className="text-3xl lg:text-5xl font-semibold leading-tight drop-shadow-sm">
            Quản trị nội dung <br className="hidden lg:block" />
            Landing Page Media
        </h1>
        <p className="mt-3 text-white/80 max-w-xl">
            Truy cập để cập nhật Showreel, Dự án, Hậu trường, FAQ và xử lý liên hệ từ khách hàng.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">🎬 TVC</span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">📷 Behind-the-scenes</span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">🖥️ Post-production</span>
        </div>

        <div className="mt-10 text-xs text-white/60">
            © {new Date().getFullYear()} DPI MEDIA — Internal Access Only
        </div>
        </div>
    </aside>

    <section className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
        <div className="mb-6 md:hidden text-center">
            <img src="/logoconty.png" alt="Logo" className="h-12 mx-auto" />
            <h2 className="mt-3 text-xl font-semibold">Đăng nhập quản trị</h2>
            <p className="text-sm text-zinc-500">Khu vực dành riêng cho Admin</p>
        </div>

        <form
            className="relative rounded-2xl border border-zinc-200 bg-white/90 backdrop-blur p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] space-y-4"
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="hidden md:block mb-2">
            <h3 className="text-lg font-semibold">Đăng nhập</h3>
            <p className="text-sm text-zinc-500">Sử dụng tài khoản nội bộ</p>
            </div>

            <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
                ref={emailRef}
                type="email"
                required
                autoComplete="email"
                placeholder="admin@domain.com"
                onKeyDown={handleEmailKeyDown}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none ring-0 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/80 transition"
            />
            </label>

            <label className="block">
            <span className="text-sm font-medium">Mật khẩu</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 focus-within:ring-2 focus-within:ring-zinc-900/80 transition">
                <input
                ref={passwordRef}
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full outline-none"
                />
                <button
                type="button"
                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="text-sm text-zinc-600 hover:text-zinc-900"
                onClick={() => setShowPw((s) => !s)}
                >
                {showPw ? "Ẩn" : "Hiện"}
                </button>
            </div>
            </label>

            <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-600">
                <input ref={rememberRef} type="checkbox" defaultChecked className="rounded border-zinc-300" />
                Ghi nhớ đăng nhập
            </label>
            <a href="#" className="text-sm text-zinc-800 hover:underline">
                Quên mật khẩu?
            </a>
            </div>

            {errMsg && <div className="text-sm text-red-600">{errMsg}</div>}

            <button
            type="submit"
            disabled={loading}
            className="group w-full rounded-xl bg-zinc-900 text-white py-2 font-medium transition hover:opacity-90 active:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/80 disabled:opacity-60"
            >
            <span className="inline-flex items-center justify-center gap-2">
                {loading ? "Đang xử lý..." : "Đăng nhập"}
                {!loading && (
                <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M10.293 3.293a1 1 0 011.414 0l5 5a.997.997 0 01.083 1.32l-.083.094-5 5a1 1 0 01-1.497-1.32l.083-.094L13.585 11H4a1 1 0 01-.117-1.993L4 9h9.585l-3.292-3.293a1 1 0 010-1.414z" />
                </svg>
                )}
            </span>
            </button>

            <div className="flex items-center gap-3 pt-2">
            <span className="h-px flex-1 bg-zinc-200" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-400">Protected</span>
            <span className="h-px flex-1 bg-zinc-200" />
            </div>

            <p className="text-xs text-zinc-500">
            Chỉ dùng cho mục đích nội bộ. Vui lòng không chia sẻ tài khoản cho bên thứ ba.
            </p>
        </form>

        <div className="mt-6 text-[11px] text-zinc-500 text-center">
            Tdev • thanks for • your support
        </div>
        </div>
    </section>
    </div>
);
}
