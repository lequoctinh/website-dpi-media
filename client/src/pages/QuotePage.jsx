import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3001";
const MAX_UPLOAD_MB = 25;

const PROJECT_TYPES = [
"Video 3D Animation",
"VFX (Hiệu ứng đặc biệt)",
"TVC Quảng cáo",
"OOH (Quảng cáo ngoài trời)",
"Khác (ghi rõ bên dưới)",
];

const DURATIONS = ["15 giây", "30 giây", "1 phút", "1–3 phút", "3–5 phút", "Khác"];
const GOALS = ["Tăng nhận diện thương hiệu", "Quảng bá sản phẩm/dịch vụ", "Sự kiện đặc biệt", "Khác"];
const CONTACTS = ["Gọi điện", "Email", "Zalo/Chat nhanh", "Khác"];
const BUDGET_PRESETS = ["< 50 triệu", "50–100 triệu", "100–200 triệu", "200–500 triệu", "≥ 500 triệu"];

const todayISO = () => new Date().toISOString().split("T")[0];
const emailOk = (s) => /\S+@\S+\.\S+/.test(s);
const phoneOk = (s) => /^[0-9+()\-.\s]{6,}$/.test(s);
const clampBudget = (s) => s.replace(/[^\d]/g, "");

export default function QuotePage() {
const navigate = useNavigate();

const [status, setStatus] = useState({ type: "", msg: "" });
const [submitting, setSubmitting] = useState(false);
const [errors, setErrors] = useState({});

const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    type: "",
    duration: "",
    goals: [],
    deadline: todayISO(),
    budget: "",
    file: null,
    note: "",
    contactMethod: "",
    company: "",
    agree: false,
});

const setField = (name, value) => setForm((s) => ({ ...s, [name]: value }));

const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "goals") {
    const active = form.goals.includes(value);
    const goals = checked ? [...form.goals, value] : form.goals.filter((g) => g !== value);
    setField("goals", goals);
    return;
    }

    if (type === "file") {
    const f = files?.[0];
    if (!f) {
        setField("file", null);
        return;
    }

    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const allowedExt = ["png","jpg","jpeg","webp","pdf","zip","rar","7z","doc","docx","xls","xlsx","ppt","pptx","mp4","mov"];
    const mimeOk = /(image\/(png|jpe?g|webp)|application\/pdf|application\/zip|application\/x-zip-compressed|application\/x-rar-compressed|application\/x-7z-compressed|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-powerpoint|application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation|video\/(mp4|quicktime))/i.test(
        f.type || ""
    );
    const okType = mimeOk || allowedExt.includes(ext);

    if (!okType) {
        setErrors((s) => ({ ...s, file: "Hỗ trợ: PNG/JPG/WebP, PDF/ZIP/RAR/7Z, DOC/DOCX, XLS/XLSX, PPT/PPTX, MP4/MOV." }));
        setField("file", null);
        return;
    }
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) {
        setErrors((s) => ({ ...s, file: `Dung lượng tối đa ${MAX_UPLOAD_MB}MB.` }));
        setField("file", null);
        return;
    }
    setErrors((s) => ({ ...s, file: "" }));
    setField("file", f);
    return;
    }

    if (type === "checkbox") {
    setField(name, checked);
    return;
    }

    if (name === "budget") {
    const raw = clampBudget(value);
    setField("budget", raw);
    if (!raw) setErrors((s) => ({ ...s, budget: "Vui lòng nhập ngân sách dự kiến." }));
    else setErrors((s) => ({ ...s, budget: "" }));
    return;
    }

    setField(name, value);

    if (name === "email") setErrors((s) => ({ ...s, email: emailOk(value) ? "" : "Email chưa hợp lệ." }));
    if (name === "phone") setErrors((s) => ({ ...s, phone: phoneOk(value) ? "" : "Số điện thoại chưa hợp lệ." }));
};

const onBudgetBlur = () => {
    const raw = clampBudget(form.budget);
    if (!raw) return;
    const formatted = Number(raw).toLocaleString("vi-VN");
    setField("budget", formatted);
};

const onBudgetPreset = (preset) => setField("budget", preset);

const isValid = useMemo(() => {
    const ok =
    form.name.trim() &&
    phoneOk(form.phone) &&
    emailOk(form.email) &&
    form.type &&
    form.duration &&
    form.deadline &&
    form.budget &&
    form.note.trim() &&
    form.contactMethod &&
    form.agree &&
    !submitting;
    return ok;
}, [form, submitting]);

