import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");

export default function Contact() {
const [email, setEmail] = useState("");
const [status, setStatus] = useState({ type: "", msg: "" });
const [loading, setLoading] = useState(false);
const abortRef = useRef(null);

// ---- GIỮ LOGIC CŨ ----
const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()),
    [email]
);

useEffect(() => {
    return () => {
    abortRef.current?.abort?.();
    };
}, []);

const onSubmit = async (e) => {
    e.preventDefault();

    const value = email.trim();
    if (!value || !isValidEmail || loading) return;

    setLoading(true);
    setStatus({ type: "", msg: "" });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
    const res = await fetch(`${API_BASE}/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
        signal: controller.signal,
    });

    let data = null;
    const text = await res.text();
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { message: text };
    }

    if (!res.ok) {
        throw new Error(data?.error || data?.message || "Send failed");
    }

    setStatus({ type: "ok", msg: "✅ Đăng ký thành công! Cảm ơn bạn." });
    setEmail("");
    } catch (err) {
    if (err.name === "AbortError") return;
    setStatus({
        type: "err",
        msg:
        (err?.message?.includes("Failed to fetch") &&
            "❌ Không thể kết nối máy chủ. Kiểm tra API_BASE/CORS.") ||
        `❌ Gửi thất bại. ${err?.message || "Vui lòng thử lại."}`,
    });
    } finally {
    setLoading(false);
    abortRef.current = null;
    }
};
// ---- HẾT PHẦN LOGIC ----

return (
    <section
    id="lien-he"
    aria-labelledby="contact-heading"
    className="relative bg-black"
    >
    {/* glow nền nhẹ */}
    <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_-20%,rgba(255,255,255,.10),transparent)]"
    />

    <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-20">
        {/* HEADER */}
        <header className="mb-10 text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Liên hệ & Booking
        </p>
        <h2
            id="contact-heading"
            className="mt-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-3xl font-extrabold leading-tight text-transparent md:text-4xl"
        >
            Đặt lịch quay / sản xuất nội dung cùng{" "}
            <span className="text-white">DPI Media</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base text-white/70">
            Cho chúng tôi biết cách liên lạc và loại nội dung bạn đang cần. Đội
            ngũ tư vấn sẽ phản hồi trong vòng <strong>24 giờ làm việc</strong>.
        </p>
        </header>

        {/* LAYOUT 2 CỘT */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
        {/* CỘT TRÁI: story + info nhanh */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-[#ff5a7b] to-[#ff8a1a] opacity-25 blur-3xl" />
            <div className="relative">
            <h3 className="text-lg md:text-xl font-semibold text-white">
                Bạn chia sẻ brief, DPI Media lo phần còn lại
            </h3>
            <p className="mt-3 text-sm text-white/70">
                Dù bạn đang chuẩn bị{" "}
                <span className="text-white/90">
                TVC, video doanh nghiệp, social clip
                </span>{" "}
                hay nội dung hậu trường, chúng tôi luôn bắt đầu bằng việc hiểu
                rõ:
            </p>

            <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#ff5a7b] to-[#ff8a1a]" />
                <span>Mục tiêu chiến dịch & đối tượng khán giả.</span>
                </li>
                <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#ff5a7b] to-[#ff8a1a]" />
                <span>Giọng nói thương hiệu & bối cảnh sử dụng video.</span>
                </li>
                <li className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#ff5a7b] to-[#ff8a1a]" />
                <span>Ngân sách, timeline và định dạng ưu tiên.</span>
                </li>
            </ul>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm text-white/80">
                <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">
                    Booking & tư vấn
                </p>
                <p className="mt-1 font-semibold text-white">
                    (+84) 98 256 19 14
                </p>
                <a
                    href="mailto:info@dpimedia.pro"
                    className="mt-1 inline-flex text-xs text-white/70 underline underline-offset-4 hover:text-white"
                >
                    info@dpimedia.pro
                </a>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">
                    Studio / Văn phòng
                </p>
                <p className="mt-1 text-white/80">
                    Số 5 đường số 17B,
                    <br />
                    P. Bình Hưng Hoà, Q. Bình Tân, HCM
                </p>
                </div>
            </div>

            <p className="mt-5 text-xs text-white/50">
                Không có brief hoàn hảo ngay từ đầu. Cứ chia sẻ những gì bạn
                đang có, DPI Media sẽ giúp bạn “gỡ rối” và đề xuất cấu trúc
                video phù hợp.
            </p>
            </div>
        </div>

        {/* CỘT PHẢI: form + social */}
        <div className="flex flex-col gap-4">
            {/* CARD FORM */}
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,.12),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(255,138,26,.20),transparent_55%),rgba(0,0,0,.85)] p-6 md:p-7 shadow-[0_18px_60px_rgba(0,0,0,.85)]">
            <div className="relative">
                <h3 className="text-base md:text-lg font-semibold text-white">
                Để lại email, chúng tôi sẽ gửi gợi ý khung video & báo giá
                tham khảo
                </h3>
                <p className="mt-2 text-xs md:text-sm text-white/75">
                Chỉ cần một email liên hệ, DPI Media sẽ gửi tài liệu tóm tắt
                kèm vài case study phù hợp với ngành hàng của bạn.
                </p>

                <form
                onSubmit={onSubmit}
                noValidate
                className="mt-4 space-y-3"
                >
                <div className="flex gap-2 max-md:flex-col">
                    <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full border border-white/20 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/60"
                    aria-invalid={email && !isValidEmail ? "true" : "false"}
                    />
                    <button
                    type="submit"
                    disabled={loading || !isValidEmail}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff5a7b] to-[#ff8a1a] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,.6)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    {loading ? "Đang gửi…" : "Nhận tư vấn nhanh"}
                    </button>
                </div>

                {status.msg && (
                    <p
                    className={`text-xs md:text-sm ${
                        status.type === "ok"
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                    >
                    {status.msg}
                    </p>
                )}
                </form>

                <p className="mt-3 text-[11px] text-white/50">
                Bằng việc để lại email, bạn đồng ý cho DPI Media liên hệ lại
                về dịch vụ quay – dựng – livestream. Không spam, không bán
                dữ liệu.
                </p>
            </div>
            </div>

            {/* CARD SOCIAL */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 flex flex-col items-center text-center">
            <p className="text-xs uppercase tracking-wide text-white/55">
                Theo dõi DPI Media
            </p>
            <p className="mt-1 text-sm text-white/80">
                Hậu trường, tips dựng hình & dự án mới được cập nhật thường
                xuyên trên social.
            </p>

            <div className="mt-4 flex items-center justify-center gap-4">
                {/* Facebook */}
                <a
                href="https://www.facebook.com/Dpistudio.vn?locale=vi_VN"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook DPI Media"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-white/80 transition-colors hover:bg-white/15 hover:text-[#1877F2]"
                >
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                >
                    <path d="M13.5 22v-7h2.4a1 1 0 0 0 .98-.8l.6-3a1 1 0 0 0-.98-1.2H13.5V7.5c0-.83.17-1.2 1.3-1.2h1.6a1 1 0 0 0 1-.88l.3-2a1 1 0 0 0-.99-1.12h-2.4C10.9 2.3 9.5 3.9 9.5 7v3H7.5a1 1 0 0 0-1 .8l-.6 3A1 1 0 0 0 7 14.8h2.5v7a.2.2 0 0 0 .2.2h3.6a.2.2 0 0 0 .2-.2Z" />
                </svg>
                </a>

                {/* YouTube */}
                <a
                href="https://www.youtube.com/@DPIMedia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube DPI Media"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-white/80 transition-colors hover:bg-white/15 hover:text-[#FF0000]"
                >
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                >
                    <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 9 2 12 2 12s0 3 .4 4.8c.2.9.9 1.6 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.8.4-4.8.4-4.8s0-3-.4-4.8ZM10.5 15.2v-6l4.5 3-4.5 3Z" />
                </svg>
                </a>

                {/* Zalo */}
                <a
                href="https://zalo.me/0365701415"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zalo DPI Media"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-white/80 transition-colors hover:bg-white/15 hover:text-[#0068FF]"
                >
                <svg
                    id="svg_zalo_icon"
                    viewBox="0 0 614.501 613.667"
                    aria-hidden="true"
                    className="h-5 w-5"
                >
                    <path
                    fill="currentColor"
                    d="M464.721,301.399c-13.984-0.014-23.707,11.478-23.944,28.312c-0.251,17.771,9.168,29.208,24.037,29.202   c14.287-0.007,23.799-11.095,24.01-27.995C489.028,313.536,479.127,301.399,464.721,301.399z"
                    />
                    <path
                    fill="currentColor"
                    d="M291.83,301.392c-14.473-0.316-24.578,11.603-24.604,29.024c-0.02,16.959,9.294,28.259,23.496,28.502   c15.072,0.251,24.592-10.87,24.539-28.707C315.214,313.318,305.769,301.696,291.83,301.392z"
                    />
                    <path
                    fill="currentColor"
                    d="M310.518,3.158C143.102,3.158,7.375,138.884,7.375,306.3s135.727,303.142,303.143,303.142   c167.415,0,303.143-135.727,303.143-303.142S477.933,3.158,310.518,3.158z M217.858,391.083   c-33.364,0.818-66.828,1.353-100.133-0.343c-21.326-1.095-27.652-18.647-14.248-36.583c21.55-28.826,43.886-57.065,65.792-85.621   c2.546-3.305,6.214-5.996,7.15-12.705c-16.609,0-32.784,0.04-48.958-0.013c-19.195-0.066-28.278-5.805-28.14-17.652   c0.132-11.768,9.175-17.329,28.397-17.348c25.159-0.026,50.324-0.06,75.476,0.026c9.637,0.033,19.604,0.105,25.304,9.789   c6.22,10.561,0.284,19.512-5.646,27.454c-21.26,28.497-43.015,56.624-64.559,84.902c-2.599,3.41-5.119,6.88-9.453,12.725   c23.424,0,44.123-0.053,64.816,0.026c8.674,0.026,16.662,1.873,19.941,11.267C237.892,379.329,231.368,390.752,217.858,391.083z    M350.854,330.211c0,13.417-0.093,26.841,0.039,40.265c0.073,7.599-2.599,13.647-9.512,17.084   c-7.296,3.642-14.71,3.028-20.304-2.968c-3.997-4.281-6.214-3.213-10.488-0.422c-17.955,11.728-39.908,9.96-56.597-3.866   c-29.928-24.789-30.026-74.803-0.211-99.776c16.194-13.562,39.592-15.462,56.709-4.143c3.951,2.619,6.201,4.815,10.396-0.053   c5.39-6.267,13.055-6.761,20.271-3.357c7.454,3.509,9.935,10.165,9.776,18.265C350.67,304.222,350.86,317.217,350.854,330.211z    M395.617,369.579c-0.118,12.837-6.398,19.783-17.196,19.908c-10.779,0.132-17.593-6.966-17.646-19.512   c-0.179-43.352-0.185-86.696,0.007-130.041c0.059-12.256,7.302-19.921,17.896-19.222c11.425,0.752,16.992,7.448,16.992,18.833   c0,22.104,0,44.216,0,66.327C395.677,327.105,395.828,348.345,395.617,369.579z M463.981,391.868   c-34.399-0.336-59.037-26.444-58.786-62.289c0.251-35.66,25.304-60.713,60.383-60.396c34.631,0.304,59.374,26.306,58.998,61.986   C524.207,366.492,498.534,392.205,463.981,391.868z"
                    />
                </svg>
                </a>
            </div>
            </div>
        </div>
        </div>

        <p className="mt-10 text-center text-[11px] text-white/45">
        © Copyright by DPI MEDIA
        </p>
    </div>
    </section>
);
}
