import React from "react";
import { motion } from "framer-motion";

const logos = [
{ src: "/partner/ACHAU.png", alt: "Á Châu" },
{ src: "/partner/ANCUONG.png", alt: "An Cường" },
{ src: "/partner/Bosch_logo.png", alt: "Bosch" },
{ src: "/partner/FStudio.png", alt: "F.Studio" },
{ src: "/partner/Hyundai.png", alt: "Hyundai" },
{ src: "/partner/logo-H.png HUBERT.png", alt: "Hubert" },
{ src: "/partner/PIMA.png", alt: "PIMA" },
{ src: "/partner/SHARP.png", alt: "SHARP" },
{ src: "/partner/SkinPen.png", alt: "SkinPen" },
];

const logoVariants = {
hidden: { opacity: 0, y: 12 },
visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
    delay: 0.05 * i,
    duration: 0.35,
    ease: "easeOut",
    },
}),
};

export default function Partner() {
return (
    <section className="relative bg-black py-16">
    {/* Glow nền nhẹ cho hợp các section khác */}
    <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_360px_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)]"
    />
    <div className="relative mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Đối tác & thương hiệu
        </p>

        <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
            Đối tác đã tin tưởng{" "}
            <span className="text-white/70">DPI Media</span>
        </h2>
        <p className="mt-2 text-sm text-white/70">
            Hơn 120 dự án được thực hiện cùng nhiều thương hiệu ở đa dạng ngành hàng
        </p>
        </div>

        {/* Brand Wall */}
        <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
            relative overflow-hidden rounded-3xl border border-white/12
            bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.14),transparent_55%),rgba(15,23,42,0.95)]
            shadow-[0_18px_70px_rgba(0,0,0,0.95)]
            px-4 py-6 md:px-6 md:py-8
        "
        >
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] md:items-center">
            {/* Khối giới thiệu bên trái */}
            <div className="space-y-4 text-white/80">
            <h3 className="text-lg font-semibold text-white md:text-xl">
                Thương hiệu đồng hành cùng DPI Media
            </h3>
            <p className="text-sm text-white/70">
                Từ nội thất, ô tô, điện máy đến làm đẹp – DPI Media đã thực hiện
                các chiến dịch quay dựng, livestream và nội dung sáng tạo cho nhiều
                doanh nghiệp khác nhau.
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
                <div>
                <div className="text-2xl font-bold text-white">
                    120+
                </div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/60">
                    Dự án / năm
                </div>
                </div>
                <div className="h-10 w-px bg-white/15" />
                <div>
                <div className="text-2xl font-bold text-white">
                    {logos.length}
                </div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/60">
                    Thương hiệu tiêu biểu
                </div>
                </div>
            </div>

            <p className="text-xs text-white/55">
                Logo hiển thị dưới đây chỉ là một phần nhỏ trong số các đối tác
                đã và đang đồng hành cùng DPI Media.
            </p>
            </div>

            {/* Lưới logo bên phải */}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 md:mt-0">
            {logos.map((logo, i) => (
                <motion.div
                key={logo.src + i}
                custom={i}
                variants={logoVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="
                    group flex items-center justify-center
                    rounded-2xl bg-black/50 px-4 py-3
                    ring-1 ring-white/5
                    transition-all duration-300
                    hover:bg-black/70 hover:ring-white/30
                "
                >
                <motion.img
                    src={logo.src}
                    alt={logo.alt}
                    className="
                    max-h-10 w-full max-w-[140px] object-contain
                    opacity-60 grayscale
                    transition-all duration-300
                    group-hover:opacity-100 group-hover:grayscale-0
                    "
                    whileHover={{ scale: 1.06 }}
                />
                </motion.div>
            ))}
            </div>
        </div>
        </motion.div>
    </div>
    </section>
);
}
