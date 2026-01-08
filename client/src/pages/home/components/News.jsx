import React, { useEffect, useMemo, useState, useRef } from "react";
import { api } from "../../../api/api";
import { Link } from "react-router-dom";

const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || "").replace(/\/+$/, "");

const joinAsset = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p)) return p;
const path = String(p).startsWith("/") ? p : `/${p}`;
return `${ASSET_BASE}${path}`;
};

const formatDate = (s) => {
if (!s) return "";
const d = new Date(s);
return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const normalizePost = (row = {}) => ({
id: row.id,
slug: row.slug,
title: row.title ?? row.tieu_de ?? "",
thumbnail: row.thumbnail ?? row.hinh_anh ?? "",
category_name: row.categoryName ?? row.category_name ?? "Tin tức",
published_at: row.published_at ?? row.ngay_dang ?? row.created_at,
});

export default function News() {
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const scrollRef = useRef(null);

useEffect(() => {
    api.get("/bai-viet", { params: { status: "xuat_ban", limit: 10 } })
    .then((res) => {
        const raw = Array.isArray(res.data?.data) ? res.data.data : [];
        setItems(raw.map(normalizePost));
    })
    .catch(() => setItems([]))
    .finally(() => setLoading(false));
}, []);

const scroll = (direction) => {
    if (scrollRef.current) {
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
    scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
};

return (
    <section id="news" className="relative bg-black py-24 overflow-hidden">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-10%,rgba(255,255,255,.05),transparent)]" />
    
    <div className="relative mx-auto max-w-7xl px-4">
        <header className="mb-16 text-center space-y-4">
        <div className="flex justify-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" />
            Hoạt động
            </p>
        </div>
        <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            Bản tin của <span className="text-white/70">DPI MEDIA</span>
        </h2> 
        <p className="mt-3 text-white/70 max-w-2xl mx-auto text-sm md:text-base">
            Cập nhật dự án mới nhất, quy trình sản xuất sáng tạo và những câu chuyện hậu trường độc quyền từ đội ngũ DPI MEDIA.
        </p>
        <div className="mx-auto h-1 w-20 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" />
        </header>

        <div className="group relative">
        <div className="absolute -top-14 right-0 flex gap-2">
            <button onClick={() => scroll("left")} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button onClick={() => scroll("right")} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l6 6-6 6"/></svg>
            </button>
        </div>

        <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {loading ? (
            [1, 2, 3].map(i => <div key={i} className="min-w-[320px] h-[450px] animate-pulse rounded-[2.5rem] bg-white/5" />)
            ) : items.map((item) => (
            <article 
                key={item.id} 
                className="
                min-w-[85%] md:min-w-[32%] snap-start group/card relative flex flex-col gap-4 
                rounded-[2.5rem] p-5 border border-white/10 bg-zinc-900/40 
                transition-all duration-500
                hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]
                hover:-translate-y-2
                "
            >
                <Link to={`/tin-tuc/${item.slug}`} className="relative block aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/5">
                <img 
                    src={joinAsset(item.thumbnail)} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110" 
                    alt={item.title} 
                />
                <div className="absolute inset-0 bg-black/20 group-hover/card:bg-transparent transition-colors" />
                <span className="absolute top-4 left-4 rounded-lg bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10 uppercase tracking-widest">
                    {item.category_name}
                </span>
                </Link>

                <div className="flex flex-col flex-1 px-2 space-y-3">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {formatDate(item.published_at)}
                </div>
                
                <Link to={`/tin-tuc/${item.slug}`}>
                    <h3 className="line-clamp-2 text-xl font-bold text-white transition-colors group-hover/card:text-rose-500 leading-snug">
                    {item.title}
                    </h3>
                </Link>

                <p className="line-clamp-2 text-sm text-zinc-400 leading-relaxed">
                    {item.excerpt || "Khám phá câu chuyện hậu trường và quy trình sáng tạo độc đáo tại DPI Media Studio..."}
                </p>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                    <span className="text-[10px] font-medium text-zinc-500 italic uppercase">DPI Media Studio</span>
                    <Link 
                    to={`/tin-tuc/${item.slug}`} 
                    className="
                        flex h-9 w-9 items-center justify-center rounded-full 
                        bg-white/5 text-white border border-white/10
                        transition-all duration-300
                        group-hover/card:bg-gradient-to-r group-hover/card:from-rose-500 group-hover/card:to-orange-500 
                        group-hover/card:border-transparent group-hover/card:scale-110
                    "
                    >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                </div>
                </div>
            </article>
            ))}
        </div>
        </div>

        <footer className="mt-8 flex justify-center">
        <Link 
            to="/tin-tuc" 
            className="
            group relative inline-flex items-center gap-2 rounded-full 
            bg-gradient-to-r from-rose-500 to-orange-500 
            px-8 py-3 text-sm font-semibold text-white 
            shadow-lg ring-1 ring-white/10 
            transition-all duration-300
            hover:shadow-xl hover:scale-105 active:scale-95
            "
        >
            <span>Xem tất cả bài viết</span>
            <svg className="transition-transform group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
        </footer>
    </div>
    </section>
);
}