import React from "react";
import { motion } from "framer-motion";

// danh sách logo
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
        <h2 className="text-2xl font-bold text-white md:text-3xl">
            Đối tác đã tin tưởng <span className="text-white/70">DPI Media</span>
        </h2>
        <p className="mt-2 text-sm text-white/70">
            Hơn 120 dự án được thực hiện cùng nhiều thương hiệu hàng đầu
        </p>
        </div>

        {/* Banner container */}
        <div className="relative rounded-2xl border border-white/10 bg-[rgba(111,108,108,0.25)] shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden py-6">
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
