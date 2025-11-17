import React from "react";

export default function BannerHome() {
return (
    <section
    id="trang-chu"
    className="
        relative isolate overflow-hidden
        flex items-center
        min-h-[80vh] md:min-h-screen
        bg-black
        scroll-mt-24 md:scroll-mt-28
    "
    >
    {/* Background image */}
    <img
        src="/bannerhome/C3_00829.png"
        alt="Behind the scenes"
        className="
        pointer-events-none
        absolute inset-0 h-full w-full
        object-cover object-[50%_30%] md:object-center
        brightness-110 md:brightness-100
        contrast-110 md:contrast-100
        "
        loading="eager"
    />

    {/* Overlay: mobile nhẹ hơn, desktop đậm hơn */}
    <div
        className="
        absolute inset-0
        bg-gradient-to-b
        from-black/55 via-black/25 to-black/5
        md:from-black/65 md:via-black/35 md:to-black/10
        backdrop-blur-[1.5px] md:backdrop-blur-[2px]
        "
    />

    {/* Content */}
    <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-6 md:px-8">
        <div className="max-w-3xl">
        <h1
            className="
            text-white font-extrabold leading-tight
            text-[32px] sm:text-[36px] md:text-[44px]
            tracking-tight
            "
        >
            Biến ý thành những{" "}
            <span className="underline decoration-white/80">
            câu chuyện
            </span>{" "}
            có sức ảnh hưởng
        </h1>

        <p className="mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white/90">
            Chúng tôi là đối tác sáng tạo của bạn trong việc sản xuất TVC,
            video doanh nghiệp, nội dung mạng xã hội và nhiều định dạng
            truyền thông mạnh mẽ khác.
        </p>

        <ul className="mt-5 flex flex-wrap gap-2">
            {[
            "TVC / Quảng cáo",
            "Video Doanh nghiệp",
            "Social Media",
            "Hậu trường (BTS)",
            ].map((tag) => (
            <li
                key={tag}
                className="
                rounded-full border border-white/25 bg-black/35
                px-3 py-1
                text-xs sm:text-sm md:text-base
                text-white/90 backdrop-blur
                "
            >
                {tag}
            </li>
            ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
            href="#du-an"
            className="
                inline-flex items-center justify-center
                rounded-xl bg-white px-5 py-3
                text-sm sm:text-base font-semibold text-gray-900
                shadow-lg shadow-black/40
                hover:bg-white/90 active:scale-[0.97]
                transition
            "
            >
            Xem tất cả dự án
            </a>

            <a
            href="#lien-he"
            className="
                inline-flex items-center justify-center
                rounded-xl px-5 py-3
                text-sm sm:text-base font-medium text-white
                ring-1 ring-white/60 bg-black/35
                hover:bg-black/45
                backdrop-blur
                transition
            "
            >
            Liên hệ tư vấn
            </a>
        </div>
        </div>
    </div>

    {/* Fade chân banner */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
    </section>
);
}
