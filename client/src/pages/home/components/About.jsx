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
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.10),transparent_70%)]" />
    <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-20">
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
            <span className="text-white/70">
            {" "}
            chúng tôi giúp thương hiệu của bạn được nhớ đến
            </span>
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-white/70">
            DPI Media sinh ra từ một câu hỏi rất đơn giản: làm sao để mỗi nội dung
            thương mại vẫn giữ được cảm xúc như một bộ phim ngắn, nhưng lại phục vụ
            rõ ràng cho mục tiêu kinh doanh của khách hàng.
        </p>

        <p className="mx-auto mt-2 max-w-2xl text-white/60 text-sm md:text-base">
            Từ những set quay đầu tiên cho showroom, lễ khai trương và sự kiện nhỏ,
            chúng tôi lớn lên cùng thương hiệu: học cách kể câu chuyện của họ bằng
            hình ảnh, âm thanh và nhịp dựng khiến người xem thực sự ở lại đến giây
            cuối cùng.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
            type="button"
            onClick={goQuote}
            className="rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/10 hover:shadow-xl"
            >
            Nhận tư vấn & báo giá
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
                <path
                fill="currentColor"
                d="M12 2l3.09 6.26L22 9.27l-5 4.9L18.18 22 12 18.77 5.82 22 7 14.17l-5-4.9 6.91-1.01z"
                />
            </svg>
            }
            title="Thật với thương hiệu"
            desc="Mỗi thương hiệu có một giọng nói riêng. Chúng tôi không ép bạn chạy theo mọi trend, mà ưu tiên câu chuyện đúng với bản sắc & hình ảnh bạn đang xây dựng."
        />
        <USP
            icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path
                fill="currentColor"
                d="M3 6h18v2H3V6m0 5h12v2H3v-2m0 5h18v2H3v-2z"
                />
            </svg>
            }
            title="Trải nghiệm người xem là trung tâm"
            desc="Góc máy đẹp là chưa đủ. Từng cut, từng nhịp nhạc, từng dòng chữ đều được dựng để giữ chân người xem, dẫn dắt cảm xúc và thúc đẩy hành động."
        />
        <USP
            icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path
                fill="currentColor"
                d="M12 20l-8-8 1.41-1.41L12 17.17l6.59-6.58L20 12z"
                />
            </svg>
            }
            title="Rõ ràng & có trách nhiệm"
            desc="Quy trình, mốc duyệt, timeline đều minh bạch. Chúng tôi luôn báo sớm những rủi ro có thể phát sinh để hai bên chủ động, cùng hướng tới kết quả tốt nhất."
        />
        </div>

        {/* Stats / trust */}
        <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
        <Stat kpi="120+" label="dự án đã hoàn thành" />
        <Stat kpi="4.9/5" label="điểm hài lòng từ khách hàng" />
        <Stat kpi="10+" label="ngành hàng đã thực hiện" />
        </div>

        {/* Quy trình gọn */}
        <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
        <h3 className="text-lg font-semibold text-white">Quy trình 4 bước</h3>
        <p className="mt-2 text-sm text-white/65 max-w-2xl">
            Chúng tôi tin rằng một quy trình rõ ràng giúp cả hai phía yên tâm hơn. Từ
            lúc bạn mới có ý tưởng đến khi video được xuất bản, DPI Media luôn đồng
            hành ở từng bước.
        </p>
        <ol className="mt-4 grid gap-4 md:grid-cols-4">
            <Step
            n="01"
            t="Brief & concept"
            d="Cùng bạn chốt mục tiêu, đối tượng, thông điệp chính và moodboard để mọi người cùng nhìn về một hướng."
            />
            <Step
            n="02"
            t="Pre-prod"
            d="Lên kịch bản chi tiết, phân cảnh, lịch quay, nhân sự & thiết bị; thống nhất trước khi bấm máy."
            />
            <Step
            n="03"
            t="Shoot"
            d="On set với đạo diễn, DOP, âm thanh, ánh sáng... đảm bảo chất lượng hình ảnh & cảm xúc như đã thống nhất."
            />
            <Step
            n="04"
            t="Post"
            d="Dựng, color, âm nhạc, subtitle, chỉnh sửa theo feedback và bàn giao file tối ưu cho các nền tảng."
            />
        </ol>
        </section>

        {/* CTA cuối */}
        <div className="mt-10 max-w-2xl mx-auto text-center">
        <p className="text-sm md:text-base text-white/70">
            Nếu bạn đã có một ý tưởng, một chiến dịch hoặc chỉ là vài dòng mô tả,
            DPI Media rất sẵn sàng ngồi xuống, nghe bạn chia sẻ và cùng vẽ ra kế hoạch
            phù hợp nhất cho thương hiệu.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
            href="#lien-he"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
            Kể câu chuyện thương hiệu của bạn
            </a>
            <button
            type="button"
            onClick={goQuote}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:shadow"
            >
            Bắt đầu lên khung video đầu tiên
            </button>
        </div>
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
    <div className="mt-1 text-xs uppercase tracking-wider text-white/60">
        {label}
    </div>
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
