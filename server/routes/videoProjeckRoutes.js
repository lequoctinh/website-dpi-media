const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.get("/", (req, res) => {
  const { category_id } = req.query;
  let query = `SELECT * FROM videoprojeck`;
  const params = [];

  if (category_id) {
    query += ` WHERE category_id = ?`;
    params.push(category_id);
  }

  query += ` ORDER BY created_at DESC`;

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err }); 
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM videoprojeck WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: "Không tìm thấy video" });
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { title, youtube_url, video_id, poster, category_id } = req.body;
  const query = `
    INSERT INTO videoprojeck (title, youtube_url, video_id, poster, category_id) 
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [title, youtube_url, video_id, poster, category_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, message: "Đã thêm video thành công" });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, youtube_url, video_id, poster, category_id } = req.body;
  const query = `
    UPDATE videoprojeck 
    SET title = ?, youtube_url = ?, video_id = ?, poster = ?, category_id = ?
    WHERE id = ?
  `;
  db.query(query, [title, youtube_url, video_id, poster, category_id, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Cập nhật video thành công" });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM videoprojeck WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Đã xoá video thành công" });
  });
});

module.exports = router;
