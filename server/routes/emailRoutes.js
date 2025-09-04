const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

const router = express.Router();

// ---------- DB POOL (không tách file) ----------
const db = mysql.createPool({
host: process.env.DB_HOST || "localhost",
user: process.env.DB_USER || "root",
password: process.env.DB_PASSWORD || "",
database: process.env.DB_NAME || "mediatp",
});

// ---------- Upload config ----------
const UPLOAD_DIR = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, UPLOAD_DIR),
filename: (req, file, cb) => {
const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
cb(null, `${Date.now()}-${safe}`);
},
});
const upload = multer({
storage,
limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
fileFilter: (req, file, cb) => {
// cho phép một số loại thường gặp; tuỳ bạn nới thêm
const ok =
/pdf|zip|rar|7z|mp4|mov|png|jpe?g|docx?|xlsx?|pptx?$/i.test(
    path.extname(file.originalname).slice(1)
);
cb(ok ? null : new Error("Định dạng file không được hỗ trợ"));
},
});

// ---------- Mailer (dùng .env) ----------
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.GMAIL_USER, // ví dụ: dpimedia2024@gmail.com
pass: process.env.GMAIL_PASS, // app password
},
});

// helper: ip client
function getIp(req) {
return (
req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
req.socket?.remoteAddress ||
null
);
}

// helper: lưu vào bảng contacts
async function saveContact({ name = null, email, message = null, source = "site", ip = null }) {
try {
await db.query(
"INSERT INTO contacts (name, email, message, source, ip) VALUES (?, ?, ?, ?, ?)",
[name, email, message, source, ip]
);
} catch (e) {
console.error("saveContact error:", e.message);
}
}

/* ===========================================================
POST /api/email/quote
- Form báo giá: có thể kèm file (field name: "file")
- Gửi email + lưu DB (source='quote')
=========================================================== */
router.post("/quote", upload.single("file"), async (req, res) => {
try {
const {
name = "",
phone = "",
email = "",
type = "",
duration = "",
deadline = "",
budget = "",
note = "",
contactMethod = "",
goals: goalsRaw = "[]",
} = req.body || {};

const goals = Array.isArray(goalsRaw) ? goalsRaw : (() => {
try { return JSON.parse(goalsRaw) } catch { return [] }
})();

// mail content
const html = `
<h2>Yêu cầu báo giá mới</h2>
<ul>
    <li><strong>Họ tên:</strong> ${name || "-"}</li>
    <li><strong>SĐT:</strong> ${phone || "-"}</li>
    <li><strong>Email:</strong> ${email || "-"}</li>
    <li><strong>Loại dự án:</strong> ${type || "-"}</li>
    <li><strong>Thời lượng:</strong> ${duration || "-"}</li>
    <li><strong>Mục tiêu:</strong> ${goals.join(", ") || "-"}</li>
    <li><strong>Deadline:</strong> ${deadline || "-"}</li>
    <li><strong>Ngân sách:</strong> ${budget || "-"}</li>
    <li><strong>Liên hệ qua:</strong> ${contactMethod || "-"}</li>
</ul>
<p><strong>Ghi chú:</strong></p>
<pre style="white-space:pre-wrap">${note || "-"}</pre>
`;

const mailOptions = {
from: `"Báo Giá - DPI Media" <${process.env.GMAIL_USER}>`,
to: process.env.GMAIL_USER,
subject: "📝 Yêu cầu báo giá mới",
html,
attachments: [],
};

if (req.file) {
mailOptions.attachments.push({
    filename: req.file.originalname,
    path: req.file.path,
});
}

await transporter.sendMail(mailOptions);

// lưu DB (message gom các trường chính)
const ip = getIp(req);
const compactMessage = [
`Phone: ${phone}`,
`Type: ${type}`,
`Duration: ${duration}`,
`Goals: ${goals.join(", ")}`,
`Deadline: ${deadline}`,
`Budget: ${budget}`,
`Contact via: ${contactMethod}`,
note && `Note: ${note}`,
]
.filter(Boolean)
.join(" | ");

await saveContact({ name, email, message: compactMessage, source: "quote", ip });

res.json({ message: "Gửi báo giá thành công!" });
} catch (err) {
console.error("POST /email/quote error:", err);
res.status(500).json({ error: err.message || "Không gửi được báo giá." });
}
});

/* ===========================================================
POST /api/email/send
- Subscribe email
- Gửi email thông báo + lưu DB (source='subscribe')
=========================================================== */
router.post("/send", async (req, res) => {
try {
const { email } = req.body || {};
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
return res.status(400).json({ error: "Email không hợp lệ" });
}

await transporter.sendMail({
from: `"Website Form" <${process.env.GMAIL_USER}>`,
to: process.env.GMAIL_USER,
subject: "New Subscriber",
text: `Khách hàng vừa đăng ký: ${email}`,
});

const ip = getIp(req);
await saveContact({ email, message: "subscribe", source: "subscribe", ip });

res.json({ message: "Gửi thành công!" });
} catch (err) {
console.error("POST /email/send error:", err);
res.status(500).json({ error: "Gửi thất bại" });
}
});

module.exports = router;
