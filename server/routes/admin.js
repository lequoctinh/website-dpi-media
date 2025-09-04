const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// Pool dùng chung
const db = mysql.createPool({
host: process.env.DB_HOST || "localhost",
user: process.env.DB_USER || "root",
password: process.env.DB_PASSWORD || "",
database: process.env.DB_NAME || "mediatp",
});

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
    try {
        const [videoProjeckRes, categoryRes, backstageRes, contactRes] = await Promise.all([
        db.query("SELECT COUNT(*) AS count FROM `videoprojeck`"),
        db.query("SELECT COUNT(*) AS count FROM `category`"),
        db.query("SELECT COUNT(*) AS count FROM `backstage`"),
        db.query("SELECT COUNT(*) AS count FROM `contacts`"), // 👈 thêm
        ]);

        res.json({
        videoProjeckCount: Number(videoProjeckRes[0][0]?.count || 0),
        categoryCount: Number(categoryRes[0][0]?.count || 0),
        backstageCount: Number(backstageRes[0][0]?.count || 0),
        contactCount: Number(contactRes[0][0]?.count || 0),   // 👈 thêm
        updatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("GET /admin/stats error:", err);
        res.status(500).json({ error: "Lỗi lấy thống kê" });
    }
});

module.exports = router;
