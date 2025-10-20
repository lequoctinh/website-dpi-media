const express = require("express");
const pool = require("../db"); 

const path = require("path");
const fs = require("fs");

const router = express.Router();


const UPLOAD_DIR = path.resolve(__dirname, "../uploads");
const escapeLike = (s = "") => s.replace(/[%_]/g, "\\$&");

router.get("/", async (req, res) => {
try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "12", 10), 1), 100);
    const q = (req.query.q || "").trim();
    const source = (req.query.source || "").trim();

    let where = "WHERE 1=1";
    const params = [];

    if (q) {
    const kw = `%${escapeLike(q)}%`;
    where +=
        " AND (email LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\')";
    params.push(kw, kw, kw);
    }
    if (source) {
    where += " AND source = ?";
    params.push(source);
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM contacts ${where}`, params);

    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(
    `
SELECT c.id, c.name, c.email, c.message, c.source, c.ip, c.file_path, c.created_at,
    EXISTS(SELECT 1 FROM contact_files f WHERE f.contact_id = c.id LIMIT 1) AS has_file
FROM contacts c
${where}
ORDER BY c.created_at DESC
LIMIT ? OFFSET ?
`,
    [...params, pageSize, offset]
    );

    res.json({ items: rows, total, page, pageSize });
} catch (e) {
    res.status(500).json({ error: "Không lấy được danh sách liên hệ" });
}
});

router.get("/:id", async (req, res) => {
try {
    const { id } = req.params;
    const [rows] = await pool.query(
    "SELECT id, name, email, message, source, ip, file_path, created_at FROM contacts WHERE id = ?",
    [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Không tìm thấy liên hệ" });
    res.json(rows[0]);
} catch (e) {
    res.status(500).json({ error: "Lỗi khi lấy chi tiết liên hệ" });
}
});


router.get("/:id/file", async (req, res) => {
try {
    const { id } = req.params;

    const [[row]] = await pool.query(
    `SELECT 
        (SELECT f.file_path FROM contact_files f WHERE f.contact_id = c.id ORDER BY f.id DESC LIMIT 1) AS latest_file,
        c.file_path AS legacy_file
    FROM contacts c WHERE c.id = ? LIMIT 1`,
    [id]
    );

    const stored = row?.latest_file || row?.legacy_file;
    if (!stored) return res.status(404).json({ error: "Liên hệ không có tệp" });

    const rel = String(stored).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
    const abs = path.resolve(UPLOAD_DIR, rel);
    if (!abs.startsWith(UPLOAD_DIR)) return res.status(400).json({ error: "Đường dẫn không hợp lệ" });
    if (!fs.existsSync(abs)) return res.status(404).json({ error: "Tệp không tồn tại" });

    res.download(abs);
} catch (e) {
    res.status(500).json({ error: "Không tải được tệp" });
}
});

router.delete("/:id", async (req, res) => {
const conn = await pool.getConnection();
try {
    const { id } = req.params;

    const [files] = await conn.query(
    "SELECT file_path FROM contact_files WHERE contact_id = ?",
    [id]
    );
    const [[contact]] = await conn.query("SELECT file_path FROM contacts WHERE id = ?", [id]);

    await conn.query("DELETE FROM contacts WHERE id = ?", [id]);

    const toRemove = [
    ...(files || []).map((r) => r.file_path),
    contact?.file_path,
    ].filter(Boolean);

    for (const stored of toRemove) {
    const rel = String(stored).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
    const abs = path.resolve(UPLOAD_DIR, rel);
    if (abs.startsWith(UPLOAD_DIR) && fs.existsSync(abs)) {
        try {
        fs.unlinkSync(abs);
        } catch {}
    }
    }

    res.json({ ok: true });
} catch (e) {
    res.status(500).json({ error: "Không xoá được liên hệ" });
} finally {
    conn.release();
}
});

module.exports = router;
