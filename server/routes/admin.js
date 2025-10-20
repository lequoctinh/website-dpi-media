const express = require("express");
const pool = require("../db");      
const router = express.Router();

router.get("/stats", async (req, res) => {
try {
    const [
    videoProjeckRes,
    categoryRes,
    backstageRes,
    contactRes,
    ] = await Promise.all([
    pool.query("SELECT COUNT(*) AS count FROM videoprojeck"),
    pool.query("SELECT COUNT(*) AS count FROM category"),
    pool.query("SELECT COUNT(*) AS count FROM backstage"),
    pool.query("SELECT COUNT(*) AS count FROM contacts"),
    ]);

    res.json({
    videoProjeckCount: Number(videoProjeckRes[0][0]?.count || 0),
    categoryCount:     Number(categoryRes[0][0]?.count || 0),
    backstageCount:    Number(backstageRes[0][0]?.count || 0),
    contactCount:      Number(contactRes[0][0]?.count || 0),
    updatedAt: new Date().toISOString(),
    });
} catch (err) {
    console.error("GET /admin/stats error:", err);
    res.status(500).json({ error: "Lỗi lấy thống kê" });
}
});

module.exports = router;
