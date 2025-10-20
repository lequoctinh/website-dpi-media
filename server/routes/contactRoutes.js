const express = require("express");
const pool = require("../db"); 
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const router = express.Router();

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
limits: { fileSize: 25 * 1024 * 1024 },
fileFilter: (req, file, cb) => {
    const ext = (path.extname(file.originalname).slice(1) || "").toLowerCase();
    const ok = /^(pdf|zip|rar|7z|mp4|mov|png|jpe?g|docx?|xlsx?|pptx?|csv)$/i.test(ext);
    cb(ok ? null : new Error("Định dạng file không được hỗ trợ"));
},
});

const transporter = nodemailer.createTransport({
service: "gmail",
auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

function getIp(req) {
return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
);
}

async function saveContact({ name = null, email, message = null, source = "site", ip = null, file_path = null }) {
const [rs] = await db.query(
    "INSERT INTO contacts (name, email, message, source, ip, file_path) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, message, source, ip, file_path]
);
return rs.insertId;
}

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

    const goals = Array.isArray(goalsRaw) ? goalsRaw : (() => { try { return JSON.parse(goalsRaw) } catch { return [] } })();

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
    ].filter(Boolean).join(" | ");

    const relPath = req.file ? path.relative(UPLOAD_DIR, req.file.path).replace(/\\/g, "/") : null;

    const contactId = await saveContact({
    name,
    email,
    message: compactMessage,
    source: "quote",
    ip,
    file_path: relPath,
    });

    if (req.file) {
    await db.query(
        "INSERT INTO contact_files (contact_id, file_path, original_name) VALUES (?, ?, ?)",
        [contactId, relPath, req.file.originalname]
    );
    }

    res.json({ message: "Gửi báo giá thành công!" });
} catch (err) {
    res.status(500).json({ error: err.message || "Không gửi được báo giá." });
}
});

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
    await saveContact({ email, message: "subscribe", source: "subscribe", ip, file_path: null });

    res.json({ message: "Gửi thành công!" });
} catch (err) {
    res.status(500).json({ error: "Gửi thất bại" });
}
});

module.exports = router;
