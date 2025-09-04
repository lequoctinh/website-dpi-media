import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const YOUTUBE_ID = "-dr-wvPjGFo";
const YT_EMBED = `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
const YT_POSTER = `https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`;

export default function ShowReelsStage3D() {
const stageRef = useRef(null);
const [rot, setRot] = useState({ x: 0, y: 0 });
const [play, setPlay] = useState(false);
const [reduceMotion, setReduceMotion] = useState(false);
const [active, setActive] = useState(false); // đang chạm/drag để mượt hơn

useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = e => setReduceMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
}, []);

// pointer works for cả chuột & touch
const handlePointerMove = (e) => {
    if (reduceMotion) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches?.[0]?.clientX);
    const clientY = e.clientY ?? (e.touches?.[0]?.clientY);
    if (clientX == null || clientY == null) return;

    const px = (clientX - rect.left) / rect.width;   // 0..1
    const py = (clientY - rect.top) / rect.height;   // 0..1

    // mobile góc nhỏ hơn để đỡ chóng mặt
    const isMobile = window.innerWidth < 768;
    const max = isMobile ? 5 : 8; // độ nghiêng tối đa
    setRot({
    x: (0.5 - py) * max * 2,
    y: (px - 0.5) * max * 2,
    });
};

const reset = () => setRot({ x: 0, y: 0 });

const onKeyPlay = (e) => {
    if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    setPlay(true);
    }
};

return (
    <section className="relative bg-black">
    {/* light bloom nhẹ */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.14),transparent_70%)]" />
    <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-20">
        {/* Kicker theo brand */}
        <div className="mb-6 flex items-center gap-2 text-white/80">
        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
        <span className="text-xs uppercase tracking-wider">DPI MEDIA • Showreel</span>
        </div>

        {/* Stage 3D */}
        <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => { setActive(false); reset(); }}
        onPointerUp={() => setActive(false)}
        onPointerDown={() => setActive(true)}
        className="relative grid items-center gap-8 lg:grid-cols-12 [perspective:1200px]"
        >
        {/* Khối tổng nghiêng theo pointer (desktop + mobile) */}
        <motion.div
            style={{
            transformStyle: "preserve-3d",
            transform: reduceMotion
                ? undefined
                : `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
            transition: active ? "transform 60ms linear" : "transform 320ms cubic-bezier(.2,.8,.2,1)"
            }}
            className="lg:col-span-12"
        >
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10">
            {/* Ảnh nền: luôn HIỂN THỊ ĐẦY ĐỦ */}
            <div className="w-full bg-black/60">
                <div className="mx-auto max-w-full px-4 py-6 md:py-8">
                <div className="relative">
                    <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-white/5 via-transparent to-white/5" />
                    <img
                    src="/showreels/ShowreelsWeb.png"
                    alt="SHOWREELS — DPI MEDIA"
                    width="1920"
                    height="480"
                    className="mx-auto max-h-[240px] w-full object-contain md:max-h-[300px] lg:max-h-[360px] xl:max-h-[420px]"
                    style={{ transform: reduceMotion ? undefined : "translateZ(-60px)" }}
                    />
                </div>
                </div>
            </div>

            {/* Lưới nội dung + video (nổi) */}
            <div className="relative z-10 grid gap-8 px-2 pb-2 pt-1 lg:grid-cols-12">
                {/* Content trái */}
                <div
                className="lg:col-span-5"
                style={{ transform: reduceMotion ? undefined : "translateZ(50px)" }}
                >
                <h2 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">
                    Showreel 2024 — <span className="text-white/70">60s</span>
                </h2>
                <p className="mt-3 text-white/80">
                    DPI Media chuyên dựng video ngắn gọn, “đã mắt” và đúng cảm xúc thương hiệu.
                    Trải nghiệm xem được tối ưu: tải nhẹ, phát khi bạn muốn, hỗ trợ bàn phím
                    và tôn trọng tuỳ chọn giảm chuyển động.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a
                    href="#portfolio"
                    className="rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
                    >
                    Dự án tiêu biểu
                    </a>
                    <a
                    href="#contact"
                    className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-white/20 hover:shadow"
                    >
                    Nhận báo giá nhanh
                    </a>
                </div>

                {/* trust mini */}
                <div className="mt-6 flex gap-6 text-white/80">
                    <div>
                    <div className="text-2xl font-bold">4.9/5</div>
                    <div className="text-xs uppercase tracking-wider">Đánh giá khách hàng</div>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div>
                    <div className="text-2xl font-bold">+120</div>
                    <div className="text-xs uppercase tracking-wider">Video đã thực hiện</div>
                    </div>
                </div>
                </div>

                {/* Video phải */}
                <div
                className="lg:col-span-7"
                style={{ transform: reduceMotion ? undefined : "translateZ(70px)" }}
                >
                <div className="relative">
                    <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-white/35 via-white/10 to-transparent blur-sm" />
                    <div className="relative overflow-hidden rounded-3xl bg-black ring-1 ring-white/15 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
                    {!play ? (
                        <button
                        type="button"
                        onClick={() => setPlay(true)}
                        onKeyDown={onKeyPlay}
                        aria-label="Phát showreel"
                        className="group relative block w-full focus:outline-none"
                        >
                        <div className="aspect-[16/9] w-full">
                            <img
                            src={YT_POSTER}
                            alt="Poster showreel"
                            width="1280"
                            height="720"
                            loading="lazy"
                            className="h-full w-full object-cover"
                            />
                        </div>
                        <span className="absolute inset-0 grid place-items-center">
                            <span className="inline-grid place-items-center rounded-full bg-white/90 p-5 shadow-lg transition group-hover:scale-105">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-gray-900">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            </span>
                        </span>
                        </button>
                    ) : (
                        <div className="aspect-[16/9] w-full">
                        <iframe
                            className="h-full w-full"
                            src={YT_EMBED}
                            title="Showreel — DPI Media"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                        </div>
                    )}
                    </div>
                </div>
                <p id="sr-desc" className="mt-3 text-center text-sm text-white/70">
                    Tip: bật loa 🎧 để cảm nhận trọn vẹn nhịp dựng.
                </p>
                </div>
            </div>
            </div>
        </motion.div>
        </div>
    </div>
    </section>
);
}
