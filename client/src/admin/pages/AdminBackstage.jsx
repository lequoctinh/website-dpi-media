
import React, { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";            
import toast, { Toaster } from "react-hot-toast";


const API_BASE   = (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || API_BASE.replace(/\/api$/, "")).replace(/\/+$/, "");


const toImgUrl = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p) || p.startsWith("//")) return p;
return `${ASSET_BASE}${p}`;
};

export default function AdminBackstage() {
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

const [editing, setEditing] = useState(null); 
const nameRef = useRef(null);
const fileRef = useRef(null);

const [preview, setPreview] = useState("");  
const [submitting, setSubmitting] = useState(false);


const [page, setPage] = useState(1);
const [perPage, setPerPage] = useState(12);
const totalPages = Math.max(1, Math.ceil(items.length / perPage));
const startIdx = (page - 1) * perPage;
const endIdx = startIdx + perPage;
const pagedItems = items.slice(startIdx, endIdx);


useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
}, [items.length, perPage, totalPages]); // eslint-disable-line


const load = async () => {
    setLoading(true);
    setErr("");
    try {
    const { data } = await api.get("/backstage");
    setItems(Array.isArray(data) ? data : []);
    } catch (e) {
    console.error("Load backstage error:", e);
    setErr(e?.response?.data?.error || "Không tải được dữ liệu hậu kỳ.");
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    load();
}, []);

// ------- FORM HANDLERS -------
const resetForm = () => {
    setEditing(null);
    setPreview("");
    if (nameRef.current) nameRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
};

const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
    setPreview(editing ? toImgUrl(editing.img) : "");
    return;
    }
    setPreview(URL.createObjectURL(f));
};

const onEdit = (row) => {
    setEditing(row);
    if (nameRef.current) nameRef.current.value = row.name || "";
    if (fileRef.current) fileRef.current.value = "";
    setPreview(toImgUrl(row.img));
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const onDelete = async (row) => {
    if (!window.confirm(`Xoá ảnh hậu kỳ "${row.name}"?`)) return;
    try {
    await api.delete(`/backstage/${row.id}`); 
    toast.success("Đã xoá!");
    setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
    console.error("Delete backstage error:", e);
    toast.error(e?.response?.data?.error || "Xoá thất bại!");
    }
};

const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const name = nameRef.current?.value?.trim();
    if (!name) {
    toast.error("Tên không được để trống");
    return;
    }

    const form = new FormData();
    form.append("name", name);

    const file = fileRef.current?.files?.[0];
    if (file) {

    form.append("img", file);
    }

    try {
    setSubmitting(true);

    if (editing) {

        await api.put(`/backstage/${editing.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật thành công!");
    } else {
    
        await api.post("/backstage", form, {
        headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm mới thành công!");
    }


    setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
    console.error("Submit backstage error:", e);
    toast.error(e?.response?.data?.error || "Lưu thất bại!");
    } finally {
    setSubmitting(false);
    }
};

// --- UI helpers ---
const goPrev = () => setPage((p) => Math.max(1, p - 1));
const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

return (
    <div className="space-y-6">
    <Toaster position="top-right" />

    {/* Header */}
    <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-semibold text-white">Hậu trường</h1>
        <p className="mt-1 text-sm text-zinc-400">
            Quản lý ảnh hậu kỳ (behind-the-scenes): thêm, sửa, xoá.
        </p>
        </div>

        {/* Per page */}
        <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-400">Hiển thị:</label>
        <select
            value={perPage}
            onChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(1);
            }}
            className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            {[8, 12, 16, 24, 36].map((n) => (
            <option key={n} value={n}>
                {n}/trang
            </option>
            ))}
        </select>
        </div>
    </div>

    {/* Form create/update */}
    <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
    >
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
            <label className="block">
            <span className="text-sm text-zinc-300">Tên ảnh / chú thích</span>
            <input
                ref={nameRef}
                type="text"
                placeholder="VD: Hậu trường TVC - Cảnh quay ống kính 50mm"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-brand"
            />
            </label>

            <label className="block">
            <span className="text-sm text-zinc-300">Ảnh (JPG/PNG)</span>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="mt-1 w-full cursor-pointer rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
            />
            <p className="mt-1 text-xs text-zinc-500">
                {editing
                ? "Đang sửa: có thể bỏ qua nếu không muốn thay ảnh."
                : "Chọn 1 ảnh để tải lên."}
            </p>
            </label>
        </div>

        <div className="space-y-2">
            <span className="text-sm text-zinc-300">Xem trước</span>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {preview ? (
                <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                Chưa có ảnh xem trước
                </div>
            )}
            </div>

            <div className="flex gap-2 pt-1">
            <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
                {submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm mới"}
            </button>
            {editing ? (
                <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-zinc-500 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                Huỷ
                </button>
            ) : (
                <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-zinc-500 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                Xoá form
                </button>
            )}
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
        ) : items.length === 0 ? (
        <div className="p-4 text-sm text-zinc-400">Chưa có ảnh hậu kỳ nào</div>
        ) : (
        <>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pagedItems.map((it) => (
                <article
                key={it.id}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                <div className="relative aspect-[16/9]">
                    <img
                    src={toImgUrl(it.img)}
                    alt={it.name || `Backstage ${it.id}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                    />
                </div>
                <div className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                        {it.name || "(Không tên)"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">ID: {it.id}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                    <button
                        onClick={() => onEdit(it)}
                        className="rounded-md border border-zinc-500 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={() => onDelete(it)}
                        className="rounded-md border border-red-500 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
                    >
                        Xoá
                    </button>
                    </div>
                </div>
                </article>
            ))}
            </div>

            <div className="flex flex-col items-center gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:justify-between">
            <div className="text-xs text-zinc-400">
                Đang hiển thị{" "}
                <span className="text-zinc-200">
                {items.length === 0 ? 0 : startIdx + 1}–{Math.min(endIdx, items.length)}
                </span>{" "}
                trong tổng số <span className="text-zinc-200">{items.length}</span> ảnh
            </div>

            <div className="flex items-center gap-2">
                <button
                onClick={goPrev}
                disabled={page <= 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                >
                Trước
                </button>

                <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
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
                {totalPages > 7 && (
                    <span className="px-1 text-sm text-zinc-400">… {totalPages}</span>
                )}
                </div>

                <button
                onClick={goNext}
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
