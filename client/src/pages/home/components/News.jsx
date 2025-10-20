// src/pages/home/components/News.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || "").replace(/\/+$/, "");
const joinAsset = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p)) return p;
const path = String(p).startsWith("/") ? p : `/${p}`;
return `${ASSET_BASE}${path}`;
};
const stripHtml = (html = "") =>
String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const formatDate = (s) => {
if (!s) return "";
const d = new Date(s);
if (Number.isNaN(d.getTime())) return "";
return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const normalizePost = (row = {}) => ({
id: row.id,
slug: row.slug,
title: row.title ?? row.tieu_de ?? "",
thumbnail: row.thumbnail ?? row.hinh_anh ?? "",
excerpt: row.excerpt ?? row.mo_ta_ngan ?? "",
content: row.content ?? row.noi_dung ?? "",
author: row.author ?? row.tac_gia ?? "",
status: row.status ?? row.trang_thai ?? "nhap",
created_at: row.created_at ?? row.ngay_dang ?? row.updated_at,
published_at: row.published_at ?? row.ngay_dang ?? null,
category_name: row.category_name ?? "",
});

function NewsCard({ item }) {
const img = item.thumbnail ? joinAsset(item.thumbnail) : "";
const readMore = item.slug ? `/hoat-dong/${item.slug}` : `/hoat-dong/${item.id}`;
const plain = stripHtml(item.content || "");
const summary =
    (item.excerpt?.trim() || (plain.length > 150 ? plain.slice(0, 150) + "…" : plain)) || "—";

return (
    <article
    className="
        group relative flex h-full flex-col overflow-hidden rounded-2xl
        border border-white/10
        bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))]
        shadow-[0_14px_50px_-28px_rgba(0,0,0,.85)]
        transition-colors
        hover:border-white/15 hover:bg-white/[0.06]
    "
    >
    <div className="relative">
        {img ? (
        <img
            src={img}
            alt={item.title || "news"}
            className="aspect-[16/9] w-full object-cover"
            loading="lazy"
        />
        ) : (
        <div className="aspect-[16/9] w-full bg-white/5" />
        )}
        {item.category_name && (
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">
            {item.category_name}
        </span>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
    </div>

    <div className="p-3">
        <div className="rounded-xl bg-gradient-to-r from-[#ff5a7b] to-[#ff8a1a] p-[2px]">
        <div className="rounded-[10px] bg-black/40 p-4 backdrop-blur-[2px]">
            <h3 className="mb-1 line-clamp-2 text-lg font-semibold tracking-tight text-white">
            {item.title}
            </h3>
            {(item.published_at || item.created_at) && (
            <p className="mb-2 text-xs text-white/80">
                {formatDate(item.published_at || item.created_at)}
            </p>
            )}
            <p className="line-clamp-3 text-sm leading-relaxed text-white/95">{summary}</p>

            <div className="mt-4">
            <Link
                to={readMore}
                onClick={(e) => e.preventDefault()}
                className="
                inline-flex items-center gap-2 rounded-lg
                bg-white/15 px-3 py-2 text-sm text-white
                transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/30
                "
                aria-label={`Xem chi tiết ${item.title}`}
            >
                Xem chi tiết <span>→</span>
            </Link>
            </div>
        </div>
        </div>
    </div>

    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-colors group-hover:ring-white/10" />
    </article>
);
}

export default function News() {
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    setLoading(true);
    api
    .get("/bai-viet", { signal: controller.signal })
    .then((res) => {
        if (!mounted) return;
        const raw = Array.isArray(res.data?.data) ? res.data.data : [];
        setItems(raw.map(normalizePost));
    })
    .catch(() => mounted && setItems([]))
    .finally(() => mounted && setLoading(false));
    return () => {
    mounted = false;
    controller.abort();
    };
}, []);

const hasData = useMemo(() => items.length > 0, [items.length]);

return (
    <section id="news" aria-labelledby="news-heading" className="relative bg-black">
    <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_420px_at_50%_-10%,rgba(255,255,255,.06),transparent)]"
    />
    <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <header className="mb-10 text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Hoạt động
        </p>
        <h2
            id="news-heading"
            className="mt-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-3xl font-extrabold leading-tight text-transparent md:text-4xl"
        >
            Tin tức & hoạt động công ty
        </h2>
        </header>

        <div className="relative md:px-16">
        <button
            className="
            news-prev
            absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 md:flex
            h-12 w-12 items-center justify-center rounded-full
            bg-gradient-to-r from-[#ff5a7b] to-[#ff8a1a]
            shadow-[0_14px_40px_-18px_rgba(255,138,26,.6)]
            text-white
            transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30
            "
            aria-label="Tin trước"
            type="button"
        >
            ‹
        </button>

        <button
            className="
            news-next
            absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 md:flex
            h-12 w-12 items-center justify-center rounded-full
            bg-gradient-to-r from-[#ff5a7b] to-[#ff8a1a]
            shadow-[0_14px_40px_-18px_rgba(255,138,26,.6)]
            text-white
            transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30
            "
            aria-label="Tin sau"
            type="button"
        >
            ›
        </button>

        {loading ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="animate-pulse">
                <div className="aspect-[16/9] w-full rounded-2xl bg-white/10" />
                <div className="mt-3 h-6 w-3/4 rounded bg-white/10" />
                <div className="mt-2 h-4 w-2/3 rounded bg-white/10" />
                </li>
            ))}
            </ul>
        ) : !hasData ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
            Chưa có hoạt động nào.
            </p>
        ) : (
            <Swiper
            modules={[Navigation]}
            className="!pb-1"
            autoplay={false}
            speed={480}
            breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 12 },
                640: { slidesPerView: 2, spaceBetween: 14 },
                1024: { slidesPerView: 3, spaceBetween: 18 },
            }}
            slidesPerGroup={1}
            allowTouchMove={true}
            watchOverflow={true}
            navigation={{ prevEl: ".news-prev", nextEl: ".news-next" }}
            >
            {items.map((it) => (
                <SwiperSlide key={it.id}>
                <div className="px-1.5 md:px-2">
                    <NewsCard item={it} />
                </div>
                </SwiperSlide>
            ))}
            </Swiper>
        )}
        </div>
    </div>
    </section>
);
}
