import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../api/api";

// Build URL ảnh từ path DB
const ASSET_BASE = (import.meta.env.VITE_ASSET_BASE || "")
.replace(/\/+$/, "");

const toImgUrl = (p) => {
if (!p) return "";
if (/^https?:\/\//i.test(p) || p.startsWith("//")) return p;
const path = String(p).startsWith("/") ? p : `/${p}`;
return `${ASSET_BASE}${path}`;
};

const logoVariants = {
hidden: { opacity: 0, y: 10, scale: 0.96 },
visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
    delay: 0.03 * i,
    duration: 0.35,
    ease: "easeOut",
    },
}),
};

const normalizePartner = (row = {}) => ({
id: row.id,
name: row.name,
logo: row.logo,
industry: row.industry,
website_url: row.website_url,
});

const PAGE_SIZE = 8; // mỗi trang hiển thị 8 logo

export default function Partner() {
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(0);

useEffect(() => {
    let mounted = true;

    (async () => {
    try {
        setLoading(true);
        const res = await api.get("/partners", {
        params: {
            status: "hien", 
            home: 1,        
        },
        });

        const raw = Array.isArray(res.data?.data) ? res.data.data : [];
        if (!mounted) return;
        setItems(raw.map(normalizePartner));
    } catch (err) {
        console.error("Load partners failed:", err);
        if (!mounted) setItems([]);
    } finally {
        if (mounted) setLoading(false);
    }
    })();

    return () => {
    mounted = false;
    };
}, []);

const hasData = useMemo(() => items.length > 0, [items.length]);

const pages = useMemo(() => {
    if (!items.length) return [];
    const chunks = [];
    for (let i = 0; i < items.length; i += PAGE_SIZE) {
    chunks.push(items.slice(i, i + PAGE_SIZE));
    }
    return chunks;
}, [items]);

const industries = useMemo(() => {
    const s = new Set();
    items.forEach((it) => {
    if (it.industry) s.add(it.industry);
    });
    return Array.from(s).slice(0, 5);
}, [items]);

useEffect(() => {
    if (!pages.length) return;
    if (page >= pages.length) setPage(0);

    const timer = setInterval(() => {
    setPage((prev) => (prev + 1) % pages.length);
    }, 4800);

    return () => clearInterval(timer);
}, [pages.length, page]);

return (
    <section className="relative bg-black py-16">
    <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_360px_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)]"
    />
    <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Đối tác & thương hiệu
        </p>

        <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
            Đối tác đã đồng hành cùng{" "}
            <span className="text-white/70">DPI MEDIA</span>
        </h2>
        <p className="mt-2 text-sm text-white/70 max-w-xl mx-auto">
            Đơn vị sản xuất nội dung, thương hiệu, doanh nghiệp ở đa dạng lĩnh vực
            đã lựa chọn DPI MEDIA cho các chiến dịch truyền thông, TVC, livestream
            và nội dung số.
        </p>
        <div className="mx-auto mt-4 mb-2 h-1 w-20 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" />

        </div>

        {loading ? (
        <div className="rounded-3xl border border-white/12 bg-black/60 px-4 py-10 text-center text-sm text-white/60">
            Đang tải danh sách đối tác…
        </div>
        ) : !hasData ? (
        <div className="rounded-3xl border border-white/12 bg-black/60 px-4 py-10 text-center text-sm text-white/60">
            Chưa có đối tác nào được cấu hình hiển thị.
        </div>
        ) : (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="
            relative overflow-hidden rounded-3xl border border-white/10
            bg-black/60 backdrop-blur-md
            shadow-[0_20px_70px_rgba(0,0,0,0.85)]
            px-5 py-6 md:px-8 md:py-8
            "
        >
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 text-left max-w-xl">
                <h3 className="text-lg font-semibold text-white md:text-xl">
                Thương hiệu tin tưởng DPI MEDIA
                </h3>
                <p className="text-sm text-white/70">
                Chúng tôi đồng hành cùng doanh nghiệp trong việc xây dựng hình ảnh,
                kể câu chuyện thương hiệu và lan tỏa thông điệp qua video, hình ảnh,
                TVC, livestream và nội dung digital.
                </p>
                {industries.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {industries.map((ind) => (
                    <span
                        key={ind}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70"
                    >
                        {ind}
                    </span>
                    ))}
                </div>
                )}
            </div>

            <div className="flex gap-6 text-sm text-white/80">
                <div>
                <div className="text-2xl font-bold text-white leading-tight">
                    120+
                </div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/60">
                    Chiến dịch mỗi năm
                </div>
                </div>
                <div className="h-10 w-px bg-white/15" />
                <div>
                <div className="text-2xl font-bold text-white leading-tight">
                    {items.length}
                </div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/60">
                    Đối tác tiêu biểu
                </div>
                </div>
            </div>
            </div>

            <div className="space-y-4">
            <div className="relative overflow-hidden min-h-[120px] md:min-h-[150px]">
                <AnimatePresence mode="wait">
                <motion.div
                    key={page}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="
                    grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                    gap-4 md:gap-5
                    "
                >
                    {pages[page].map((logo, i) => {
                    const imgEl = (
                        <motion.img
                        src={toImgUrl(logo.logo)}
                        alt={logo.name || "Partner"}
                        className="
                            max-h-10 w-full max-w-[150px] object-contain
                            opacity-100
                            transition-all duration-300
                            drop-shadow-[0_0_12px_rgba(0,0,0,0.7)]
                        "
                        whileHover={{ scale: 1.06 }}
                        />
                    );

                    const inner = logo.website_url ? (
                        <a
                        href={logo.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-full"
                        aria-label={logo.name || "Partner"}
                        >
                        {imgEl}
                        </a>
                    ) : (
                        imgEl
                    );

                    return (
                        <motion.div
                        key={logo.id || logo.logo || i}
                        custom={i}
                        variants={logoVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="
                            flex items-center justify-center
                            rounded-2xl px-4 py-3
                            bg-white/5
                            ring-1 ring-white/10
                            transition-all duration-300
                            hover:-translate-y-1 hover:bg-white/12 hover:ring-[rgba(255,255,255,0.55)]
                            hover:shadow-[0_16px_40px_rgba(0,0,0,0.75)]
                        "
                        >
                        {inner}
                        </motion.div>
                    );
                    })}
                </motion.div>
                </AnimatePresence>
            </div>

            {pages.length > 1 && (
                <div className="flex justify-center gap-2 pt-1">
                {pages.map((_, idx) => (
                    <button
                    key={idx}
                    type="button"
                    onClick={() => setPage(idx)}
                    className={`
                        h-1.5 rounded-full transition-all duration-300
                        ${idx === page ? "w-5 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}
                    `}
                    aria-label={`Trang logo ${idx + 1}`}
                    />
                ))}
                </div>
            )}
            </div>

            <p className="mt-5 text-xs text-white/45 text-left">
            * Danh sách trên chỉ là một phần đối tác đã hợp tác cùng DPI MEDIA ở
            nhiều định dạng: TVC, viral clip, social video, livestream, sự kiện
            và các hoạt động truyền thông khác.
            </p>
        </motion.div>
        )}
    </div>
    </section>
);
}
