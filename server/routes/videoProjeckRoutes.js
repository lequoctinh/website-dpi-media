const express = require("express");
const router = express.Router();
const pool = require("../db"); // dùng pool chung, bỏ mysql2 ở đây
// GET /api/video-projeck
router.get("/", async (req, res) => {
  try {
    const { category_id } = req.query;

    let sql = "SELECT * FROM videoprojeck";
    const params = [];
    const cond = [];

    if (category_id) {
      cond.push("category_id = ?");
      params.push(category_id);
    }

    if (cond.length) {
      sql += " WHERE " + cond.join(" AND ");
    }

    sql += " ORDER BY featured DESC, created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /video-projeck error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// GET /api/video-projeck/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM videoprojeck WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy video" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /video-projeck/:id error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// POST /api/video-projeck
router.post("/", async (req, res) => {
  try {
    const { title, youtube_url, video_id, poster, category_id, featured } = req.body || {};
    const feat = featured ? 1 : 0;

    const [rs] = await pool.execute(
      "INSERT INTO videoprojeck (title, youtube_url, video_id, poster, category_id, featured) VALUES (?, ?, ?, ?, ?, ?)",
      [title, youtube_url, video_id, poster, category_id, feat]
    );
    res.status(201).json({ id: rs.insertId, message: "Đã thêm video thành công" });
  } catch (err) {
    console.error("POST /video-projeck error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// PUT /api/video-projeck/:id
router.put("/:id", async (req, res) => {
  try {
    const { title, youtube_url, video_id, poster, category_id, featured } = req.body || {};
    const feat = featured ? 1 : 0;

    await pool.execute(
      "UPDATE videoprojeck SET title=?, youtube_url=?, video_id=?, poster=?, category_id=?, featured=? WHERE id=?",
      [title, youtube_url, video_id, poster, category_id, feat, req.params.id]
    );
    res.json({ message: "Cập nhật video thành công" });
  } catch (err) {
    console.error("PUT /video-projeck/:id error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// DELETE /api/video-projeck/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.execute("DELETE FROM videoprojeck WHERE id = ?", [req.params.id]);
    res.json({ message: "Đã xoá video thành công" });
  } catch (err) {
    console.error("DELETE /video-projeck/:id error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
