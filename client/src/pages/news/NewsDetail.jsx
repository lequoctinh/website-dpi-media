import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/api";
import parse from "html-react-parser";

const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || "").replace(/\/+$/, "");
const joinAsset = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p)) return p;
const path = String(p).startsWith("/") ? p : `/${p}`;
return `${ASSET_BASE}${path}`;
};

export default function NewsDetail() {
const { slug } = useParams();
const [post, setPost] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
    setLoading(true);
    api.get(`/bai-viet/${slug}`)
    .then((res) => {
        setPost(res.data);
        api.patch(`/bai-viet/${res.data.id}/view`).catch(() => {});
    })
    .catch(() => setPost(null))
    .finally(() => setLoading(false));
    
    window.scrollTo({ top: 0, behavior: "smooth" });
}, [slug]);

if (loading) return (
    <div className="flex h-screen items-center justify-center bg-black">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
    </div>
);

if (!post) return (
    <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
    <h2 className="text-xl font-bold opacity-50 uppercase tracking-widest text-zinc-500">Bài viết không tồn tại</h2>
    <Link to="/" className="mt-6 bg-white/5 border border-white/10 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand transition-all">Quay lại trang chủ</Link>
    </div>
);

return (
    <div className="min-h-screen bg-black text-white pb-24 pt-32 selection:bg-brand selection:text-white">
    {/* Background Decor */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_0%,rgba(255,255,255,0.03),transparent)]" />

    <div className="relative mx-auto max-w-4xl px-6">
        
        {/* CATEGORY & DATE */}
        <div className="mb-6 flex items-center justify-center md:justify-start gap-3">
        <span className="bg-brand/10 text-brand border border-brand/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.2em]">
            {post.categoryName || "DPI MEDIA STORY"}
        </span>
        <div className="h-[1px] w-6 bg-white/10" />
        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
            {new Date(post.published_at).toLocaleDateString("vi-VN")}
        </span>
        </div>

        {/* TITLE */}
        <header className="mb-10 text-center md:text-left">
        <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            {post.title}
        </h2>
    
        <div className="flex flex-col md:flex-row items-center gap-4 border-y border-white/5 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-400">
            <div className="flex items-center gap-2">
            <span className="text-zinc-600 italic">By</span>
            <span className="text-white">{post.author}</span>
            </div>
            <div className="hidden md:block h-3 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
            <span>👁️ {post.views.toLocaleString()} Lượt xem</span>
            </div>
            <div className="md:ml-auto text-brand/80 italic tracking-normal normal-case">
            DPI MEDIA Agency Studio
            </div>
        </div>
        </header>

        {/* THUMBNAIL */}
        {post.thumbnail && (
        <div className="mb-16 overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-zinc-900">
            <img 
            src={joinAsset(post.thumbnail)} 
            alt={post.title} 
            className="w-full object-cover transition-transform duration-1000 hover:scale-[1.02]" 
            />
        </div>
        )}

        {/* CONTENT AREA */}
        <div className="prose prose-invert prose-brand max-w-none 
        prose-p:text-zinc-300 prose-p:text-base md:prose-p:text-[18px] prose-p:leading-[1.8] prose-p:mb-8
        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
        prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
        prose-img:rounded-2xl prose-img:border prose-img:border-white/10
        prose-strong:text-white prose-a:text-brand prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-brand prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
        prose-li:text-zinc-300">
        {parse(post.content || "")}
        </div>

        <footer className="mt-20 border-t border-white/10 pt-16">
            
            <div className="flex justify-center mb-16">
            <Link 
                to="/tin-tuc" 
                className="group flex flex-col items-center gap-3 transition-all"
            >
                <div className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-white transition-colors">Xem tất cả bài viết</span>
            </Link>
            </div>

            <div className="text-center mb-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600">Connect with DPI MEDIA</h4>
            </div>

            <div className="flex items-center justify-center gap-4">
                <a
                href="https://www.facebook.com/Dpistudio.vn?locale=vi_VN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/80 transition-all hover:bg-white/15 hover:text-[#1877F2] hover:scale-110"
                >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M13.5 22v-7h2.4a1 1 0 0 0 .98-.8l.6-3a1 1 0 0 0-.98-1.2H13.5V7.5c0-.83.17-1.2 1.3-1.2h1.6a1 1 0 0 0 1-.88l.3-2a1 1 0 0 0-.99-1.12h-2.4C10.9 2.3 9.5 3.9 9.5 7v3H7.5a1 1 0 0 0-1 .8l-.6 3A1 1 0 0 0 7 14.8h2.5v7a.2.2 0 0 0 .2.2h3.6a.2.2 0 0 0 .2-.2Z" />
                </svg>
                </a>

                <a
                href="https://www.youtube.com/@DPIMedia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/80 transition-all hover:bg-white/15 hover:text-[#FF0000] hover:scale-110"
                >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 9 2 12 2 12s0 3 .4 4.8c.2.9.9 1.6 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.8.4-4.8.4-4.8s0-3-.4-4.8ZM10.5 15.2v-6l4.5 3-4.5 3Z" />
                </svg>
                </a>

                <a
                href="https://zalo.me/0365701415"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/80 transition-all hover:bg-white/15 hover:text-[#0068FF] hover:scale-110"
                >
                <svg
                    id="svg_zalo_icon"
                    viewBox="0 0 614.501 613.667"
                    aria-hidden="true"
                    className="h-5 w-5"
                >
                    <path
                    fill="currentColor"
                    d="M464.721,301.399c-13.984-0.014-23.707,11.478-23.944,28.312c-0.251,17.771,9.168,29.208,24.037,29.202   c14.287-0.007,23.799-11.095,24.01-27.995C489.028,313.536,479.127,301.399,464.721,301.399z"
                    />
                    <path
                    fill="currentColor"
                    d="M291.83,301.392c-14.473-0.316-24.578,11.603-24.604,29.024c-0.02,16.959,9.294,28.259,23.496,28.502   c15.072,0.251,24.592-10.87,24.539-28.707C315.214,313.318,305.769,301.696,291.83,301.392z"
                    />
                    <path
                    fill="currentColor"
                    d="M310.518,3.158C143.102,3.158,7.375,138.884,7.375,306.3s135.727,303.142,303.143,303.142   c167.415,0,303.143-135.727,303.143-303.142S477.933,3.158,310.518,3.158z M217.858,391.083   c-33.364,0.818-66.828,1.353-100.133-0.343c-21.326-1.095-27.652-18.647-14.248-36.583c21.55-28.826,43.886-57.065,65.792-85.621   c2.546-3.305,6.214-5.996,7.15-12.705c-16.609,0-32.784,0.04-48.958-0.013c-19.195-0.066-28.278-5.805-28.14-17.652   c0.132-11.768,9.175-17.329,28.397-17.348c25.159-0.026,50.324-0.06,75.476,0.026c9.637,0.033,19.604,0.105,25.304,9.789   c6.22,10.561,0.284,19.512-5.646,27.454c-21.26,28.497-43.015,56.624-64.559,84.902c-2.599,3.41-5.119,6.88-9.453,12.725   c23.424,0,44.123-0.053,64.816,0.026c8.674,0.026,16.662,1.873,19.941,11.267C237.892,379.329,231.368,390.752,217.858,391.083z    M350.854,330.211c0,13.417-0.093,26.841,0.039,40.265c0.073,7.599-2.599,13.647-9.512,17.084   c-7.296,3.642-14.71,3.028-20.304-2.968c-3.997-4.281-6.214-3.213-10.488-0.422c-17.955,11.728-39.908,9.96-56.597-3.866   c-29.928-24.789-30.026-74.803-0.211-99.776c16.194-13.562,39.592-15.462,56.709-4.143c3.951,2.619,6.201,4.815,10.396-0.053   c5.39-6.267,13.055-6.761,20.271-3.357c7.454,3.509,9.935,10.165,9.776,18.265C350.67,304.222,350.86,317.217,350.854,330.211z    M395.617,369.579c-0.118,12.837-6.398,19.783-17.196,19.908c-10.779,0.132-17.593-6.966-17.646-19.512   c-0.179-43.352-0.185-86.696,0.007-130.041c0.059-12.256,7.302-19.921,17.896-19.222c11.425,0.752,16.992,7.448,16.992,18.833   c0,22.104,0,44.216,0,66.327C395.677,327.105,395.828,348.345,395.617,369.579z M463.981,391.868   c-34.399-0.336-59.037-26.444-58.786-62.289c0.251-35.66,25.304-60.713,60.383-60.396c34.631,0.304,59.374,26.306,58.998,61.986   C524.207,366.492,498.534,392.205,463.981,391.868z"
                    />
                </svg>
                </a>
            </div>
        </footer>
    </div>
    </div>
);
}