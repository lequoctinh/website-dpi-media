import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import axios from "axios";
import "swiper/css";

const API_BASE = "http://localhost:5000";

export default function Backstage() {
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [reduce, setReduce] = useState(false);

useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = (e) => setReduce(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
}, []);

useEffect(() => {
    let mounted = true;
    axios
    .get(`${API_BASE}/api/backstage`)
    .then((res) => {
        if (mounted) setItems(Array.isArray(res.data) ? res.data : []);
    })
    .catch(() => mounted && setItems([]))
    .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
}, []);

return (
    <section id="hau-truong" aria-labelledby="hau-truong-heading" className="relative bg-black">
    <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <header className="mx-auto mb-8 max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Behind the Scenes
        </p>
        <h2 id="hau-truong-heading" className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            Hậu trường <span className="text-white/70">sản xuất</span>
        </h2>
        <p className="mt-3 text-white/70">Những khoảnh khắc trên set – năng lượng, kỷ luật và sáng tạo.</p>
        </header>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent" />

        {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-xl bg-white/5 md:h-60 lg:h-64" />
            ))}
            </div>
        ) : (
            <Swiper
            modules={[Autoplay]}
            slidesPerView="auto"
            spaceBetween={16}
            loop={items.length > 4}
            freeMode={{ enabled: true, momentum: false }}
            speed={6000}
            autoplay={
                reduce
                ? false
                : {
                    delay: 0,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                    }
            }
            className="!pb-2"
            onBeforeInit={(swiper) => {
                swiper.wrapperEl.style.willChange = "transform";
            }}
            >
            {items.map((it, i) => (
                <SwiperSlide
                key={it.id ?? i}
                className="!w-[320px] md:!w-[360px] lg:!w-[400px]"
                >
                <BackstageCard
                    src={`${API_BASE}${it.img}`}
                    alt={it.name || `Behind ${i + 1}`}
                />
                </SwiperSlide>
            ))}
            </Swiper>
        )}
        </div>
    </div>
    </section>
);
}

function BackstageCard({ src, alt }) {
const ref = useRef(null);
const [rot, setRot] = useState({ x: 0, y: 0 });
const [active, setActive] = useState(false);

const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - r.left;
    const cy = (e.clientY ?? e.touches?.[0]?.clientY ?? 0) - r.top;
    const px = cx / r.width;
    const py = cy / r.height;
    const isMobile = window.innerWidth < 768;
    const max = isMobile ? 4 : 8;
    setRot({
    x: (0.5 - py) * max * 2,
    y: (px - 0.5) * max * 2,
    });
};

const reset = () => setRot({ x: 0, y: 0 });

return (
    <figure
    ref={ref}
    className="group relative h-56 w-full overflow-hidden rounded-xl ring-1 ring-white/10 md:h-60 lg:h-64"
    style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        transition: active ? "transform 60ms linear" : "transform 300ms cubic-bezier(.2,.8,.2,1)",
        transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
    }}
    onMouseMove={handleMove}
    onMouseEnter={() => setActive(true)}
    onMouseLeave={() => {
        setActive(false);
        reset();
    }}
    onTouchStart={() => setActive(true)}
    onTouchMove={handleMove}
    onTouchEnd={() => {
        setActive(false);
        reset();
    }}
    >
    <div className="pointer-events-none absolute -inset-px rounded-[14px] bg-gradient-to-tr from-white/30 via-white/10 to-transparent opacity-60 blur-[2px]" />
    <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full select-none object-cover"
        style={{ transform: "translateZ(50px)" }}
    />
    <figcaption
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 text-sm text-white/90"
        style={{ transform: "translateZ(60px)" }}
    >
        {alt}
    </figcaption>
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/20 opacity-0 transition duration-700 group-hover:translate-x-[220%] group-hover:opacity-100" />
    </span>
    </figure>
);
}
