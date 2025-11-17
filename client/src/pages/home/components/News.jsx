// src/pages/home/components/News.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/api";

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
return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});
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

/* ---------- LEAD STORY (TIN NỔI BẬT BÊN TRÁI) ---------- */
function LeadStory({ item }) {
const img = item.thumbnail ? joinAsset(item.thumbnail) : "";
const plain = stripHtml(item.content || "");
const summary =
    (item.excerpt?.trim() ||
    (plain.length > 220 ? plain.slice(0, 220) + "…" : plain)) || "—";

return (
    <article
    className="
        relative flex h-full flex-col overflow-hidden rounded-3xl
        border border-white/12 bg-black/80
        shadow-[0_26px_90px_rgba(0,0,0,0.95)]
    "
    >
    {/* Ảnh top (mobile) + left (desktop) */}
    <div className="relative h-52 w-full overflow-hidden md:h-64">
        {img ? (
        <img
            src={img}
            alt={item.title || "Tin nổi bật"}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.05]"
            loading="lazy"
        />
        ) : (
        <div className="h-full w-full bg-white/5" />
        )}

        {/* label Tin nổi bật */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white/85 ring-1 ring-white/40 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#ff4d67] via-[#ff6a3d] to-[#ffb02e]" />
            TIN NỔI BẬT
        </span>
        {item.category_name && (
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white/75 ring-1 ring-white/25">
            {item.category_name}
            </span>
        )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent" />
    </div>

    {/* Content */}
    <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
        {(item.published_at || item.created_at) && (
            <span className="font-medium">
            {formatDate(item.published_at || item.created_at)}
            </span>
        )}
        {item.author && (
            <span className="inline-flex items-center gap-1 text-white/65">
            <span className="h-1 w-1 rounded-full bg-white/60" />
            Bởi{" "}
            <span className="font-semibold text-white/90">
                {item.author}
            </span>
            </span>
        )}
        <span className="inline-flex items-center gap-1 text-white/55">
            <span className="h-1 w-1 rounded-full bg-white/60" />
            DPI Media • Lead story
        </span>
        </div>

        <h3 className="text-xl font-extrabold leading-tight text-white md:text-2xl">
        {item.title}
        </h3>

        <p className="text-sm leading-relaxed text-white/85 md:text-[15px]">
        {summary}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
            Được biên tập thủ công – ưu tiên dự án & hoạt động tiêu biểu
        </p>

        {/* nút placeholder # */}
        <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="
            inline-flex items-center gap-2 rounded-full
            bg-white px-4 py-2 text-xs font-semibold text-gray-900
            shadow-[0_18px_40px_rgba(0,0,0,0.9)]
            transition hover:shadow-[0_24px_60px_rgba(0,0,0,0.95)]
            focus:outline-none focus:ring-2 focus:ring-white/40
            "
        >
            Xem chi tiết bài viết <span className="text-sm">→</span>
        </a>
        </div>
    </div>
    </article>
);
}

/* ---------- BẢN TIN NHANH BÊN PHẢI (3 ITEM) ---------- */
function QuickNewsItem({ item }) {
const img = item.thumbnail ? joinAsset(item.thumbnail) : "";
const plain = stripHtml(item.content || "");
const summary =
    (item.excerpt?.trim() ||
    (plain.length > 90 ? plain.slice(0, 90) + "…" : plain)) || "—";

return (
    <article
    className="
        group relative flex gap-3 rounded-2xl border border-white/10
        bg-black/70 p-3
        shadow-[0_18px_60px_rgba(0,0,0,0.9)]
        transition-all hover:-translate-y-[2px] hover:border-white/25
    "
    >
    <div className="relative h-16 w-24 overflow-hidden rounded-xl sm:h-20 sm:w-28">
        {img ? (
        <img
            src={img}
            alt={item.title || "Tin nhanh"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            loading="lazy"
        />
        ) : (
        <div className="h-full w-full bg-white/10" />
        )}
        {item.category_name && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-2 py-[2px] text-[10px] text-white/80 backdrop-blur">
            {item.category_name}
        </span>
        )}
    </div>

    <div className="flex min-w-0 flex-1 flex-col gap-1">
        {(item.published_at || item.created_at) && (
        <p className="text-[10px] text-white/60">
            {formatDate(item.published_at || item.created_at)}
        </p>
        )}

        <h4 className="line-clamp-2 text-[13px] font-semibold text-white">
        {item.title}
        </h4>
        <p className="line-clamp-2 text-[11px] leading-snug text-white/75">
        {summary}
        </p>

        <div className="mt-1 flex items-center justify-between text-[10px] text-white/60">
        {item.author && (
            <span className="truncate max-w-[60%]">Bởi {item.author}</span>
        )}
        <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-1 text-[10px] text-white/80 hover:text-white"
        >
            Xem chi tiết <span className="text-xs">→</span>
        </a>
        </div>
    </div>
    </article>
);
}

/* ---------- DÒNG THỜI GIAN HOẠT ĐỘNG (SCROLL NGANG) ---------- */
function TimelineStrip({ items }) {
if (!items.length) return null;

return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-black/70 px-3 py-4 md:px-4">
    <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#ff4d67] via-[#ff6a3d] to-[#ffb02e]" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
            Dòng thời gian hoạt động
        </p>
        </div>
        <p className="hidden text-[11px] text-white/60 md:block">
        Kéo ngang để xem thêm các mốc gần đây.
        </p>
    </div>

    <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((it, idx) => (
        <div
            key={it.id}
            className="
            relative flex min-w-[220px] max-w-xs flex-col gap-1.5
            rounded-2xl border border-white/10 bg-black/80 px-3 py-2.5
            "
        >
            <div className="flex items-center justify-between gap-2 text-[11px] text-white/65">
            <span className="font-medium">
                {formatDate(it.published_at || it.created_at)}
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                #{String(idx + 1).padStart(2, "0")}
            </span>
            </div>
            <h5 className="line-clamp-2 text-[12px] font-semibold text-white">
            {it.title}
            </h5>
            {it.author && (
            <p className="text-[10px] text-white/55">Bởi {it.author}</p>
            )}
            <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-white/80 hover:text-white"
            >
            Xem chi tiết <span className="text-xs">→</span>
            </a>
        </div>
        ))}
    </div>
    </div>
);
}

