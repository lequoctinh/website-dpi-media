import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const QA = [
    {
    q: "DPI?",
    a: "DPI = Digital Performance & Innovation",
    b:"Digital – Số hóa: Đại diện cho lĩnh vực truyền thông, sản xuất nội dung số (media, video, ảnh, quảng cáo...)",
    c:"Performance – Hiệu quả: Cam kết tạo ra sản phẩm đạt chất lượng và hiệu quả truyền thông cao nhất cho khách hàng",
    d:"Innovation – Đổi mới: Tư duy sáng tạo, liên tục cập nhật xu hướng, công nghệ và giải pháp mới trong ngành"

},
{
    q: "DPI Media cung cấp những dịch vụ nào?",
    a: "Chúng tôi sản xuất TVC, social video, 3D/Animation, VFX, livestream sự kiện, OOH và trọn gói từ tiền kỳ—hậu kỳ."
},
{
    q: "Chi phí sản xuất video bao nhiêu?",
    a: "Tùy độ dài, độ phức tạp và yêu cầu (diễn viên, bối cảnh, VFX…). Hãy gửi yêu cầu ở trang Báo giá để nhận đề xuất & khung chi phí phù hợp."
},
{
    q: "Thời gian thực hiện một dự án?",
    a: "Dự án ngắn 1–2 tuần; TVC/3D phức tạp 3–6 tuần. Chúng tôi luôn gửi lịch trình sản xuất rõ ràng ngay từ đầu."
},
{
    q: "DPI có hỗ trợ kịch bản & storyboard không?",
    a: "Có Creative team hỗ trợ strategy, kịch bản, storyboard/moodboard để thống nhất hình ảnh và thông điệp trước khi quay/dựng."
},
{
    q: "Quy trình làm việc của DPI như thế nào?",
    a: "Brief → đề xuất & báo giá → kịch bản/board → tiền kỳ (casting, bối cảnh) → sản xuất → hậu kỳ (edit, color, VFX, âm thanh) → bàn giao."
},
{
    q: "Có thể làm trong ngân sách cố định không?",
    a: "Chúng tôi tối ưu nguồn lực theo ngân sách, nhưng vẫn giữ tiêu chuẩn chất lượng & đúng deadline."
}
];

export default function Faq() {
const [open, setOpen] = useState(null);
const navigate = useNavigate();

const toggle = (idx) => setOpen((s) => (s === idx ? null : idx));

// schema.org FAQPage
const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": QA.map(({ q, a, b, c , d }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a, b, c, d }
    }))
}), []);

return (
    <section id="faq" aria-labelledby="faq-heading" className="relative bg-black">
    {/* subtle glow */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_70%)]" />
    <div className="relative mx-auto max-w-4xl px-4 py-16 md:py-20">
        <header className="mb-8 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Câu hỏi thường gặp
        </p>
        <h2 id="faq-heading" className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            Tò mò về <span className="text-white/70">DPI Media</span>?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/70">
            Đây là các thắc mắc phổ biến. Nếu cần thêm, cứ nhắn cho chúng tôi.
        </p>
        </header>

        {/* Card wrapper */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
        <ul className="flex flex-col gap-3">
            {QA.map((item, idx) => (
            <li key={idx} className="rounded-xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.06]">
                <button
                type="button"
                aria-expanded={open === idx}
                aria-controls={`faq-panel-${idx}`}
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-white"
                >
                <span className="font-semibold">{item.q}</span>
                <Chevron open={open === idx} />
                </button>

                <div
                id={`faq-panel-${idx}`}
                role="region"
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    open === idx ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
                >
                <div className="min-h-0 overflow-hidden">
                    <p className="px-4 pb-4 text-white/80">{item.a}</p>
                    <p className="px-4 pb-4 text-white/80">{item.b}</p>
                    <p className="px-4 pb-4 text-white/80">{item.c}</p>
                    <p className="px-4 pb-4 text-white/80">{item.d}</p>
                </div>
                </div>
            </li>
            ))}
        </ul>

        {/* CTA */}
        <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center">
            <p className="text-white/80">Cần mức giá chính xác cho dự án của bạn?</p>
            <button
            onClick={() => navigate("/bao-gia")}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:shadow"
            >
            Nhận báo giá nhanh
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 4.5 21 12l-7.5 7.5-1.06-1.06L18.88 12l-6.44-6.44L13.5 4.5zM3 11.25h15v1.5H3v-1.5z" />
            </svg>
            </button>
        </div>
        </div>
    </div>

    {/* SEO schema */}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
);
}

function Chevron({ open }) {
return (
    <span
    className={`inline-grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/[0.08] transition-transform ${
        open ? "rotate-180" : "rotate-0"
    }`}
    aria-hidden="true"
    >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/80" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 15.5 5.5 9l1.06-1.06L12 13.38l5.44-5.44L18.5 9 12 15.5z" />
    </svg>
    </span>
);
}
