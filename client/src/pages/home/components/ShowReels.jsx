import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const YOUTUBE_ID = "m4bf5jsjn5k";

const YT_EMBED = `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
const YT_POSTER = `https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`;


export default function ShowReelsStage3D() {
const stageRef = useRef(null);
const [rot, setRot] = useState({ x: 0, y: 0 });
const [play, setPlay] = useState(false);
const [reduceMotion, setReduceMotion] = useState(false);
const [active, setActive] = useState(false);

useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e) => setReduceMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
}, []);

const handlePointerMove = (e) => {
    if (reduceMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;

    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const isMobile = window.innerWidth < 768;
    const max = isMobile ? 5 : 8;

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
        <span className="text-xs uppercase tracking-wider">
            DPI MEDIA • Showreel
        </span>
        </div>

        {/* Stage 3D */}
        <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => {
            setActive(false);
            reset();
        }}
        onPointerUp={() => setActive(false)}
        onPointerDown={() => setActive(true)}
        className="relative grid items-center gap-8 lg:grid-cols-12 [perspective:1200px]"
        >
        <motion.div
            style={{
            transformStyle: "preserve-3d",
            transform: reduceMotion
                ? undefined
                : `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
            transition: active
                ? "transform 60ms linear"
                : "transform 320ms cubic-bezier(.2,.8,.2,1)",
            }}
            className="lg:col-span-12"
        >
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10">
            {/* Background visual – giữ nguyên nhưng copy lại text cho hợp brand */}
            <div className="w-full bg-black/60">
                <div className="mx-auto max-w-full px-4 py-6 md:py-8">
                <div className="relative">
                    <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-white/5 via-transparent to-white/5" />
                    <img
                    src="/showreels/ShowreelsWeb.png"
                    alt="SHOWREEL — DPI MEDIA"
                    width="1920"
                    height="480"
                    className="mx-auto max-h-[240px] w-full object-contain md:max-h-[300px] lg:max-h-[360px] xl:max-h-[420px]"
                    style={{
                        transform: reduceMotion ? undefined : "translateZ(-60px)",
                    }}
                    />
                </div>
                </div>
            </div>

            {/* Content + video */}
            <div className="relative z-10 grid gap-8 px-2 pb-2 pt-1 lg:grid-cols-12">
                {/* LEFT: nội dung thuyết phục */}
                <div
                className="lg:col-span-5"
                style={{
                    transform: reduceMotion ? undefined : "translateZ(50px)",
                }}
                >
                <h2 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">
                    Showreel 2025{" "}
                    <span className="text-white/70">• 60 giây nhìn toàn bộ năng lực</span>
                </h2>

                <p className="mt-3 text-white/80">
                    Chỉ trong 60s, bạn có thể cảm nhận được nhịp dựng, màu sắc, góc máy
                    và cách DPI MEDIA kể câu chuyện cho từng thương hiệu. Đây là cách
                    nhanh nhất để xem chúng tôi có “hợp vibe” với bạn hay không.
                </p>

                {/* Bullet “lý do xem showreel” */}
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                    <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-white/70" />
                    <span>Xem nhanh phong cách dựng & quay của đội ngũ.</span>
                    </li>
                    <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-white/70" />
                    <span>Hình dung rõ DPI MEDIA sẽ làm gì cho thương hiệu của bạn.</span>
                    </li>
                    <li className="flex gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-white/70" />
                    <span>Tiết kiệm thời gian so với việc xem từng video riêng lẻ.</span>
                    </li>
                </ul>

                {/* CTA */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a
                    href="#du-an"
                    className="rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
                    >
                    Xem thêm dự án thực tế
                    </a>
                    <a
                    href="#lien-he"
                    className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-white/20 hover:shadow"
                    >
                    Đặt lịch tư vấn quay dựng
                    </a>
                </div>

                {/* Trust mini */}
                <div className="mt-6 flex flex-wrap gap-6 text-white/80">
                    <div>
                    <div className="text-2xl font-bold">4.9/5</div>
                    <div className="text-xs uppercase tracking-wider">
                        Mức độ hài lòng
                    </div>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div>
                    <div className="text-2xl font-bold">120+</div>
                    <div className="text-xs uppercase tracking-wider">
                        Video / năm
                    </div>
                    </div>
                </div>
                </div>

                {/* RIGHT: video YouTube */}
                <div
                className="lg:col-span-7"
                style={{
                    transform: reduceMotion ? undefined : "translateZ(70px)",
                }}
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
                            alt="Poster showreel DPI MEDIA"
                            width="1280"
                            height="720"
                            loading="lazy"
                            className="h-full w-full object-cover"
                            />
                        </div>
                        <span className="absolute inset-0 grid place-items-center">
                            <span className="inline-grid place-items-center rounded-full bg-white/90 p-5 shadow-lg transition group-hover:scale-105">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-8 w-8 text-gray-900"
                            >
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
                            title="Showreel — DPI MEDIA"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                        </div>
                    )}
                    </div>
                </div>
                <p id="sr-desc" className="mt-3 text-center text-sm text-white/70">
                    Video không tự phát để tránh làm phiền bạn — bấm nút ▶ khi sẵn sàng và bật loa để cảm nhận trọn vẹn nhịp dựng.
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
