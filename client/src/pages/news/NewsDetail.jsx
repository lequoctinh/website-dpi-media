// src/pages/news/NewsDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/api";

const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || "").replace(/\/+$/, "");
const joinAsset = (p) => (!p ? "" : /^https?:\/\//i.test(p) ? p : `${ASSET_BASE}${p.startsWith("/") ? p : "/" + p}`);
const fmt = (s) => (s ? new Date(s).toLocaleString("vi-VN") : "");

// chấp nhận cả raw/mapped
const normalize = (r = {}) => ({
id: r.id,
slug: r.slug,
title: r.title ?? r.tieu_de ?? "",
thumbnail: r.thumbnail ?? r.hinh_anh ?? "",
excerpt: r.excerpt ?? r.mo_ta_ngan ?? "",
content: r.content ?? r.noi_dung ?? "",
author: r.author ?? r.tac_gia ?? "",
status: r.status ?? r.trang_thai ?? "nhap",
published_at: r.published_at ?? r.ngay_dang ?? null,
created_at: r.created_at ?? r.updated_at,
views: r.views ?? r.luot_xem ?? 0,
});

export default function NewsDetail() {
const { slugOrId } = useParams();
const [post, setPost] = useState(null);
const [err, setErr] = useState("");

useEffect(() => {
    let mounted = true;
    (async () => {
    try {
        setErr("");
        const { data } = await api.get(`/bai-viet/${slugOrId}`);
        const p = normalize(data);
        if (!mounted) return;
        setPost(p);

        // tăng view (best-effort)
        if (p.id) {
        api.patch(`/bai-viet/${p.id}/view`).catch(() => {});
        }
    } catch (e) {
        setErr("Không tìm thấy bài viết.");
    }
    })();
    return () => { mounted = false; };
}, [slugOrId]);

const metaDate = useMemo(() => post?.published_at || post?.created_at, [post]);

if (err) {
    return (
    <section className="bg-black">
        <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-4 text-white/80">{err}</p>
        <Link to="/" className="rounded-md border border-white/20 px-3 py-2 text-white/80 hover:bg-white/10">
            ← Về trang chủ
        </Link>
        </div>
    </section>
    );
}

if (!post) {
    return (
    <section className="bg-black">
        <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-9 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-5 w-1/3 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-64 w-full animate-pulse rounded-xl bg-white/10" />
        <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-white/10" />
            ))}
        </div>
        </div>
    </section>
    );
}

return (
    <section className="relative bg-black">
    <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_400px_at_50%_-10%,rgba(255,255,255,.06),transparent)]"
    />
    <div className="mx-auto max-w-3xl px-4 py-16">
        <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
        >
        ← Về trang chủ
        </Link>

        <h1 className="text-3xl font-extrabold text-white md:text-4xl">{post.title}</h1>
        <p className="mt-2 text-sm text-white/60">
        {metaDate ? fmt(metaDate) : "—"} {post.author ? `• ${post.author}` : ""} • 👁 {post.views}
        </p>

        {post.thumbnail && (
        <img
            src={joinAsset(post.thumbnail)}
            alt={post.title}
            loading="lazy"
            className="mt-6 h-64 w-full rounded-xl object-cover md:h-80"
        />
        )}

        <article
        className="prose prose-invert mt-6 max-w-none prose-a:text-rose-400 prose-headings:text-white prose-p:text-white/90"
        // Nội dung HTML do bạn kiểm soát trong admin, nên hiển thị an toàn
        dangerouslySetInnerHTML={{ __html: post.content || `<p>${post.excerpt || ""}</p>` }}
        />
    </div>
    </section>
);
}
