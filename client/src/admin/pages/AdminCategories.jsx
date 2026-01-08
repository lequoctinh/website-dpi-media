import React, { useEffect, useRef, useState } from "react";
import { api } from "../lib/api"; // axios instance
import toast, { Toaster } from "react-hot-toast";

export default function AdminCategories() {
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [editing, setEditing] = useState(null);

const nameRef = useRef(null);

const fetchCategories = async () => {
    setLoading(true);
    try {
    const res = await api.get("/category");
    setCategories(res.data || []);
    setError("");
    } catch (e) {
    toast.error(e?.response?.data?.error || "Không tải được danh mục");
    }
    finally {
    setLoading(false);
    }
};

useEffect(() => {
    fetchCategories();
}, []);

const handleSubmit = async (e) => {
    e.preventDefault();
    const name = nameRef.current?.value.trim();
    if (!name) return toast.error("Tên không được để trống");

    try {
    if (editing) {
        await api.put(`/category/${editing.id}`, { name });
        toast.success("Cập nhật danh mục thành công!");
    } else {
        await api.post("/category", { name });
        toast.success("Thêm danh mục thành công!");
    }
    setEditing(null);
    nameRef.current.value = "";

    setTimeout(() => window.location.reload(), 1200);
    } catch {
    toast.error("Lưu thất bại!");
    }
};

const handleDelete = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    try {
    await api.delete(`/category/${id}`);
    toast.success("Xóa danh mục thành công!");
    setTimeout(() => window.location.reload(), 1200);
    } catch {
    toast.error("Xoá thất bại!");
    }
};

return (
    <div className="space-y-6">
    <Toaster position="top-right" reverseOrder={false} />

    <div>
        <h1 className="text-2xl font-semibold text-white">Quản lý Danh mục</h1>
        <p className="mt-1 text-sm text-zinc-400">
        Quản lý nhóm nội dung (TVC, Music Video, Hậu trường...)
        </p>
    </div>

    <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row"
    >
        <input
        ref={nameRef}
        type="text"
        placeholder="Tên danh mục..."
        defaultValue={editing?.name || ""}
        className="flex-1 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-brand"
        />
        <button
        type="submit"
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
        {editing ? "Cập nhật" : "Thêm mới"}
        </button>
        {editing && (
        <button
            type="button"
            onClick={() => {
            setEditing(null);
            nameRef.current.value = "";
            }}
            className="rounded-lg border border-zinc-500 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
            Huỷ
        </button>
        )}
    </form>

    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {loading ? (
        <div className="p-4 text-sm text-zinc-400">Đang tải...</div>
        ) : error ? (
        <div className="p-4 text-sm text-red-500">{error}</div>
        ) : categories.length === 0 ? (
        <div className="p-4 text-sm text-zinc-400">Chưa có danh mục nào</div>
        ) : (
        <table className="min-w-full text-sm text-white/90">
            <thead className="bg-white/10 text-zinc-300">
            <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Tên danh mục</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {categories.map((c) => (
                <tr
                key={c.id}
                className="border-t border-white/10 hover:bg-white/5"
                >
                <td className="px-4 py-2">{c.id}</td>
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2 text-right space-x-2">
                    <button
                    onClick={() => {
                        setEditing(c);
                        nameRef.current.value = c.name;
                    }}
                    className="rounded-md border border-zinc-500 px-2 py-1 text-sm text-zinc-200 hover:bg-white/10"
                    >
                    Sửa
                    </button>
                    <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-md border border-red-500 px-2 py-1 text-sm text-red-400 hover:bg-red-500/20"
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
    </div>
);
}
