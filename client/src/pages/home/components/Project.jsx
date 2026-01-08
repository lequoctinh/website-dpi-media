import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/api";


const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || "").replace(/\/+$/, "");

const extractVideoId = (url) => {
if (!url) return null;
const m =
    url.match(/(?:youtube\.com\/.*(?:v=|\/v\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i) ||
    url.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
return m ? m[1] : null;
};

const joinAsset = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p)) return p;
const path = String(p).startsWith("/") ? p : `/${p}`;
return `${ASSET_BASE}${path}`;
};

const VideoPoster = ({ video }) => {
const id = video.video_id || extractVideoId(video.youtube_url);
const poster = video.poster ? joinAsset(video.poster) : id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
return (
    <img
    src={poster}
    alt={video.title || "Poster"}
    loading="lazy"
    className="h-64 w-full rounded-xl object-cover md:h-56 lg:h-60"
    />
);
};
export default function Project() {
const [categories, setCategories] = useState([]);   
const [selectedCat, setSelectedCat] = useState(null);

const [videos, setVideos] = useState([]);
const [loading, setLoading] = useState(false);
const [err, setErr] = useState("");

const [selectedVideo, setSelectedVideo] = useState(null);

const perPage = 9;
const [page, setPage] = useState(1);
const totalPages = Math.max(1, Math.ceil(videos.length / perPage));
const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return videos.slice(start, start + perPage);
}, [videos, page]);

useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    api
    .get("/category", { signal: controller.signal })
    .then((res) => mounted && setCategories(res.data || []))
    .catch((e) => {
        if (e.name === "CanceledError" || e.code === "ERR_CANCELED") return;
        if (mounted) setCategories([]); 
    });

    return () => {
    mounted = false;
    controller.abort();
    };
}, []);

useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    setLoading(true);
    setErr("");

    api
    .get("/video-projeck", {
        signal: controller.signal,
        params: selectedCat ? { category_id: selectedCat } : undefined,
    })
    .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setVideos(data);
        setPage(1);
    })
    .catch((e) => {
        if (e.name === "CanceledError" || e.code === "ERR_CANCELED") return;
        if (mounted) setErr("Không tải được danh sách dự án.");
    })
    .finally(() => {
        if (mounted) setLoading(false);
    });

    return () => {
    mounted = false;
    controller.abort();
    };
}, [selectedCat]);

const openVideo = (v) => setSelectedVideo(v);
const closeVideo = () => setSelectedVideo(null);

return (
    <section id="projects" aria-labelledby="projects-heading" className="relative bg-black">
    <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <header className="mx-auto mb-8 max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Dự Án
        </p>
        <h2 id="projects-heading" className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            Dự án của <span className="text-white/70">DPI MEDIA</span>
        </h2>
        <p className="mt-3 text-white/70">Chọn danh mục để xem các Commercial, TVC, social video… đã thực hiện.</p>
        <div className="mx-auto mt-4 mb-2 h-1 w-20 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" />
        </header>

        <nav aria-label="Lọc danh mục dự án" className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <FilterButton active={!selectedCat} onClick={() => setSelectedCat(null)} label="Tất cả" />
        {categories.map((c) => (
            <FilterButton key={c.id} active={selectedCat === c.id} onClick={() => setSelectedCat(c.id)} label={c.name} />
        ))}
        </nav>

        <div className="relative">
        {loading && (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: perPage }).map((_, i) => (
                <li key={i} className="animate-pulse">
                <div className="h-60 w-full rounded-xl bg-white/10" />
                <div className="mt-3 h-6 w-3/4 rounded bg-white/10" />
                </li>
            ))}
            </ul>
        )}

        {!loading && err && (
            <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/80">{err}</p>
        )}

        {!loading && !err && paged.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
            Hiện chưa có video trong danh mục này.
            </p>
        )}

        {!loading && !err && paged.length > 0 && (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((v, idx) => (
                <li key={idx}>
                <article className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition hover:bg-white/[0.05]">
                    <button
                    type="button"
                    onClick={() => openVideo(v)}
                    className="block w-full text-left focus:outline-none"
                    aria-label={`Mở video ${v.title}`}
                    >
                    <div className="relative overflow-hidden rounded-xl">
                        <VideoPoster video={v} />
                        <span className="pointer-events-none absolute inset-0 rounded-xl">
                        <span className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/15 opacity-0 transition duration-700 group-hover:translate-x-[220%] group-hover:opacity-100" />
                        </span>
                        <h3 className="absolute left-3 right-3 top-3 line-clamp-2 text-[0.95rem] font-semibold text-white drop-shadow">
                        {v.title}
                        </h3>
                    </div>
                    {v.category_name && <p className="mt-3 text-sm text-white/60">{v.category_name}</p>}
                    </button>
                </article>
                </li>
            ))}
            </ul>
        )}
        </div>

        {!loading && !err && videos.length > perPage && (
        <nav aria-label="Phân trang dự án" className="mt-8 flex items-center justify-center gap-2">
            <PageBtn disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>«</PageBtn>
            {Array.from({ length: totalPages }, (_, i) => (
            <PageBtn key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</PageBtn>
            ))}
            <PageBtn disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>»</PageBtn>
        </nav>
        )}

        {selectedVideo && (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedVideo.title}
            className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
            onClick={closeVideo}
        >
            <div
            className="relative h-[80vh] w-[92vw] max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            >
            <button
                aria-label="Đóng"
                className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20"
                onClick={closeVideo}
            >
                ✕
            </button>
            <iframe
                title={selectedVideo.title}
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${
                selectedVideo.video_id || extractVideoId(selectedVideo.youtube_url)
                }?autoplay=1&modestbranding=1&rel=0&playsinline=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
            />
            </div>
        </div>
        )}
    </div>
    </section>
);
}

function FilterButton({ active, onClick, label }) {
return (
    <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={[
        "rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none",
        active
        ? "border-transparent bg-gradient-to-r from-rose-500 to-orange-500 text-white"
        : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10",
    ].join(" ")}
    >
    {label}
    </button>
);
}

function PageBtn({ active, disabled, onClick, children }) {
return (
    <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={[
        "min-w-9 rounded-md border px-3 py-2 text-sm font-semibold transition",
        disabled
        ? "cursor-not-allowed border-white/10 text-white/30"
        : active
        ? "border-transparent bg-gradient-to-r from-rose-500 to-orange-500 text-white"
        : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10",
    ].join(" ")}
    >
    {children}
    </button>
);
}
