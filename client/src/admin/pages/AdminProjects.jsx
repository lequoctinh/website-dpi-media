// src/admin/pages/AdminProjects.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api"; // axios instance (baseURL = VITE_API_BASE)
import toast, { Toaster } from "react-hot-toast";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
const ASSET_BASE = (
import.meta.env.VITE_ASSET_BASE || API_BASE.replace(/\/api$/, "")
).replace(/\/+$/, "");
const PER_PAGE = 8;

const toImgUrl = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p) || p.startsWith("//")) return p;
return `${ASSET_BASE}${p}`;
};

function extractYoutubeId(url = "") {
try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
    if (m) return m[1];
} catch (err) {
    console.error("URL không hợp lệ:", err);
    return null;
}
// nếu chỉ dán đúng id
if (/^[a-zA-Z0-9_-]{6,}$/.test(url)) return url;
return "";
}

export default function AdminProjects() {
const [categories, setCategories] = useState([]);
const [list, setList] = useState([]);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

const [categoryId, setCategoryId] = useState("");
const [query, setQuery] = useState("");
const [page, setPage] = useState(1);

const [editing, setEditing] = useState(null);
const titleRef = useRef(null);
const urlRef = useRef(null);
const videoIdRef = useRef(null);
const catRef = useRef(null);
const posterRef = useRef(null);
const [preview, setPreview] = useState("");
const [featured, setFeatured] = useState(false); // 🔥 video nổi bật
const [submitting, setSubmitting] = useState(false);

const loadCategories = async () => {
    const { data } = await api.get("/category");
    setCategories(Array.isArray(data) ? data : []);
};

const loadList = async () => {
    setLoading(true);
    setErr("");
    try {
    const { data } = await api.get("/video-projeck", {
        params: categoryId ? { category_id: categoryId } : {},
    });
    setList(Array.isArray(data) ? data : []);
    } catch (e) {
    console.error(e);
    setErr(e?.response?.data?.error || "Không tải được danh sách dự án.");
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    loadCategories().finally(loadList);
}, []);

useEffect(() => {
    setPage(1);
    loadList();
}, [categoryId]);

const resetForm = () => {
    setEditing(null);
    setPreview("");
    setFeatured(false);
    [titleRef, urlRef, videoIdRef, catRef, posterRef].forEach(
    (r) => r.current && (r.current.value = "")
    );
};

const onChangeUrl = () => {
    const val = urlRef.current?.value || "";
    const id = extractYoutubeId(val);
    if (id && videoIdRef.current) videoIdRef.current.value = id;
};

const onPickPoster = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
    setPreview(editing?.poster ? toImgUrl(editing.poster) : "");
    return;
    }
    setPreview(URL.createObjectURL(f));
};

const onEdit = (row) => {
    setEditing(row);
    if (titleRef.current) titleRef.current.value = row.title || "";
    if (urlRef.current) urlRef.current.value = row.youtube_url || "";
    if (videoIdRef.current)
    videoIdRef.current.value =
        row.video_id || extractYoutubeId(row.youtube_url || "");
    if (catRef.current) catRef.current.value = String(row.category_id || "");
    if (posterRef.current) posterRef.current.value = "";
    setPreview(row.poster ? toImgUrl(row.poster) : "");
    setFeatured(!!row.featured); // lấy trạng thái nổi bật
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const uploadPoster = async (file) => {
    const fd = new FormData();
    fd.append("poster", file);
    const { data } = await api.post("/upload-poster", fd);
    return data.posterPath;
};

const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const title = (titleRef.current?.value || "").trim();
    const youtube_url = (urlRef.current?.value || "").trim();
    let video_id = (videoIdRef.current?.value || "").trim();
    const cat = catRef.current?.value ? Number(catRef.current.value) : null;
    const file = posterRef.current?.files?.[0];

    if (!title) return toast.error("Vui lòng nhập tiêu đề.");
    if (!youtube_url) return toast.error("Vui lòng nhập URL Youtube.");
    if (!video_id) {
    video_id = extractYoutubeId(youtube_url);
    if (!video_id) return toast.error("Không tìm thấy video_id hợp lệ.");
    }
    if (!cat) return toast.error("Vui lòng chọn danh mục.");

    try {
    setSubmitting(true);

    let posterPath = editing?.poster || "";
    if (file) {
        posterPath = await uploadPoster(file);
    } else if (!editing && !posterPath) {
        return toast.error("Vui lòng chọn poster.");
    }

    const payload = {
        title,
        youtube_url,
        video_id,
        poster: posterPath,
        category_id: cat,
        featured, // gửi trạng thái nổi bật
    };

    if (editing) {
        await api.put(`/video-projeck/${editing.id}`, payload);
        toast.success("Cập nhật dự án thành công!");
    } else {
        await api.post("/video-projeck", payload);
        toast.success("Tạo dự án thành công!");
    }

    setTimeout(() => window.location.reload(), 1200);
    } catch (er) {
    console.error(er);
    toast.error(er?.response?.data?.error || "Lưu thất bại!");
    } finally {
    setSubmitting(false);
    }
};