const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    if (form.company) {
    setStatus({ type: "error", msg: "Có lỗi xảy ra. Vui lòng thử lại." });
    return;
    }

    if (form.deadline < todayISO()) {
    setErrors((s) => ({ ...s, deadline: "Không thể chọn ngày trong quá khứ." }));
    return;
    }

    setSubmitting(true);

    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => {
    if (k === "goals") payload.append("goals", JSON.stringify(v));
    else if (k === "file") {
        if (v) payload.append("file", v);
    } else if (k === "agree") payload.append("agree", v ? "yes" : "no");
    else if (k !== "company") payload.append(k, v);
    });

    try {
    const res = await fetch(`${API_BASE}/api/email/quote`, { method: "POST", body: payload });
    if (!res.ok) throw new Error("request failed");
    setStatus({ type: "ok", msg: "✅ Đã nhận yêu cầu. DPI Media sẽ liên hệ sớm!" });
    setForm({
        name: "",
        phone: "",
        email: "",
        type: "",
        duration: "",
        goals: [],
        deadline: todayISO(),
        budget: "",
        file: null,
        note: "",
        contactMethod: "",
        company: "",
        agree: false,
    });
    setTimeout(() => navigate("/"), 1800);
    } catch (_err) {
    setStatus({ type: "error", msg: "❌ Gửi thất bại. Vui lòng thử lại." });
    } finally {
    setSubmitting(false);
    }
};

return (
    <main className="relative isolate bg-black">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.09),transparent_70%)]" />
    <section className="relative mx-auto max-w-5xl px-4 py-14 md:py-18">
        <header className="mb-8 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Báo giá nhanh — DPI Media
        </p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-4xl">Cho chúng tôi biết nhu cầu của bạn</h1>
        <p className="mx-auto mt-3 max-w-2xl text-white/70">Điền form (≈1–2 phút). Chúng tôi phản hồi với đề xuất & khung chi phí phù hợp.</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:p-7">
        <form onSubmit={onSubmit} className="grid gap-8">
            <GroupTitle>Thông tin liên hệ</GroupTitle>
            <div className="grid gap-6 md:grid-cols-2">
            <Field label="Họ và tên" required htmlFor="name">
                <input
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                required
                />
            </Field>

            <Field label="Số điện thoại" required htmlFor="phone">
                <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={onChange}
                inputMode="tel"
                placeholder="nhập số điện của bạn"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                required
                />
                {errors.phone && <HintError>{errors.phone}</HintError>}
            </Field>

            <Field label="Email" required htmlFor="email">
                <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@gmail.com"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                required
                />
                {errors.email && <HintError>{errors.email}</HintError>}
            </Field>

            <Field label="Phương thức liên hệ ưa thích" required htmlFor="contactMethod">
                <div className="flex flex-wrap gap-2">
                {CONTACTS.map((m) => (
                    <ChipRadio key={m} name="contactMethod" value={m} active={form.contactMethod === m} onChange={onChange}>
                    {m}
                    </ChipRadio>
                ))}
                </div>
            </Field>
            </div>

            <GroupTitle>Thông tin dự án</GroupTitle>
            <div className="grid gap-6 md:grid-cols-2">
            <Field label="Loại dự án" required htmlFor="type">
                <div className="grid gap-2">
                {PROJECT_TYPES.map((t) => (
                    <CardRadio key={t} name="type" value={t} checked={form.type === t} onChange={onChange}>
                    {t}
                    </CardRadio>
                ))}
                </div>
            </Field>

            <Field label="Thời lượng dự kiến" required htmlFor="duration">
                <div className="grid gap-2">
                {DURATIONS.map((d) => (
                    <CardRadio key={d} name="duration" value={d} checked={form.duration === d} onChange={onChange}>
                    {d}
                    </CardRadio>
                ))}
                </div>
            </Field>

            <Field label="Mục tiêu dự án" htmlFor="goals" desc="Chọn một hoặc nhiều">
                <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => {
                    const active = form.goals.includes(g);
                    return (
                    <ChipCheckbox key={g} name="goals" value={g} checked={active} onChange={onChange}>
                        {g}
                    </ChipCheckbox>
                    );
                })}
                </div>
            </Field>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Deadline dự kiến" required htmlFor="deadline">
                <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    min={todayISO()}
                    value={form.deadline}
                    onChange={onChange}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
                    required
                />
                {errors.deadline && <HintError>{errors.deadline}</HintError>}
                </Field>

                <Field label="Ngân sách dự kiến" required htmlFor="budget" desc="Chọn nhanh hoặc nhập tay (VNĐ)">
                <input
                    id="budget"
                    name="budget"
                    value={form.budget}
                    onChange={onChange}
                    onBlur={onBudgetBlur}
                    placeholder="VD: 150000000 hoặc 150.000.000"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                    required
                />
                {errors.budget && <HintError>{errors.budget}</HintError>}
                <div className="mt-2 flex flex-wrap gap-2">
                    {BUDGET_PRESETS.map((b) => (
                    <button
                        key={b}
                        type="button"
                        onClick={() => onBudgetPreset(b)}
                        className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.1]"
                    >
                        {b}
                    </button>
                    ))}
                </div>
                </Field>
            </div>
            </div>

            <GroupTitle>Chi tiết bổ sung</GroupTitle>
            <div className="grid gap-6">
            <Field label="File/tài liệu liên quan (nếu có)" htmlFor="file" desc="Storyboard, brief, hình tham khảo…">
                <input
                id="file"
                name="file"
                type="file"
                accept="
                    image/png,image/jpeg,image/webp,
                    application/pdf,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/x-7z-compressed,
                    application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                    application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                    application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,
                    video/mp4,video/quicktime
                "
                onChange={onChange}
                className="block w-full cursor-pointer rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/20"
                />
                {form.file && (
                <p className="mt-2 text-xs text-white/60">
                    Đã chọn: <span className="text-white/90">{form.file.name}</span> ({Math.round(form.file.size / 1024)} KB)
                </p>
                )}
                {errors.file && <HintError>{errors.file}</HintError>}
            </Field>

            <Field label="Yêu cầu thêm / Ghi chú" required htmlFor="note" desc="Có thể dán link tham khảo tại đây">
                <textarea
                id="note"
                name="note"
                rows={4}
                value={form.note}
                onChange={onChange}
                placeholder="Nội dung mong muốn, tone & mood, platform phát hành…"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/30"
                required
                />
            </Field>

            <label className="flex items-start gap-3 text-sm text-white/80">
                <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} className="mt-1 h-4 w-4 accent-white" required />
                <span>
                Tôi đồng ý để DPI Media liên hệ và xử lý thông tin nhằm tư vấn báo giá.
                <span className="text-white/50"> (Có thể yêu cầu xóa dữ liệu bất kỳ lúc nào.)</span>
                </span>
            </label>
            <label className="hidden">
                Company
                <input name="company" value={form.company} onChange={onChange} autoComplete="off" />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-white/50">
                Thời gian phản hồi dự kiến: <span className="text-white/70">trong ngày làm việc</span>.
                </p>
                <button
                type="submit"
                disabled={!isValid}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                    isValid ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:opacity-95" : "cursor-not-allowed bg-white/10 text-white/40"
                }`}
                >
                {submitting && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" />
                    </svg>
                )}
                {submitting ? "Đang gửi…" : "Gửi báo giá"}
                </button>
            </div>

            {status.msg && (
                <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                    status.type === "ok" ? "border-white/10 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-rose-500/10 text-rose-300"
                }`}
                >
                {status.msg}
                </div>
            )}
            </div>
        </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
        Cần hỗ trợ nhanh? Gọi{" "}
        <a href="tel:0982561914" className="text-white/80 underline underline-offset-4">
            098 2561 914
        </a>{" "}
        hoặc nhắn Zalo.
        </p>
    </section>
    </main>
);
}

