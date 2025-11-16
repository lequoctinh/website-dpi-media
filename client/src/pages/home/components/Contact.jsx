import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");
export default function Contact() {
const [email, setEmail] = useState("");
const [status, setStatus] = useState({ type: "", msg: "" });
const [loading, setLoading] = useState(false);
const abortRef = useRef(null);

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

    // Có thể backend trả 204 No Content -> tránh .json() lỗi
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

return (
    <section id="lien-he" aria-labelledby="contact-heading" className="relative bg-black">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_70%)]" />
    <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-20">
        <header className="mb-8 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Liên hệ
        </p>
        <h2 id="contact-heading" className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            Kết nối với <span className="text-white/70">DPI Media</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/70">
            Gửi yêu cầu, đăng ký nhận tin hoặc kết nối qua mạng xã hội.
        </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <ul className="space-y-3 text-white/80">
            <li>
                <span className="text-white/50">Địa chỉ:</span>{" "}
                Số 5 đường số 17B, P. Bình Hưng Hoà, Q. Bình Tân, HCM
            </li>
            <li>
                <span className="text-white/50">Email:</span>{" "}
                <a href="mailto:info@dpimedia.pro" className="underline underline-offset-4 hover:text-white">
                info@dpimedia.pro
                </a>
            </li>
            <li>
                <span className="text-white/50">Điện thoại:</span>{" "}
                <a href="tel:+84982561914" className="underline underline-offset-4 hover:text-white">
                (+84) 98 256 19 14
                </a>
            </li>
            </ul>

            <h4 className="mt-6 text-sm font-semibold text-white">Nhận bản tin & ưu đãi</h4>
            <form onSubmit={onSubmit} className="mt-3 flex gap-2 max-md:flex-col" noValidate>
            <input
                type="email"
                required
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                aria-invalid={email && !isValidEmail ? "true" : "false"}
            />
            <button
                type="submit"
                disabled={loading || !isValidEmail}
                className="rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "Đang gửi…" : "Subscribe"}
            </button>
            </form>

            {status.msg && (
            <p
                className={`mt-3 text-sm ${
                status.type === "ok" ? "text-emerald-300" : "text-rose-300"
                }`}
            >
                {status.msg}
            </p>
            )}
        </div>

        <div className="flex flex-col justify-center gap-3">
            <SocialItem
                href="https://www.youtube.com/"
                label="YouTube"
                color="#FF0000"
                icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M23.5 6.2a4 4 0 0 0-2.8-2.8C18.9 3 12 3 12 3s-6.9 0-8.7.4A4 4 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a4 4 0 0 0 2.8 2.8C5.1 21 12 21 12 21s6.9 0 8.7-.4a4 4 0 0 0 2.8-2.8C24 16 24 12 24 12s0-4-.5-5.8zM9.6 15.5V8.5L15.8 12l-6.2 3.5z" />
                </svg>
                }
            />

            <SocialItem
                href="https://www.facebook.com/profile.php?id=61573772364613"
                label="Facebook"
                color="#1877F2"
                icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.2V12h2.2V9.8c0-2.2 1.3-3.4 3.3-3.4.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12H16l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z" />
                </svg>
                }
            />

            <SocialItem
                href="https://zalo.me/0365701415"
                label="Zalo"
                color="#0068FF"
                icon={
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 64 64"
                    className="h-5 w-5"
                    fill="currentColor"
                >
                    <path d="M26.8 25.2h3.7l-5.6 8.2h5.7v2.4h-9.5v-2l5.7-8.6zm8.8 0h2.6v10.6h-2.6V25.2zm8.2 0c2.8 0 4.6 1.5 4.6 4 0 2.5-1.9 4.1-4.6 4.1h-1.7v2.4h-2.6V25.2h4.3zm-1.7 5.8h1.5c1.3 0 2.1-.7 2.1-1.8s-.8-1.8-2.1-1.8h-1.5v3.6zm8.3-5.8h2.6v8.2h4.6v2.4h-7.2V25.2z" />
                </svg>
                }
            />
        </div>

    </div>
        <p className="mt-8 text-center text-xs text-white/50">© Copyright by DPI MEDIA</p>
    </div>  
    </section>
);
}

function SocialItem({ href, label, icon, color }) {
return (
    <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group flex items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-white transition-all duration-300 hover:scale-[1.02]"
    >
    <span
        className="inline-grid place-items-center rounded-full bg-white/10 p-2 text-white/80 transition-all duration-300 group-hover:text-white"
    >
        {icon}
    </span>

    <span className="flex-1 font-medium">{label}</span>

    <span className="inline-grid place-items-center rounded-full bg-white/10 p-2 text-white/80 transition-all duration-300 group-hover:translate-x-1">
        <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="currentColor"
        aria-hidden="true"
        >
        <path d="M13.5 4.5 21 12l-7.5 7.5-1.06-1.06L18.88 12l-6.44-6.44L13.5 4.5zM3 11.25h15v1.5H3v-1.5z" />
        </svg>
    </span>
    <style jsx>{`
        a:hover {
        border-color: ${color}50;
        background: linear-gradient(90deg, ${color}22, transparent 100%);
        box-shadow: 0 0 10px ${color}55;
        }
        a:hover span:first-child {
        background-color: ${color};
        }
    `}</style>
    </a>
);
}
