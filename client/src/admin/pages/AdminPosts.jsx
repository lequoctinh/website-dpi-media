// FILE: src/admin/pages/AdminPosts.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import toast, { Toaster } from "react-hot-toast";

const API_BASE   = (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || API_BASE.replace(/\/api$/, "")).replace(/\/+$/, "");
const PER_PAGE = 8;

const toImgUrl = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p) || p.startsWith("//")) return p;
return `${ASSET_BASE}${p}`;
};

export default function AdminPosts() {
// ===== List state =====
const [list, setList] = useState([]);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

// ===== Filters / paging =====
const [query, setQuery] = useState("");
const [statusFilter, setStatusFilter] = useState(""); // "", "xuat_ban", "nhap"
const [page, setPage] = useState(1);

// ===== Form state =====
const [editing, setEditing] = useState(null);
const titleRef   = useRef(null);
const excerptRef = useRef(null);
const contentRef = useRef(null);
const authorRef  = useRef(null);
const statusRef  = useRef(null);
const fileRef    = useRef(null);

const [preview, setPreview] = useState("");
const [submitting, setSubmitting] = useState(false);

// ===== Load list =====
const loadList = async () => {
    setLoading(true);
    setErr("");
    try {
    const { data } = await api.get("/bai-viet", {
        params: { status: statusFilter || undefined, limit: 200 },
    });
    setList(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
    console.error(e);
    setErr(e?.response?.data?.message || "Không tải được danh sách bài viết.");
    } finally {
    setLoading(false);
    }
};

useEffect(() => { loadList(); }, []);
useEffect(() => { setPage(1); loadList(); }, [statusFilter]);

// ===== Form helpers =====
const resetForm = () => {
    setEditing(null);
    setPreview("");
    [titleRef, excerptRef, contentRef, authorRef].forEach(r => r.current && (r.current.value = ""));
    if (statusRef.current) statusRef.current.value = "nhap";
    if (fileRef.current)   fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const onPickThumb = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
    setPreview(editing?.thumbnail ? toImgUrl(editing.thumbnail) : "");
    return;
    }
    setPreview(URL.createObjectURL(f));
};

const onEdit = (row) => {
    setEditing(row);
    if (titleRef.current)   titleRef.current.value   = row.title   || "";
    if (excerptRef.current) excerptRef.current.value = row.excerpt || "";
    if (contentRef.current) contentRef.current.value = row.content || "";
    if (authorRef.current)  authorRef.current.value  = row.author  || "";
    if (statusRef.current)  statusRef.current.value  = row.status  || "nhap";
    if (fileRef.current)    fileRef.current.value    = "";
    setPreview(row.thumbnail ? toImgUrl(row.thumbnail) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// ===== CRUD =====
const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const tieu_de    = (titleRef.current?.value || "").trim();
    const mo_ta_ngan = (excerptRef.current?.value || "").trim();
    const noi_dung   = (contentRef.current?.value || "").trim();
    const tac_gia    = (authorRef.current?.value || "").trim();
    const trang_thai = (statusRef.current?.value || "nhap").trim();
    const file       = fileRef.current?.files?.[0];

    if (!tieu_de) return toast.error("Vui lòng nhập tiêu đề.");

    try {
    setSubmitting(true);
    const fd = new FormData();
    fd.append("tieu_de", tieu_de);
    fd.append("mo_ta_ngan", mo_ta_ngan);
    fd.append("noi_dung", noi_dung);
    fd.append("tac_gia", tac_gia);
    fd.append("trang_thai", trang_thai);
    if (file) fd.append("hinh_anh", file);

    if (editing) {
        await api.put(`/bai-viet/${editing.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật bài viết thành công!");
    } else {
        await api.post(`/bai-viet`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Tạo bài viết thành công!");
    }
    resetForm();
    loadList();
    } catch (er) {
    console.error(er);
    toast.error(er?.response?.data?.message || "Lưu thất bại!");
    } finally {
    setSubmitting(false);
    }
};

const publish = async (row) => {
    try {
    await api.patch(`/bai-viet/${row.id}/publish`);
    toast.success("Đã xuất bản!");
    loadList();
    if (editing?.id === row.id && statusRef.current) statusRef.current.value = "xuat_ban";
    } catch (er) {
    console.error(er);
    toast.error("Xuất bản thất bại!");
    }
};

const onDelete = async (row) => {
    if (!window.confirm(`Xoá bài viết "${row.title}"?`)) return;
    try {
    await api.delete(`/bai-viet/${row.id}`);
    toast.success("Đã xoá!");
    if (editing?.id === row.id) resetForm();
    loadList();
    } catch (er) {
    console.error(er);
    toast.error(er?.response?.data?.message || "Xoá thất bại!");
    }
};

// ===== Search + paging =====
const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((v) => (v.title || "").toLowerCase().includes(q));
}, [list, query]);

const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
const start = (page - 1) * PER_PAGE;
const paged = filtered.slice(start, start + PER_PAGE);

useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
}, [filtered.length, totalPages]);

return (
    <div className="space-y-6">
    <Toaster position="top-right" />

    {/* Header + search + filter */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <h1 className="text-2xl font-semibold text-white">Quản lý Bài viết</h1>
        <p className="mt-1 text-sm text-zinc-400">Tạo / cập nhật tin tức & hoạt động công ty.</p>
        </div>

        <div className="flex flex-wrap gap-2">
        <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Tìm nhanh theo tiêu đề…"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none"
        />
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
        >
            <option value="">Tất cả trạng thái</option>
            <option value="xuat_ban">Xuất bản</option>
            <option value="nhap">Nháp</option>
        </select>
        </div>
    </div>

    {/* Form create/update */}
    <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
            <label className="block">
            <span className="text-sm text-zinc-300">Tiêu đề</span>
            <input
                ref={titleRef}
                type="text"
                placeholder="VD: DPI Media giành giải ..."
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-brand"
            />
            </label>

            <label className="block">
            <span className="text-sm text-zinc-300">Mô tả ngắn</span>
            <textarea
                ref={excerptRef}
                rows={3}
                placeholder="Tóm tắt ngắn của bài viết…"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none"
            />
            </label>

            <label className="block">
            <span className="text-sm text-zinc-300">Nội dung (HTML)</span>
            <textarea
                ref={contentRef}
                rows={10}
                placeholder="<p>Nội dung...</p>"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none"
            />
            </label>
        </div>

        <div className="space-y-3">
            <label className="block">
            <span className="text-sm text-zinc-300">Tác giả</span>
            <input
                ref={authorRef}
                type="text"
                placeholder="VD: DPI Team"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none"
            />
            </label>

            <label className="block">
            <span className="text-sm text-zinc-300">Trạng thái</span>
            <select
                ref={statusRef}
                defaultValue="nhap"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none"
            >
                <option value="nhap">Nháp</option>
                <option value="xuat_ban">Xuất bản</option>
            </select>
            </label>

            <label className="block">
            <span className="text-sm text-zinc-300">Ảnh đại diện</span>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickThumb}
                className="mt-1 w-full cursor-pointer rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
            />
            <p className="mt-1 text-xs text-zinc-500">
                {editing ? "Đang sửa: có thể bỏ qua nếu không muốn thay ảnh." : "Chọn ảnh cho bài viết."}
            </p>
            </label>

            <div className="space-y-2">
            <span className="text-sm text-zinc-300">Xem trước ảnh</span>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                    Chưa có ảnh xem trước
                </div>
                )}
            </div>
            </div>

            <div className="flex gap-2 pt-1">
            <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
                {submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm mới"}
            </button>
            <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-zinc-500 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
                {editing ? "Huỷ" : "Xoá form"}
            </button>
            </div>
        </div>
        </div>
    </form>

    {/* List */}
    <div className="rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
        <div className="p-4 text-sm text-zinc-400">Đang tải...</div>
        ) : err ? (
        <div className="p-4 text-sm text-rose-400">{err}</div>
        ) : filtered.length === 0 ? (
        <div className="p-4 text-sm text-zinc-400">Chưa có bài viết</div>
        ) : (
        <>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paged.map((r) => (
                <article key={r.id} className="group overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <div className="relative aspect-[16/9]">
                    {r.thumbnail ? (
                    <img
                        src={toImgUrl(r.thumbnail)}
                        alt={r.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                    />
                    ) : (
                    <div className="h-full w-full bg-white/5" />
                    )}
                </div>
                <div className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{r.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">{r.excerpt}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        {r.status === "xuat_ban" ? "Xuất bản" : "Nháp"} •{" "}
                        {r.published_at ? new Date(r.published_at).toLocaleDateString("vi-VN") : "—"} • 👁 {r.views ?? 0}
                    </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                        onClick={() => onEdit(r)}
                        className="rounded-md border border-zinc-500 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                    >
                        Sửa
                    </button>
                    {r.status !== "xuat_ban" && (
                        <button
                        onClick={() => publish(r)}
                        className="rounded-md border border-sky-500/60 px-2 py-1 text-xs text-sky-300 hover:bg-sky-500/20"
                        >
                        Xuất bản
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(r)}
                        className="rounded-md border border-red-500 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
                    >
                        Xoá
                    </button>
                    </div>
                </div>
                </article>
            ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:justify-between">
            <div className="text-xs text-zinc-400">
                Đang hiển thị{" "}
                <span className="text-zinc-200">
                {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PER_PAGE, filtered.length)}
                </span>{" "}
                / <span className="text-zinc-200">{filtered.length}</span> bài viết
            </div>

            <div className="flex items-center gap-2">
                <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                >
                Trước
                </button>

                <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }).map((_, i) => {
                    const p = i + 1;
                    const active = p === page;
                    return (
                    <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-8 w-8 rounded-md border text-sm ${
                        active
                            ? "border-white/20 bg-white/20 text-white"
                            : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                        }`}
                    >
                        {p}
                    </button>
                    );
                })}
                {totalPages > 7 && <span className="px-1 text-sm text-zinc-400">… {totalPages}</span>}
                </div>

                <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                >
                Tiếp
                </button>
            </div>
            </div>
        </>
        )}
    </div>
    </div>
);
}
