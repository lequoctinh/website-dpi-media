const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// MySQL pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Lấy tất cả video
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm video mới
router.post("/", async (req, res) => {
  const { title, youtube_url, poster } = req.body;
  const [result] = await db.query(
    "INSERT INTO videos (title, youtube_url, poster) VALUES (?, ?, ?)",
    [title, youtube_url, poster]
  );
  res.json({ message: "Video added successfully", id: result.insertId });
});

// Cập nhật video
router.put("/:id", async (req, res) => {
  const { title, youtube_url, poster } = req.body;
  await db.query(
    "UPDATE videos SET title = ?, youtube_url = ?, poster = ? WHERE id = ?",
    [title, youtube_url, poster, req.params.id]
  );
  res.json({ message: "Video updated" });
});


// Xoá video
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM videos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
  