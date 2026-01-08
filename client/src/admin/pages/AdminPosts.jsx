import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import toast, { Toaster } from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || API_BASE.replace(/\/api$/, "")).replace(/\/+$/, "");
const PER_PAGE = 8;

const toImgUrl = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p) || p.startsWith("//")) return p;
return `${ASSET_BASE}${p}`;
};

export default function AdminPosts() {
const [list, setList] = useState([]);
const [categories, setCategories] = useState([]); 
const [loading, setLoading] = useState(true);
const [query, setQuery] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [page, setPage] = useState(1);


const [editing, setEditing] = useState(null);
const [content, setContent] = useState("");
const [preview, setPreview] = useState("");
const [submitting, setSubmitting] = useState(false);


const titleRef = useRef(null);
const excerptRef = useRef(null);
const authorRef = useRef(null);
const statusRef = useRef(null);
const categoryRef = useRef(null);
const featuredRef = useRef(null);
const metaRef = useRef(null);
const fileRef = useRef(null);

const loadData = async () => {
    setLoading(true);
    try {
    const [postRes, catRes] = await Promise.all([
        api.get("/bai-viet", { params: { status: statusFilter || undefined, limit: 500 } }),
        api.get("/category"),
    ]);
    setList(Array.isArray(postRes.data?.data) ? postRes.data.data : []);
    setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (e) {
    toast.error("Không tải được dữ liệu.");
    } finally {
    setLoading(false);
    }
};

useEffect(() => { loadData(); }, [statusFilter]);

const resetForm = () => {
    setEditing(null);
    setContent("");
    setPreview("");
    [titleRef, excerptRef, authorRef, metaRef].forEach((r) => r.current && (r.current.value = ""));
    if (statusRef.current) statusRef.current.value = "nhap";
    if (categoryRef.current) categoryRef.current.value = "";
    if (featuredRef.current) featuredRef.current.checked = false;
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const onEdit = (row) => {
    setEditing(row);
    setContent(row.content || "");
    setPreview(row.thumbnail ? toImgUrl(row.thumbnail) : "");
    
    if (titleRef.current) titleRef.current.value = row.title || "";
    if (excerptRef.current) excerptRef.current.value = row.excerpt || "";
    if (authorRef.current) authorRef.current.value = row.author || "";
    if (statusRef.current) statusRef.current.value = row.status || "nhap";
    if (categoryRef.current) categoryRef.current.value = row.categoryId || "";
    if (featuredRef.current) featuredRef.current.checked = !!row.isFeatured;
    if (metaRef.current) metaRef.current.value = row.metaDescription || "";
    
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const tieu_de = titleRef.current?.value.trim();
    if (!tieu_de) return toast.error("Vui lòng nhập tiêu đề.");

    try {
    setSubmitting(true);
    const fd = new FormData();
    fd.append("tieu_de", tieu_de);
    fd.append("mo_ta_ngan", excerptRef.current?.value || "");
    fd.append("noi_dung", content); 
    fd.append("tac_gia", authorRef.current?.value || "");
    fd.append("trang_thai", statusRef.current?.value || "nhap");
    fd.append("category_id", categoryRef.current?.value || "");
    fd.append("is_featured", featuredRef.current?.checked ? 1 : 0);
    fd.append("meta_description", metaRef.current?.value || "");
    
    const file = fileRef.current?.files?.[0];
    if (file) fd.append("hinh_anh", file);

    if (editing) {
        await api.put(`/bai-viet/${editing.id}`, fd);
        toast.success("Cập nhật thành công!");
    } else {
        await api.post(`/bai-viet`, fd);
        toast.success("Tạo bài viết thành công!");
    }
    resetForm();
    loadData();
    } catch (er) {
    toast.error(er?.response?.data?.message || "Lỗi lưu dữ liệu");
    } finally {
    setSubmitting(false);
    }
};

const quillModules = {
    toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "video"],
    ["clean"],
    ],
};

const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((v) => (v.title || "").toLowerCase().includes(q));
}, [list, query]);

const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

