import React from "react";
import { useNavigate } from "react-router-dom";

export default function About() {
const navigate = useNavigate();
const goQuote = () => navigate("/bao-gia");

return (
    <section
    id="gioi-thieu"
    aria-labelledby="about-heading"
    className="relative isolate bg-black"
    >
    {/* ánh sáng nền rất nhẹ */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.10),transparent_70%)]" />

    <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-20">
        {/* Hero mini */}
        <header className="mx-auto max-w-4xl text-center">
        <img
            src="/logoconty.png"
            alt="DPI Media"
            className="mx-auto h-16 w-auto md:h-20"
        />
        <h2
            id="about-heading"
            className="mt-6 text-3xl font-extrabold leading-tight text-white md:text-4xl"
        >
            Không chỉ là video —
            <span className="text-white/70"> chúng tôi tạo trải nghiệm thương hiệu</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/70">
            DPI Media đồng hành từ ý tưởng, tiền kỳ, sản xuất đến hậu kỳ. Tập trung vào
            cảm xúc, nhịp dựng và hiệu quả kinh doanh.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
            type="button"
            onClick={goQuote}
            className="rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/10 hover:shadow-xl"
            >
            Nhận báo giá & tư vấn
            </button>
            <a
            href="#du-an"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
            Xem dự án tiêu biểu
            </a>
        </div>
        </header>

        {/* USP / giá trị cốt lõi */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
        <USP
            icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.9L18.18 22 12 18.77 5.82 22 7 14.17l-5-4.9 6.91-1.01z"/>
            </svg>
            }
            title="Sáng tạo dẫn dắt"
            desc="Ý tưởng gọn – sắc – đúng brief; visual & âm nhạc bám brand voice."
        />
        <USP
            icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path fill="currentColor" d="M3 6h18v2H3V6m0 5h12v2H3v-2m0 5h18v2H3v-2z"/>
            </svg>
            }
            title="Quy trình end-to-end"
            desc="Tiền kỳ → sản xuất → hậu kỳ → bàn giao; rõ timeline & mốc duyệt."
        />
        <USP
            icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path fill="currentColor" d="M12 20l-8-8 1.41-1.41L12 17.17l6.59-6.58L20 12z"/>
            </svg>
            }
            title="Hiệu quả đo lường"
            desc="KPI xem hết, CTR, chuyển đổi — tối ưu cho nền tảng bạn chọn."
        />
        </div>

        {/* Stats / trust */}
        <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
        <Stat kpi="120+" label="dự án hoàn thành" />
        <Stat kpi="4.9/5" label="điểm hài lòng khách hàng" />
        <Stat kpi="30–60s" label="nhịp showreel tối ưu" />
        </div>

        {/* Quy trình gọn */}
        <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
        <h3 className="text-lg font-semibold text-white">Quy trình 4 bước</h3>
        <ol className="mt-4 grid gap-4 md:grid-cols-4">
            <Step n="01" t="Brief & concept" d="Chốt mục tiêu, audience, moodboard." />
            <Step n="02" t="Pre-prod" d="Kịch bản, lịch quay, nhân sự/thiết bị." />
            <Step n="03" t="Shoot" d="On set: đạo diễn, DOP, âm thanh, ánh sáng." />
            <Step n="04" t="Post" d="Dựng, color, âm nhạc, subtitle, xuất bản." />
        </ol>
        </section>

        {/* CTA cuối */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
            href="#lien-he"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
        >
            Liên hệ nhanh
        </a>
        <button
            type="button"
            onClick={goQuote}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:shadow"
        >
            Lên kế hoạch dự án
        </button>
        </div>
    </div>
    </section>
);
}

function USP({ icon, title, desc }) {
return (
    <article className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]">
    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
        {icon}
    </div>
    <h3 className="text-white font-semibold">{title}</h3>
    <p className="mt-1 text-sm text-white/70">{desc}</p>
    </article>
);
}

function Stat({ kpi, label }) {
return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
    <div className="text-3xl font-extrabold text-white">{kpi}</div>
    <div className="mt-1 text-xs uppercase tracking-wider text-white/60">{label}</div>
    </div>
);
}

function Step({ n, t, d }) {
return (
    <li className="relative rounded-xl border border-white/10 bg-white/[0.02] p-4">
    <div className="text-xs font-semibold text-white/60">{n}</div>
    <div className="mt-1 text-white font-semibold">{t}</div>
    <p className="mt-1 text-sm text-white/70">{d}</p>
    <span className="pointer-events-none absolute -inset-px rounded-[12px] bg-gradient-to-tr from-white/20 via-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />
    </li>
);
}