function GroupTitle({ children }) {
return <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">{children}</h2>;
}

function Field({ label, desc, required, htmlFor, children }) {
return (
    <div>
    <label htmlFor={htmlFor} className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
        {label} {required && <span className="text-rose-400">*</span>}
    </label>
    {desc && <p className="mb-2 text-xs text-white/50">{desc}</p>}
    {children}
    </div>
);
}

function HintError({ children }) {
return <p className="mt-1 text-xs text-rose-300">{children}</p>;
}

function CardRadio({ name, value, checked, onChange, children }) {
return (
    <label
    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
        checked ? "border-transparent bg-white text-gray-900" : "border-white/10 bg-white/[0.04] text-white/90 hover:bg-white/[0.06]"
    }`}
    >
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="hidden" required />
    {children}
    </label>
);
}

function ChipCheckbox({ name, value, checked, onChange, children }) {
return (
    <label
    className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
        checked ? "border-transparent bg-gradient-to-r from-rose-500 to-orange-500 text-white" : "border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.1]"
    }`}
    >
    <input type="checkbox" name={name} value={value} checked={checked} onChange={onChange} className="hidden" />
    {children}
    </label>
);
}

function ChipRadio({ name, value, active, onChange, children }) {
return (
    <label
    className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
        active ? "border-transparent bg-white text-gray-900" : "border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.1]"
    }`}
    >
    <input type="radio" name={name} value={value} checked={active} onChange={onChange} className="hidden" required />
    {children}
    </label>
);
}
