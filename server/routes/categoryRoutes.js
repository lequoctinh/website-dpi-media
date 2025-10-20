const express = require("express");
const pool = require("../db"); 
const router = express.Router();




router.get("/", (req, res) => {
db.query("SELECT * FROM category ORDER BY id ASC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
});
});

router.post("/", (req, res) => {
const { name } = req.body;
if (!name) return res.status(400).json({ error: "Tên không được để trống" });

db.query("INSERT INTO category (name) VALUES (?)", [name], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name });
});
});

router.put("/:id", (req, res) => {
const { name } = req.body;
const { id } = req.params;
if (!name) return res.status(400).json({ error: "Tên không được để trống" });

db.query("UPDATE category SET name = ? WHERE id = ?", [name, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id, name });
});
});

router.delete("/:id", (req, res) => {
const { id } = req.params;
db.query("DELETE FROM category WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
});
});

module.exports = router;
