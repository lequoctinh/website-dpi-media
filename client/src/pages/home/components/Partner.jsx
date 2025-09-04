import React from "react";
import { motion } from "framer-motion";

// danh sách logo
const logos = [
{ src: "/partner/ANCUONG.png", alt: "An Cường" },
{ src: "/partner/Bosch_logo.png", alt: "Bosch" },
{ src: "/partner/estudio-logo.png", alt: "F.Studio" },
{ src: "/partner/hyundai-logo.png", alt: "Hyundai" },
{ src: "/partner/hubert-logo.png", alt: "Hubert" },
{ src: "/partner/Pima-logo.png", alt: "PIMA" },
{ src: "/partner/SHARP.png", alt: "SHARP" },
{ src: "/partner/skinpen-logo.png", alt: "SkinPen" },
];

export default function Partner() {
return (
    <section className="relative bg-black py-16">
    <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
            Đối tác đã tin tưởng <span className="text-white/70">DPI Media</span>
        </h2>
        <p className="mt-2 text-sm text-white/70">
            Hơn 120 dự án được thực hiện cùng nhiều thương hiệu hàng đầu
        </p>
        </div>

        {/* Banner container */}
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden py-6">
        {/* Fade mask 2 bên cho mượt */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent" />

        {/* Slider logo */}
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
                className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition"
                whileHover={{ scale: 1.1 }}
            />
            ))}
        </motion.div>
        </div>
    </div>
    </section>
);
}
