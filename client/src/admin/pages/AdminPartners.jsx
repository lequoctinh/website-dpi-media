import React, { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { api } from "../lib/api";

const API_BASE =
(import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
const ASSET_BASE = (
import.meta.env.VITE_ASSET_BASE ||
API_BASE.replace(/\/api$/, "")
).replace(/\/+$/, "");

const PER_PAGE = 12;

const toImgUrl = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p) || p.startsWith("//")) return p;
return `${ASSET_BASE}${p}`;
};

const TIER_LABEL = {
strategic: "Chiến lược",
featured: "Tiêu biểu",
regular: "Đối tác",
};

export default function AdminPartners() {
const [list, setList] = useState([]);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

const [q, setQ] = useState("");
const [tierFilter, setTierFilter] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [homeFilter, setHomeFilter] = useState(""); // "", "home", "not_home"
const [page, setPage] = useState(1);

const [editing, setEditing] = useState(null);
const [preview, setPreview] = useState("");
const [submitting, setSubmitting] = useState(false);

const nameRef = useRef(null);
const websiteRef = useRef(null);
const industryRef = useRef(null);
const tierRef = useRef(null);
const showHomeRef = useRef(null);
const sortOrderRef = useRef(null);
const statusRef = useRef(null);
const logoRef = useRef(null);

// -------- LOAD LIST ----------
const loadList = async () => {
    setLoading(true);
    setErr("");
    try {
    const params = {};
    // status: "" => lấy tất cả
    if (statusFilter) params.status = statusFilter;
    else params.status = ""; // ép router không filter

    if (tierFilter) params.tier = tierFilter;
    if (homeFilter === "home") params.home = 1;
    if (homeFilter === "not_home") params.home = 0;

    const { data } = await api.get("/partners", { params });
    setList(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
    console.error(e);
    setErr(e?.response?.data?.message || "Không tải được danh sách đối tác.");
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    loadList();
}, [tierFilter, statusFilter, homeFilter]);

// -------- FORM --------
const resetForm = () => {
    setEditing(null);
    setPreview("");
    [nameRef, websiteRef, industryRef, tierRef, showHomeRef, sortOrderRef, statusRef, logoRef].forEach(
    (r) => r.current && (r.current.value = "")
    );
    if (showHomeRef.current) showHomeRef.current.checked = true;
};

const onPickLogo = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
    setPreview(editing?.logo ? toImgUrl(editing.logo) : "");
    return;
    }
    setPreview(URL.createObjectURL(f));
};

