const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Kết nối database
const db = mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
});

// 📥 GET tất cả danh mục
router.get("/", (req, res) => {
db.query("SELECT * FROM category ORDER BY id ASC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
});
});

// ➕ POST – Thêm danh mục mới
router.post("/", (req, res) => {
const { name } = req.body;
if (!name) return res.status(400).json({ error: "Tên không được để trống" });

db.query("INSERT INTO category (name) VALUES (?)", [name], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name });
});
});

// ✏️ PUT – Cập nhật danh mục
router.put("/:id", (req, res) => {
const { name } = req.body;
const { id } = req.params;
if (!name) return res.status(400).json({ error: "Tên không được để trống" });

db.query("UPDATE category SET name = ? WHERE id = ?", [name, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id, name });
});
});

// ❌ DELETE – Xoá danh mục
router.delete("/:id", (req, res) => {
const { id } = req.params;
db.query("DELETE FROM category WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
});
});

module.exports = router;