/* ---------- MAIN COMPONENT ---------- */

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
const lead = hasData ? items[0] : null;
const quick = hasData ? items.slice(1, 4) : [];
const timeline = hasData ? items.slice(4, 12) : [];

return (
    <section id="news" aria-labelledby="news-heading" className="relative bg-black">
    {/* nền giữ nguyên */}
    <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_420px_at_50%_-10%,rgba(255,255,255,.06),transparent)]"
    />
    <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-20">
        {/* HEADER – GIỮ NGUYÊN PILL “Hoạt động” */}
        <header className="mb-8 md:mb-10">
        <div className="text-center md:text-left">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-white/70 md:mx-0">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Hoạt động
            </p>
        </div>

        {/* news-head kiểu editorial */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#ff4d67] via-[#ff6a3d] to-[#ffb02e]" />
                <h2
                id="news-heading"
                className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-3xl font-extrabold leading-tight text-transparent md:text-4xl"
                >
                Bản tin DPI Media
                </h2>
            </div>
            <p className="mt-2 max-w-2xl text-center text-sm text-white/70 md:text-left md:text-[15px]">
                Một trung tâm tin tức nhỏ cho thương hiệu: nơi cập nhật những mốc
                quan trọng, câu chuyện hậu trường và hoạt động mới của đội ngũ DPI
                Media.
            </p>
            </div>

            {!loading && hasData && (
            <div className="flex items-center justify-center gap-3 md:justify-end">
                <div className="hidden h-9 flex-1 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 text-[11px] text-white/65 md:flex md:flex-none">
                <span className="h-1 w-1 rounded-full bg-green-400" />
                Đang hiển thị{" "}
                <span className="font-semibold text-white">
                    {items.length}
                </span>{" "}
                bài viết gần đây
                </div>
                <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="
                    inline-flex items-center gap-2 rounded-full
                    border border-white/20 bg-white/5 px-3 py-1.5
                    text-[11px] font-medium uppercase tracking-[0.16em] text-white/80
                    hover:bg-white/10
                "
                >
                Xem tất cả bài viết <span className="text-sm">→</span>
                </a>
            </div>
            )}
        </div>
        </header>

        {/* BODY */}
        {loading ? (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
            <div className="h-72 rounded-3xl bg-white/10 animate-pulse" />
            <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/10 animate-pulse" />
            ))}
            </div>
        </div>
        ) : !hasData ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
            Chưa có hoạt động nào.
        </p>
        ) : (
        <>
            <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
            <div>{lead && <LeadStory item={lead} />}</div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                    Bản tin nhanh
                </h3>
                <span className="text-[11px] text-white/55">
                    {quick.length
                    ? `Hiển thị ${quick.length} cập nhật mới`
                    : "Sẵn sàng cho các bản tin tiếp theo"}
                </span>
                </div>
                {quick.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-white/75">
                    Hiện tại chỉ có một tin nổi bật. Các bản tin nhanh sẽ xuất hiện ở
                    đây khi có thêm bài viết mới.
                </p>
                ) : (
                quick.map((it) => <QuickNewsItem key={it.id} item={it} />)
                )}
            </div>
            </div>

            <TimelineStrip items={timeline} />
        </>
        )}
    </div>
    </section>
);
}