const onEdit = (row) => {
    setEditing(row);
    if (nameRef.current) nameRef.current.value = row.name || "";
    if (websiteRef.current) websiteRef.current.value = row.website_url || "";
    if (industryRef.current) industryRef.current.value = row.industry || "";
    if (tierRef.current) tierRef.current.value = row.tier || "regular";
    if (sortOrderRef.current) sortOrderRef.current.value = row.sort_order ?? 0;
    if (statusRef.current) statusRef.current.value = row.status || "hien";
    if (showHomeRef.current)
    showHomeRef.current.checked = row.show_on_home;

    if (logoRef.current) logoRef.current.value = "";
    setPreview(row.logo ? toImgUrl(row.logo) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const name = (nameRef.current?.value || "").trim();
    const website_url = (websiteRef.current?.value || "").trim();
    const industry = (industryRef.current?.value || "").trim();
    const tier = tierRef.current?.value || "regular";
    const sort_order = Number(sortOrderRef.current?.value || 0);
    const status = statusRef.current?.value || "hien";
    const show_on_home = !!showHomeRef.current?.checked;
    const file = logoRef.current?.files?.[0];

    if (!name) return toast.error("Vui lòng nhập tên đối tác.");
    if (!editing && !file)
    return toast.error("Vui lòng chọn logo cho đối tác.");

    try {
    setSubmitting(true);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("website_url", website_url);
    fd.append("industry", industry);
    fd.append("tier", tier);
    fd.append("sort_order", String(sort_order));
    fd.append("status", status);
    // router PATCH /home expects "1"/"0", nhưng ở POST/PUT mình tự xử lý:
    fd.append("show_on_home", show_on_home ? "1" : "0");
    if (file) fd.append("logo", file);

    if (editing) {
        await api.put(`/partners/${editing.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật đối tác thành công!");
    } else {
        await api.post("/partners", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Tạo đối tác thành công!");
    }

    setTimeout(() => {
        resetForm();
        loadList();
    }, 900);
    } catch (er) {
    console.error(er);
    toast.error(er?.response?.data?.message || "Lưu đối tác thất bại!");
    } finally {
    setSubmitting(false);
    }
};

const onDelete = async (row) => {
    if (!window.confirm(`Xoá đối tác "${row.name}"?`)) return;
    try {
    await api.delete(`/partners/${row.id}`);
    toast.success("Đã xoá đối tác!");
    setTimeout(() => loadList(), 600);
    } catch (er) {
    console.error(er);
    toast.error(er?.response?.data?.message || "Xoá thất bại!");
    }
};

const toggleStatus = async (row) => {
    const next = row.status === "hien" ? "an" : "hien";
    try {
    await api.patch(`/partners/${row.id}/status`, { status: next });
    toast.success("Đã cập nhật trạng thái!");
    setTimeout(() => loadList(), 500);
    } catch (er) {
    console.error(er);
    toast.error("Cập nhật trạng thái thất bại!");
    }
};

const toggleHome = async (row) => {
    const next = !row.show_on_home;
    try {
    await api.patch(`/partners/${row.id}/home`, {
        show_on_home: next ? "1" : "0",
    });
    toast.success("Đã cập nhật hiển thị trang chủ!");
    setTimeout(() => loadList(), 500);
    } catch (er) {
    console.error(er);
    toast.error("Cập nhật hiển thị thất bại!");
    }
};

// -------- FILTER + PAGINATION --------
const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter((p) => {
    const text =
        `${p.name || ""} ${p.industry || ""} ${p.website_url || ""}`.toLowerCase();
    return text.includes(keyword);
    });
}, [list, q]);

const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PER_PAGE)
);
const start = (page - 1) * PER_PAGE;
const paged = filtered.slice(start, start + PER_PAGE);

useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
}, [filtered.length, totalPages]);

return (
    <div className="space-y-6">
    <Toaster position="top-right" />

    {/* Header + filters */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <h1 className="text-2xl font-semibold text-white">
            Quản lý Đối tác / Thương hiệu
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
            Thêm, chỉnh sửa logo và thông tin thương hiệu xuất hiện trên
            website DPI Media.
        </p>
        </div>

        <div className="flex flex-wrap gap-2">
        <input
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none"
            placeholder="Tìm theo tên, ngành, website…"
            value={q}
            onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
            }}
        />
        <select
            value={tierFilter}
            onChange={(e) => {
            setTierFilter(e.target.value);
            setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        >
            <option value="">Tất cả hạng</option>
            <option value="strategic">Chiến lược</option>
            <option value="featured">Tiêu biểu</option>
            <option value="regular">Đối tác</option>
        </select>
        <select
            value={statusFilter}
            onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        >
            <option value="">Trạng thái: tất cả</option>
            <option value="hien">Đang hiển thị</option>
            <option value="an">Đang ẩn</option>
        </select>
        <select
            value={homeFilter}
            onChange={(e) => {
            setHomeFilter(e.target.value);
            setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        >
            <option value="">Trang chủ: tất cả</option>
            <option value="home">Chỉ hiển thị trang chủ</option>
            <option value="not_home">Không hiển thị trang chủ</option>
        </select>
        </div>
    </div>

    {/* FORM */}
    <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5"
    >
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
            <label className="block">
            <span className="text-sm text-zinc-300">Tên đối tác</span>
            <input
                ref={nameRef}
                type="text"
                placeholder="VD: Bosch, Hyundai, An Cường…"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-rose-500/60"
            />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
                <span className="text-sm text-zinc-300">Website</span>
                <input
                ref={websiteRef}
                type="text"
                placeholder="https://thuonghieu.vn (có thể bỏ trống)"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-rose-500/60"
                />
            </label>
            <label className="block">
                <span className="text-sm text-zinc-300">Ngành / Lĩnh vực</span>
                <input
                ref={industryRef}
                type="text"
                placeholder="Nội thất, Ô tô, Beauty, Tech…"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-rose-500/60"
                />
            </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
                <span className="text-sm text-zinc-300">Hạng đối tác</span>
                <select
                ref={tierRef}
                defaultValue="regular"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-2 focus:ring-rose-500/60"
                >
                <option value="strategic">Chiến lược</option>
                <option value="featured">Tiêu biểu</option>
                <option value="regular">Đối tác</option>
                </select>
            </label>

            <label className="block">
                <span className="text-sm text-zinc-300">Thứ tự</span>
                <input
                ref={sortOrderRef}
                type="number"
                defaultValue={0}
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-2 focus:ring-rose-500/60"
                />
            </label>

            <label className="block">
                <span className="text-sm text-zinc-300">Trạng thái</span>
                <select
                ref={statusRef}
                defaultValue="hien"
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-2 focus:ring-rose-500/60"
                >
                <option value="hien">Hiển thị</option>
                <option value="an">Ẩn</option>
                </select>
            </label>
            </div>

            <label className="inline-flex items-center gap-2 pt-1 text-sm text-zinc-300">
            <input
                ref={showHomeRef}
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border border-white/40 bg-black/60 text-rose-500 focus:ring-rose-500"
            />
            Hiển thị ở trang chủ
            </label>

            <label className="block pt-2">
            <span className="text-sm text-zinc-300">Logo (PNG/JPG/WebP)</span>
            <input
                ref={logoRef}
                type="file"
                accept="image/*"
                onChange={onPickLogo}
                className="mt-1 w-full cursor-pointer rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-white/20"
            />
            <p className="mt-1 text-xs text-zinc-500">
                {editing
                ? "Đang sửa: nếu không chọn file mới, logo cũ sẽ được giữ nguyên."
                : "Chọn logo thương hiệu (nên dùng nền trong suốt)."}
            </p>
            </label>
        </div>

        {/* Preview */}
        <div className="space-y-2">
            <span className="text-sm text-zinc-300">Xem trước logo</span>
            <div className="flex h-[180px] w-full items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
            {preview ? (
                <img
                src={preview}
                alt="Preview logo"
                className="max-h-20 max-w-[70%] object-contain"
                />
            ) : (
                <span className="text-sm text-zinc-500">
                Chưa có ảnh xem trước
                </span>
            )}
            </div>

            <div className="flex gap-2 pt-1">
            <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60"
            >
                {submitting
                ? "Đang lưu…"
                : editing
                ? "Cập nhật đối tác"
                : "Thêm đối tác"}
            </button>
            <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
                {editing ? "Huỷ chỉnh sửa" : "Xoá form"}
            </button>
            </div>
        </div>
        </div>
    </form>

    {/* LIST */}
    <div className="rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
        <div className="p-4 text-sm text-zinc-400">Đang tải danh sách…</div>
        ) : err ? (
        <div className="p-4 text-sm text-rose-400">{err}</div>
        ) : filtered.length === 0 ? (
        <div className="p-4 text-sm text-zinc-400">
            Chưa có đối tác nào.
        </div>
        ) : (
        <>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paged.map((p) => (
                <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40"
                >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
                    {p.logo ? (
                    <img
                        src={toImgUrl(p.logo)}
                        alt={p.name}
                        className="max-h-14 max-w-[70%] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    ) : (
                    <span className="text-xs text-zinc-500">
                        Chưa có logo
                    </span>
                    )}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-2 p-3">
                    <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                        {p.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-400">
                        Ngành: {p.industry || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        Hạng: {TIER_LABEL[p.tier] || "—"} • ID: {p.id}
                    </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                        <span
                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                            p.status === "hien"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                            : "bg-zinc-700/40 text-zinc-300 border border-zinc-500/50"
                        }`}
                        >
                        {p.status === "hien" ? "Hiển thị" : "Đang ẩn"}
                        </span>
                        {p.show_on_home && (
                        <span className="rounded-full border border-amber-400/50 bg-amber-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                            Trang chủ
                        </span>
                        )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                        <button
                        onClick={() => toggleHome(p)}
                        className="rounded-md border border-amber-500/70 px-2 py-1 text-[11px] text-amber-200 hover:bg-amber-500/20"
                        >
                        {p.show_on_home ? "Bỏ Home" : "Đưa lên Home"}
                        </button>
                        <button
                        onClick={() => onEdit(p)}
                        className="rounded-md border border-zinc-500 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10"
                        >
                        Sửa
                        </button>
                        <button
                        onClick={() => toggleStatus(p)}
                        className="rounded-md border border-sky-500/60 px-2 py-1 text-[11px] text-sky-300 hover:bg-sky-500/20"
                        >
                        {p.status === "hien" ? "Ẩn" : "Hiện"}
                        </button>
                        <button
                        onClick={() => onDelete(p)}
                        className="rounded-md border border-red-500 px-2 py-1 text-[11px] text-red-400 hover:bg-red-500/20"
                        >
                        Xoá
                        </button>
                    </div>
                    </div>
                </div>
                </article>
            ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center gap-3 border-t border-white/10 px-4 py-3 text-xs text-zinc-400 sm:flex-row sm:justify-between">
            <div>
                Đang hiển thị{" "}
                <span className="text-zinc-200">
                {filtered.length === 0 ? 0 : start + 1}–
                {Math.min(start + PER_PAGE, filtered.length)}
                </span>{" "}
                /{" "}
                <span className="text-zinc-200">
                {filtered.length}
                </span>{" "}
                đối tác
            </div>
            <div className="flex items-center gap-2">
                <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                >
                Trước
                </button>
                <span className="text-zinc-300">
                Trang {page}/{totalPages}
                </span>
                <button
                onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page >= totalPages}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white disabled:opacity-40"
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
