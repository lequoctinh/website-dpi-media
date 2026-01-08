import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { Link } from "react-router-dom";

const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || "").replace(/\/+$/, "");
const joinAsset = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p)) return p;
const path = String(p).startsWith("/") ? p : `/${p}`;
return `${ASSET_BASE}${path}`;
};

export default function NewsList() {
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    api.get("/bai-viet", { params: { status: "xuat_ban", limit: 100 } })
    .then((res) => {
        const raw = Array.isArray(res.data?.data) ? res.data.data : [];
        setPosts(raw);
    })
    .catch(() => setPosts([]))
    .finally(() => setLoading(false));
    window.scrollTo(0, 0);
}, []);

return (
    <div className="min-h-screen bg-black text-white pb-24 pt-36">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(255,255,255,0.03),transparent)]" />

    <div className="relative mx-auto max-w-6xl px-6">
        <header className="mb-20 text-center">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.5em] text-brand">DPI Media Archive</p>
        <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            Bản tin của <span className="text-white/70">DPI MEDIA</span>
        </h2> 
        <div className="mx-auto mt-6 h-1 w-20 bg-brand rounded-full" />
        </header>

        {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/5" />)}
        </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {posts.map((item) => (
                <article 
                    key={item.id} 
                    className="
                        group relative flex flex-col gap-5 rounded-[2.5rem] p-4
                        border border-white/10 bg-zinc-900/50
                        transition-all duration-500
                        hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]
                        hover:-translate-y-2
                    "
                >
                    <Link 
                        to={`/tin-tuc/${item.slug}`} 
                        className="relative block aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/5 bg-black"
                    >
                        <img 
                            src={joinAsset(item.thumbnail)} 
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={item.title} 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </Link>

                    <div className="space-y-3 px-2 pb-2">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            <span className="text-rose-500">{item.categoryName || "Media"}</span>
                            <span className="opacity-30">/</span>
                            <span>{new Date(item.published_at).toLocaleDateString("vi-VN")}</span>
                        </div>
                        
                        <Link to={`/tin-tuc/${item.slug}`}>
                            <h2 className="text-xl font-bold leading-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-orange-500 transition-all duration-300 line-clamp-2">
                                {item.title}
                            </h2>
                        </Link>

                        <p className="line-clamp-2 text-sm text-zinc-400 leading-relaxed font-medium">
                            {item.excerpt || "Khám phá câu chuyện hậu trường và quy trình sáng tạo tại DPI Media..."}
                        </p>

                        <Link 
                            to={`/tin-tuc/${item.slug}`} 
                            className="
                                inline-flex items-center gap-2 pt-2
                                text-[10px] font-black uppercase tracking-widest text-white/70 
                                group-hover:text-rose-500 group-hover:gap-4 transition-all
                            "
                        >
                            Đọc bài viết <span>→</span>
                        </Link>
                    </div>

                    <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none border border-transparent group-hover:border-rose-500/20 transition-all duration-500 shadow-inner" />
                </article>
            ))}
        </div>
        )}

        <div className="mt-24 flex justify-center">
        <Link 
            to="/" 
            className="
            group relative inline-flex items-center gap-2 rounded-full 
            bg-gradient-to-r from-rose-500 to-orange-500 
            px-6 py-2.5 text-xs font-bold text-white 
            shadow-lg ring-1 ring-white/10 
            transition-all duration-300
            hover:shadow-xl hover:scale-105 active:scale-95
            "
        >
            <svg 
            className="transition-transform group-hover:-translate-x-1" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3"
            >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="uppercase tracking-widest">Quay lại trang chủ</span>
        </Link>
        </div>
    </div>
    </div>
);
}