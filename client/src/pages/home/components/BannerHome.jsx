import React from "react";

export default function BannerHome() {
return (
    <section
    id="trang-chu"
    className="
        relative isolate
        min-h-[80vh] md:min-h-screen
        flex items-center
        scroll-mt-24 md:scroll-mt-28
    "
    >
    <img
        src="/bannerhome/C3_00829.png"
        alt="Behind the scenes"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
    />

    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/10 backdrop-blur-[2px]" />

    {/* Content */}
    <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-8">
        <div className="max-w-3xl">
        <h1 className="text-white font-extrabold leading-tight
                        text-3xl sm:text-4xl md:text-5xl">
            Biến ý thành những <span className="underline decoration-white/70">câu chuyện</span> có sức ảnh hưởng
        </h1>

        <p className="mt-4 text-white/90 text-base sm:text-lg md:text-xl max-w-2xl">
            Chúng tôi là đối tác sáng tạo của bạn trong việc sản xuất TVC, video doanh nghiệp,
            nội dung mạng xã hội và nhiều định dạng truyền thông mạnh mẽ khác.
        </p>

        <ul className="mt-5 flex flex-wrap gap-2">
            {["TVC / Quảng cáo", "Video Doanh nghiệp", "Social Media", "Hậu trường (BTS)"].map((tag) => (
            <li key={tag}
                className="text-white/90 text-sm md:text-base rounded-full border border-white/25 bg-white/10 px-3 py-1 backdrop-blur">
                {tag}
            </li>
            ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
            href="#du-an"
            className="inline-flex items-center justify-center rounded-xl
                        bg-white text-gray-900 px-5 py-3 font-semibold shadow-lg
                        hover:bg-white/90 active:scale-[0.98] transition"
            >
            Xem tất cả dự án
            </a>

            <a
            href="#lien-he"
            className="inline-flex items-center justify-center rounded-xl
                        ring-1 ring-white/50 bg-white/10 text-white px-5 py-3 font-medium
                        hover:bg-white/20 transition"
            >
            Liên hệ tư vấn
            </a>
        </div>
        </div>
    </div>

    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
    </section>
);
}