const onDelete = async (row) => {
    if (!window.confirm(`Xoá dự án "${row.title}"?`)) return;
    try {
    await api.delete(`/video-projeck/${row.id}`);
    toast.success("Đã xoá!");
    setTimeout(() => window.location.reload(), 1000);
    } catch (er) {
    console.error(er);
    toast.error(er?.response?.data?.error || "Xoá thất bại!");
    }
};

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

const catName = (id) =>
    categories.find((c) => String(c.id) === String(id))?.name || "—";

return (
    <div className="space-y-6">
    <Toaster position="top-right" />

    {/* Header + filter */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <h1 className="text-2xl font-semibold text-white">Quản lý Dự án</h1>
        <p className="mt-1 text-sm text-zinc-400">
            Tạo / cập nhật các video dự án (poster, liên kết YouTube, danh
            mục, đánh dấu video nổi bật).
        </p>
        </div>

        <div className="flex flex-wrap gap-2">
        <input
            value={query}
            onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
            }}
            placeholder="Tìm nhanh theo tiêu đề…"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none"
        />
        <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50"
        >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
            <option key={c.id} value={c.id}>
                {c.name}
            </option>
            ))}
        </select>
        </div>
    </div>

    {/* Form */}
    <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
    >
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
            <label className="block">
            <span className="text-sm text-zinc-300">Tiêu đề</span>
            <input
                ref={titleRef}
                type="text"
                placeholder="VD: Tennis Highlight"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-brand"
            />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
                <span className="text-sm text-zinc-300">YouTube URL</span>
                <input
                ref={urlRef}
                onBlur={onChangeUrl}
                type="text"
                placeholder="https://www.youtube.com/watch?v=xxxx"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-brand"
                />
            </label>
            <label className="block">
                <span className="text-sm text-zinc-300">Video ID</span>
                <input
                ref={videoIdRef}
                type="text"
                placeholder="ID tự điền từ URL (có thể sửa)"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-brand"
                />
            </label>
            </div>

            <label className="block">
            <span className="text-sm text-zinc-300">Danh mục</span>
            <select
                ref={catRef}
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-2 focus:ring-brand"
            >
                <option value="" disabled>
                Chọn danh mục…
                </option>
                {categories.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.name}
                </option>
                ))}
            </select>
            </label>

            <label className="block">
            <span className="text-sm text-zinc-300">Poster (JPG/PNG/WebP)</span>
            <input
                ref={posterRef}
                type="file"
                accept="image/*"
                onChange={onPickPoster}
                className="mt-1 w-full cursor-pointer rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
            />
            <p className="mt-1 text-xs text-zinc-500">
                {editing
                ? "Đang sửa: có thể bỏ qua nếu không muốn thay poster."
                : "Chọn poster cho dự án."}
            </p>
            </label>

            {/* Featured checkbox */}
            <label className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
            <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-white/40 bg-black/40"
            />
            Đặt video này là <span className="font-semibold text-amber-300">Nổi bật</span> (ưu tiên lên đầu danh sách)
            </label>
        </div>

        <div className="space-y-2">
            <span className="text-sm text-zinc-300">Xem trước poster</span>
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
        ) : filtered.length === 0 ? (
        <div className="p-4 text-sm text-zinc-400">Không có dự án nào</div>
        ) : (
        <>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paged.map((v) => (
                <article
                key={v.id}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                <div className="relative aspect-[16/9]">
                    <img
                    src={toImgUrl(v.poster)}
                    alt={v.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                    />
                    {v.featured ? (
                    <span className="absolute left-2 top-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-semibold text-black shadow">
                        NỔI BẬT
                    </span>
                    ) : null}
                </div>
                <div className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                        {v.title}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                        Danh mục: {catName(v.category_id)}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">ID: {v.id}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                    <a
                        href={v.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-sky-500/60 px-2 py-1 text-xs text-sky-300 hover:bg-sky-500/20"
                    >
                        Xem
                    </a>
                    <button
                        onClick={() => onEdit(v)}
                        className="rounded-md border border-zinc-500 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={() => onDelete(v)}
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
                {filtered.length === 0
                    ? 0
                    : start + 1}
                –
                {Math.min(start + PER_PAGE, filtered.length)}
                </span>{" "}
                /{" "}
                <span className="text-zinc-200">{filtered.length}</span> dự án
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
                {Array.from({ length: Math.min(7, totalPages) }).map(
                    (_, i) => {
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
                    }
                )}
                {totalPages > 7 && (
                    <span className="px-1 text-sm text-zinc-400">
                    … {totalPages}
                    </span>
                )}
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
