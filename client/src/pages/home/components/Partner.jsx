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

export default function Partner() {
return (
    <section className="relative bg-black py-16">
    <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Đối tác & thương hiệu
        </p>

        <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
            Đối tác đã tin tưởng <span className="text-white/70">DPI Media</span>
        </h2>
        <p className="mt-2 text-sm text-white/70">
            Hơn 120 dự án được thực hiện cùng nhiều thương hiệu hàng đầu
        </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[rgba(111,108,108,0.25)] py-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <motion.div
            className="flex gap-16"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
            repeat: Infinity,
            duration: 30,
            ease: "linear",
            }}
        >
            {[...logos, ...logos].map((logo, i) => (
            <motion.img
                key={i}
                src={logo.src}
                alt={logo.alt}
                className="h-12 w-auto object-contain opacity-70 transition hover:opacity-100"
                whileHover={{ scale: 1.1 }}
            />
            ))}
        </motion.div>
        </div>
    </div>
    </section>
);
}
