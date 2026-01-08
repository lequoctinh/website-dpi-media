import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Dashboard() {
const [stats, setStats] = useState({
    videoProjeckCount: 0,
    categoryCount: 0,
    backstageCount: 0,
    contactCount: 0,
    updatedAt: null,
});
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

const load = async () => {
    setLoading(true);
    setErr("");
    try {
    const { data } = await api.get("/admin/stats");
    setStats(data || {});
    } catch (e) {
    console.error("Error loading dashboard stats:", e); 
    setErr(e?.response?.data?.error || "Không tải được thống kê.");
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    load();
}, []);

return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-xs text-zinc-400">
            {stats.updatedAt
            ? `Đã cập nhật: ${new Date(stats.updatedAt).toLocaleString()}`
            : "—"}
        </p>
        </div>
        <button
        onClick={load}
        className="rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-2 text-sm font-medium text-white hover:opacity-95"
        >
        Làm mới
        </button>
    </div>

    {err && (
        <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        {err}
        </div>
    )}

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
        title="Dự án"
        value={stats.videoProjeckCount}
        hint="Tổng số video dự án"
        loading={loading}
        accent="from-rose-500/40 to-orange-500/40"
        chip="Showreel"
        icon={<IconCamera className="h-5 w-5" />}
        />
        <StatCard
        title="Danh mục"
        value={stats.categoryCount}
        hint="Tổng số danh mục"
        loading={loading}
        accent="from-sky-500/40 to-cyan-400/40"
        chip="Taxonomy"
        icon={<IconTags className="h-5 w-5" />}
        />
        <StatCard
        title="Hậu trường"
        value={stats.backstageCount}
        hint="Ảnh/Album hậu trường"
        loading={loading}
        accent="from-violet-500/40 to-fuchsia-500/40"
        chip="BTS"
        icon={<IconClap className="h-5 w-5" />}
        />
        <StatCard
        title="Liên hệ"
        value={stats.contactCount}
        hint="Form liên hệ / subscribe"
        loading={loading}
        accent="from-emerald-500/40 to-teal-400/40"
        chip="Leads"
        icon={<IconInbox className="h-5 w-5" />}
        />
    </div>

    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl"
        />
        <h2 className="text-lg font-semibold">Hoạt động gần đây</h2>
        <p className="mt-2 text-sm text-zinc-300">
        (Bạn có thể hiển thị log cập nhật gần đây hoặc biểu đồ nhỏ tại đây.)
        </p>
    </div>
    </div>
);
}

function StatCard({ title, value, hint, loading, accent, chip, icon }) {
return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
    <div
        aria-hidden
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${accent} blur-2xl`}
    />
    <div className="flex items-start justify-between">
        <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/80">
        {icon}
        </div>
        {chip && (
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-300">
            {chip}
        </span>
        )}
    </div>

    <p className="mt-3 text-sm text-zinc-400">{title}</p>
    {loading ? (
        <div className="mt-2 h-9 w-24 animate-pulse rounded bg-white/10" />
    ) : (
        <p className="mt-2 text-4xl font-semibold">{Number(value || 0)}</p>
    )}
    <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
);
}

function IconCamera(props) {
return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M9 4h6l1.2 2H20a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a2 2 0 0 1 2-2h3L9 4Zm3 4.5a5.5 5.5 0 1 0 .001 11.001A5.5 5.5 0 0 0 12 8.5Zm0 2a3.5 3.5 0 1 1 0 7.001 3.5 3.5 0 0 1 0-7Z" />
    </svg>
);
}
function IconTags(props) {
return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M10.4 3.3 4.6 9.1a1 1 0 0 0-.3.7V19a2 2 0 0 0 2 2h9.2a1 1 0 0 0 .7-.3l5.8-5.8a2 2 0 0 0 0-2.8l-7.2-7.2a2 2 0 0 0-2.8 0Z" />
    <circle cx="8" cy="12" r="1.3" />
    </svg>
);
}
function IconClap(props) {
return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4 17c2.2 3.3 6.6 4.1 9.8 1.9 1.5-1 2.6-2.6 3-4.4L22 12l-5-3-.9-2.3c-.1-.4-.5-.7-.9-.7H8.8c-.4 0-.8.3-.9.7L7 9 2 12l2 1.2V17Z" />
    </svg>
);
}
function IconInbox(props) {
return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9.4a3.6 3.6 0 0 1-3.6 3.6H6.6A3.6 3.6 0 0 1 3 15.4V6Zm3 7v.4c0 .9.7 1.6 1.6 1.6h8.8c.9 0 1.6-.7 1.6-1.6V13h-3.1a3 3 0 0 1-2.8 2h-2a3 3 0 0 1-2.8-2H6Z" />
    </svg>
);
}