return (
    <div className="space-y-6 pb-10">
    <Toaster position="top-right" />

    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <h1 className="text-2xl font-bold text-white">Biên tập Nội dung</h1>
        <p className="text-sm text-zinc-400">Quản lý tin tức, bài viết chuyên môn và SEO.</p>
        </div>
        <div className="flex gap-2">
        <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Tìm theo tiêu đề..."
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:ring-2 ring-brand/50"
        />
        </div>
    </div>

    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5 bg-zinc-900/50 p-6 rounded-2xl border border-white/10">
        <label className="block">
            <span className="text-sm font-medium text-zinc-400">Tiêu đề bài viết</span>
            <input
            ref={titleRef}
            type="text"
            placeholder="Nhập tiêu đề hấp dẫn..."
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-lg font-semibold text-white outline-none focus:border-brand"
            />
        </label>

        <div className="space-y-1.5">
            <span className="text-sm font-medium text-zinc-400">Nội dung chi tiết</span>
            <div className="bg-white rounded-xl overflow-hidden min-h-[400px]">
            <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                className="text-black h-[350px]"
            />
            </div>
        </div>

        <label className="block pt-4">
            <span className="text-sm font-medium text-zinc-400">Mô tả ngắn (Hiển thị ở trang danh sách)</span>
            <textarea
            ref={excerptRef}
            rows={3}
            placeholder="Viết một đoạn ngắn dẫn dắt người xem..."
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
            />
        </label>
        </div>

        <div className="space-y-6">
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Thiết lập</h3>
            
            <label className="block">
            <span className="text-xs text-zinc-400">Chuyên mục</span>
            <select ref={categoryRef} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none">
                <option value="">Chọn chuyên mục...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            </label>

            <label className="block">
            <span className="text-xs text-zinc-400">Trạng thái</span>
            <select ref={statusRef} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none">
                <option value="nhap">Bản nháp</option>
                <option value="xuat_ban">Xuất bản</option>
            </select>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition">
            <input type="checkbox" ref={featuredRef} className="w-5 h-5 accent-brand" />
            <span className="text-sm text-zinc-300">Bài viết nổi bật</span>
            </label>

            <div className="flex gap-2 pt-2">
            <div className="flex gap-3 pt-2">
            <button
                type="submit"
                disabled={submitting}
                className="
                flex-1 rounded-xl py-3 text-sm font-bold text-white
                bg-gradient-to-r from-rose-500 to-orange-500
                shadow-[0_4px_15px_rgba(244,63,94,0.3)]
                ring-1 ring-white/10
                transition-all duration-300
                hover:shadow-[0_6px_20px_rgba(244,63,94,0.4)]
                hover:scale-[1.02] active:scale-95
                disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
                "
            >
                {submitting ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    ĐANG XỬ LÝ...
                </span>
                ) : editing ? (
                "CẬP NHẬT NGAY"
                ) : (
                "ĐĂNG BÀI VIẾT"
                )}
            </button>
            <button
                type="button"
                onClick={resetForm} 
                className="
                rounded-xl border border-white/10 bg-white/5 
                px-6 py-3 text-sm font-bold text-zinc-400 
                transition-all duration-300
                hover:bg-white/10 hover:text-white
                active:scale-95
                "
            >
                HỦY
            </button>
            </div>
            </div>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Hình ảnh & SEO</h3>
            
            <div className="space-y-2">
            <span className="text-xs text-zinc-400">Ảnh đại diện</span>
            <div className="group relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-white/10 bg-black/20">
                {preview ? (
                <img src={preview} className="h-full w-full object-cover" />
                ) : (
                <div className="flex h-full flex-col items-center justify-center text-xs text-zinc-500">
                    <p>Chưa có ảnh</p>
                </div>
                )}
                <input
                type="file"
                ref={fileRef}
                accept="image/*"
                onChange={(e) => setPreview(URL.createObjectURL(e.target.files[0]))}
                className="absolute inset-0 cursor-pointer opacity-0"
                />
            </div>
            </div>

            <label className="block">
            <span className="text-xs text-zinc-400">Tác giả</span>
            <input ref={authorRef} type="text" className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white" />
            </label>

            <label className="block">
            <span className="text-xs text-zinc-400">SEO Description (Thẻ meta)</span>
            <textarea
                ref={metaRef}
                rows={3}
                placeholder="Mô tả cho Google..."
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none"
            />
            </label>
        </div>
        </div>
    </form>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-4 text-lg font-bold text-white">Danh sách bài viết</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {paged.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 group">
            <div className="relative aspect-video">
                <img src={toImgUrl(r.thumbnail)} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" />
                {r.isFeatured ? (
                <span className="absolute top-2 left-2 bg-brand text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-lg">NỔI BẬT</span>
                ) : null}
            </div>
            <div className="p-3">
                <h4 className="truncate text-sm font-bold text-white">{r.title}</h4>
                <p className="mt-1 text-[10px] text-zinc-500">
                {r.categoryName || "Chưa phân loại"} • {r.status === 'xuat_ban' ? 'Đã đăng' : 'Bản nháp'}
                </p>
                <div className="mt-3 flex gap-2">
                <button onClick={() => onEdit(r)} className="flex-1 rounded-md bg-white/10 py-1.5 text-[10px] text-white hover:bg-white/20">Sửa</button>
                <button onClick={() => { if(window.confirm("Xóa bài viết này?")) api.delete(`/bai-viet/${r.id}`).then(loadData) }} className="rounded-md bg-rose-500/10 px-3 py-1.5 text-[10px] text-rose-500 hover:bg-rose-500/20">Xóa</button>
                </div>
            </div>
            </div>
        ))}
        </div>
        
        <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
            <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`h-8 w-8 rounded-lg text-xs ${page === i + 1 ? 'bg-brand text-white' : 'bg-white/5 text-zinc-400'}`}
            >
            {i + 1}
            </button>
        ))}
        </div>
    </div>
    </div>
);
}