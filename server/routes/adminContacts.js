const express = require("express");
const mysql = require("mysql2/promise");

const router = express.Router();

const pool = mysql.createPool({
host: process.env.DB_HOST || "localhost",
user: process.env.DB_USER || "root",
password: process.env.DB_PASSWORD || "",
database: process.env.DB_NAME || "mediatp",
waitForConnections: true,
connectionLimit: 10,
});

const escapeLike = (s = "") => s.replace(/[%_]/g, "\\$&");

router.get("/", async (req, res) => {
try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "12", 10), 1), 100);
    const q = (req.query.q || "").trim();
    const source = (req.query.source || "").trim(); // '', 'site', 'subscribe', 'quote'

    let where = "WHERE 1=1";
    const params = [];

    if (q) {
    const kw = `%${escapeLike(q)}%`;
    where += " AND (email LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\')";
    params.push(kw, kw, kw);
    }
    if (source) {
    where += " AND source = ?";
    params.push(source);
    }

    const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM contacts ${where}`,
    params
    );

    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(
    `SELECT id, name, email, message, source, ip, created_at
    FROM contacts
    ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
    );

    res.json({ items: rows, total, page, pageSize });
} catch (e) {
    console.error("GET /admin/contacts error:", e);
    res.status(500).json({ error: "Không lấy được danh sách liên hệ" });
}
});

// GET /api/admin/contacts/:id
router.get("/:id", async (req, res) => {
try {
    const { id } = req.params;
    const [rows] = await pool.query(
    "SELECT id, name, email, message, source, ip, created_at FROM contacts WHERE id = ?",
    [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Không tìm thấy liên hệ" });
    res.json(rows[0]);
} catch (e) {
    console.error("GET /admin/contacts/:id error:", e);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết liên hệ" });
}
});

// DELETE /api/admin/contacts/:id
router.delete("/:id", async (req, res) => {
try {
    const { id } = req.params;
    await pool.query("DELETE FROM contacts WHERE id = ?", [id]);
    res.json({ ok: true });
} catch (e) {
    console.error("DELETE /admin/contacts/:id error:", e);
    res.status(500).json({ error: "Không xoá được liên hệ" });
}
});

module.exports = router;
