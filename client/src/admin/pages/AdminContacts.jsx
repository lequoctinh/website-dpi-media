import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import toast, { Toaster } from "react-hot-toast";

const SOURCE_OPTIONS = [
{ value: "", label: "Tất cả nguồn" },
{ value: "site", label: "Site (liên hệ thường)" },
{ value: "subscribe", label: "Subscribe" },
{ value: "quote", label: "Báo giá" },
];

export default function AdminContacts() {
const [q, setQ] = useState("");
const [source, setSource] = useState("");
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(12);
const [total, setTotal] = useState(0);
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
);

const load = async () => {
    setLoading(true);
    setErr("");
    try {
    const { data } = await api.get("/admin/contacts", {
        params: { q, source, page, pageSize },
    });
    setItems(data.items || []);
    setTotal(data.total || 0);
    } catch (e) {
    console.error("Load contacts error:", e);
    setErr(e?.response?.data?.error || "Không tải được liên hệ");
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [q, source, page, pageSize]);

const onDelete = async (id) => {
    if (!confirm("Xoá liên hệ này?")) return;
    try {
    await api.delete(`/admin/contacts/${id}`);
    toast.success("Đã xoá!");
    // Tải lại page hiện tại:
    load();
    } catch (e) {
    console.error("Delete contact error:", e);
    toast.error(e?.response?.data?.error || "Xoá thất bại");
    }
};

const resetFilter = () => {
    setQ("");
    setSource("");
    setPage(1);
};

return (
    <div className="space-y-6">
    <Toaster position="top-right" />

    <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-semibold text-white">Liên hệ</h1>
        <p className="mt-1 text-sm text-zinc-400">
            Dữ liệu từ form Subscribe/Báo giá/Contact.
        </p>
        </div>
        <div className="flex items-center gap-2">
        <button
            onClick={load}
            className="rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-2 text-sm font-medium text-white hover:opacity-95"
        >
            Làm mới
        </button>
        </div>
    </div>

    {/* Filters */}
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-zinc-400" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L19 20.5l1.5-1.5-5-5zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z" />
            </svg>
            <input
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value); }}
                placeholder="Tìm theo tên, email, nội dung…"
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
            </div>
        </div>

        <SelectDark
            value={source}
            onChange={(e) => { setPage(1); setSource(e.target.value); }}
            options={SOURCE_OPTIONS}
        />

        <SelectDark
            value={pageSize}
            onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
            options={[
            { value: 12, label: "12/trang" },
            { value: 24, label: "24/trang" },
            { value: 48, label: "48/trang" },
            ]}
        />

        <button
            onClick={resetFilter}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
        >
            Xoá lọc
        </button>
        </div>
    </div>

    {/* List */}
    <div className="rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
        <div className="p-4 text-sm text-zinc-400">Đang tải…</div>
        ) : err ? (
        <div className="p-4 text-sm text-rose-400">{err}</div>
        ) : items.length === 0 ? (
        <div className="p-4 text-sm text-zinc-400">Chưa có liên hệ nào</div>
        ) : (
        <table className="min-w-full text-sm text-white/90">
            <thead className="bg-white/10 text-zinc-300">
            <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Tên</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Nguồn</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Thời gian</th>
                <th className="px-4 py-3 text-left">Nội dung</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {items.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                <td className="px-4 py-2">{c.id}</td>
                <td className="px-4 py-2">{c.name || "-"}</td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-wider">
                    {c.source}
                    </span>
                </td>
                <td className="px-4 py-2">{c.ip || "-"}</td>
                <td className="px-4 py-2">
                    {new Date(c.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 max-w-[320px]">
                    <p className="line-clamp-2 text-zinc-300">{c.message || "-"}</p>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                    <button
                    onClick={async () => {
                        try {
                        const { data } = await api.get(`/admin/contacts/${c.id}`);
                        alert(
                            `#${data.id} — ${data.email}\nNguồn: ${data.source}\nIP: ${data.ip || "-"}\nThời gian: ${new Date(data.created_at).toLocaleString()}\n----------------\n${data.message || "-"}`
                        );
                        } catch (e) {
                        toast.error("Không lấy được chi tiết");
                        }
                    }}
                    className="rounded-md border border-zinc-500 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                    >
                    Xem
                    </button>
                    <button
                    onClick={() => onDelete(c.id)}
                    className="rounded-md border border-red-500 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
                    >
                    Xoá
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        )}
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">
        Tổng: <b className="text-white">{total}</b> liên hệ
        </span>
        <div className="flex items-center gap-2">
        <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-200 disabled:opacity-40"
        >
            Trước
        </button>
        <span className="min-w-[90px] text-center text-zinc-300">
            Trang {page}/{totalPages}
        </span>
        <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-200 disabled:opacity-40"
        >
            Sau
        </button>
        </div>
    </div>
    </div>
);
}

/** Select “dark” đồng bộ giao diện admin */
function SelectDark({ value, onChange, options }) {
return (
    <div className="relative">
    <select
        value={value}
        onChange={onChange}
        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 pr-8 text-sm text-white outline-none focus:ring-2 focus:ring-brand appearance-none"
    >
        {options.map((op) => (
        <option key={op.value} value={op.value} className="bg-zinc-900 text-white">
            {op.label}
        </option>
        ))}
    </select>
    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">
        ▾
    </span>
    </div>
);
}
