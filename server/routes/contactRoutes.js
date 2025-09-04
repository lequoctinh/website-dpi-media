const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

const db = mysql.createPool({
host: process.env.DB_HOST || "localhost",
user: process.env.DB_USER || "root",
password: process.env.DB_PASSWORD || "",
database: process.env.DB_NAME || "mediatp",
});

// POST /api/contacts
router.post("/", async (req, res) => {
try {
    const { name = null, email, message = null, source = "site" } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "Email không hợp lệ" });
    }
    const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null;

    await db.query(
    "INSERT INTO contacts (name, email, message, source, ip) VALUES (?, ?, ?, ?, ?)",
    [name, email, message, source, ip]
    );

    res.json({ ok: true });
} catch (err) {
    console.error("POST /api/contacts error:", err);
    res.status(500).json({ error: "Không lưu được liên hệ" });
}
});

module.exports = router;
