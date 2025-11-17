// FILE: src/admin/layouts/AdminLayout.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

const NAV = [
{ to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
{ to: "/admin/backstage", label: "Hậu trường", icon: "🎬" },
{ to: "/admin/projects",  label: "Dự án",      icon: "🧱" },
{ to: "/admin/categories",label: "Danh mục",   icon: "🏷️" },
{ to: "/admin/posts",      label: "Bài viết",   icon: "📰" },
{ to: "/admin/partners",   label: "Đối tác",     icon: "🤝" },
{ to: "/admin/contacts",  label: "Liên hệ",    icon: "📬" },
];

export default function AdminLayout() {
const navigate = useNavigate();
const { pathname } = useLocation();
const [open, setOpen] = useState(false);

const logout = async () => {
    try {
    await api.post("/admin/auth/logout");
    } catch (err) {
    console.warn("Logout API failed:", err);
    } finally {
    navigate("/admin/login", { replace: true });
    }
};

return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
    <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.4] mix-blend-screen"
        style={{
        backgroundImage:
            "radial-gradient(1200px 600px at 10% -10%, rgba(244,63,94,0.35), transparent 40%), radial-gradient(1000px 500px at 90% -20%, rgba(249,115,22,0.25), transparent 40%)",
        }}
    />
    <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.06]"
        style={{
        backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='140' height='140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
    />

    <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-zinc-900/70 backdrop-blur">
        <div className="mx-auto flex h-14 md:h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
            <button
            onClick={() => setOpen((s) => !s)}
            className="mr-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 md:hidden"
            aria-label="Toggle sidebar"
            >
            ☰
            </button>
            <img src="/logoconty.png" alt="Logo" className="h-7 w-auto" />
            <div className="ml-1">
            <p className="text-sm font-semibold tracking-wide">DPI MEDIA • Admin</p>
            <p className="text-[11px] text-zinc-400">{breadcrumb(pathname)}</p>
            </div>
        </div>

        <div className="hidden min-w-[280px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 md:flex">
            <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-70" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L19 20.5l1.5-1.5-5-5zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z" />
            </svg>
            <input
            className="w-full bg-transparent outline-none placeholder:text-zinc-500"
            placeholder="Tìm nhanh: dự án, danh mục… (chưa gắn logic)"
            />
        </div>

        <div className="flex items-center gap-2">
            <a
            href="/"
            className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 md:inline-block"
            title="Về website"
            >
            ⇦ Về website
            </a>
            <button
            onClick={logout}
            className="rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-2 text-sm font-medium text-white hover:opacity-95"
            title="Đăng xuất"
            >
            Đăng xuất
            </button>
        </div>
        </div>
    </header>

    {/* Content wrapper bù trừ chiều cao header */}
    <div className="pt-14 md:pt-16">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 md:grid-cols-[250px_1fr]">
        <Sidebar open={open} onClose={() => setOpen(false)} />

        <main className="relative min-h-screen p-4 md:p-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Outlet />
            </div>

            <footer className="mt-6 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} DPI MEDIA — Internal Admin
            </footer>
        </main>
        </div>
    </div>
    </div>
);
}

function Sidebar({ open, onClose }) {
return (
    <>
    <div
        className={[
        "fixed left-0 right-0 top-14 bottom-0 z-30 bg-black/50 md:hidden transition-opacity",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
    />

    <aside
        className={[
        "fixed left-0 top-14 bottom-0 z-40 w-72 border-r border-white/10 bg-zinc-900/70 backdrop-blur",
        "md:static md:top-auto md:bottom-auto md:w-[250px] md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
        "transition-transform",
        ].join(" ")}
        onClick={onClose}
    >
        <nav className="flex h-full flex-col p-3">
        <div className="mb-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-400">
            <p className="font-medium text-zinc-200">Bảng điều khiển</p>
            <p>Quản lý nội dung Landing Page Media</p>
        </div>

        <ul className="flex-1 space-y-1">
            {NAV.map((n) => (
            <li key={n.to}>
                <NavLink
                to={n.to}
                className={({ isActive }) =>
                    [
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                    "transition hover:bg-white/5",
                    isActive ? "bg-white/10 text-white" : "text-zinc-300",
                    ].join(" ")
                }
                >
                {({ isActive }) => (
                    <>
                    <span className="text-base">{n.icon}</span>
                    <span className="flex-1">{n.label}</span>
                    <span
                        className={[
                        "h-2 w-2 rounded-full transition",
                        isActive ? "bg-rose-400" : "bg-transparent group-hover:bg-white/20",
                        ].join(" ")}
                    />
                    </>
                )}
                </NavLink>
            </li>
            ))}
        </ul>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-zinc-400">
            <p className="mb-1 font-medium text-zinc-200">Gợi ý</p>
            <p>Hãy thường xuyên “Làm mới” dữ liệu sau khi cập nhật nội dung.</p>
        </div>
        </nav>
    </aside>
    </>
);
}

function breadcrumb(path) {
const parts = path.split("/").filter(Boolean);
if (parts[0] !== "admin") return "Client";
if (parts.length === 1) return "Admin";
return `Admin / ${capitalize(parts[1])}`;
}
function capitalize(s = "") {
return s.slice(0, 1).toUpperCase() + s.slice(1);
}
