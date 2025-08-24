const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise"); // ✅ Dùng promise API
const bcrypt = require("bcrypt");

// ✅ Kết nối sử dụng Promise Pool
const db = mysql.createPool({
host: process.env.DB_HOST || "localhost",
user: process.env.DB_USER || "root",
password: process.env.DB_PASSWORD || "",
database: process.env.DB_NAME || "mediatp",
});


router.get("/stats", async (req, res) => {
try {
    const [videoRes] = await db.query("SELECT COUNT(*) as count FROM videos");
    const [videoProjeckRes] = await db.query("SELECT COUNT(*) as count FROM videoprojeck");
    const [categoryRes] = await db.query("SELECT COUNT(*) as count FROM category");
    const [backstageRes] = await db.query("SELECT COUNT(*) as count FROM backstage");
    const [partnerRes] = await db.query("SELECT COUNT(*) as count FROM partners");

    res.json({
    videoCount: videoRes[0].count,
    videoProjeckCount: videoProjeckRes[0].count,
    categoryCount: categoryRes[0].count,
    backstageCount: backstageRes[0].count,
    partnerCount: partnerRes[0].count,
    });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy thống kê" });
}
});

module.exports = router;
