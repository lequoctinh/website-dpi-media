const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/category
router.get("/", async (_req, res) => {
try {
    const [rows] = await pool.query("SELECT id, name FROM category ORDER BY id ASC");
    res.json(rows);
} catch (err) {
    console.error("GET /category error:", err);
    res.status(500).json({ error: "Database error" });
}
});

// POST /api/category
router.post("/", async (req, res) => {
try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "Tên không được để trống" });

    const [rs] = await pool.execute("INSERT INTO category (name) VALUES (?)", [name]);
    res.json({ id: rs.insertId, name });
} catch (err) {
    console.error("POST /category error:", err);
    res.status(500).json({ error: "Database error" });
}
});

// PUT /api/category/:id
router.put("/:id", async (req, res) => {
try {
    const { name } = req.body || {};
    const { id } = req.params;
    if (!name) return res.status(400).json({ error: "Tên không được để trống" });

    await pool.execute("UPDATE category SET name = ? WHERE id = ?", [name, id]);
    res.json({ id: Number(id), name });
} catch (err) {
    console.error("PUT /category/:id error:", err);
    res.status(500).json({ error: "Database error" });
}
});

// DELETE /api/category/:id
router.delete("/:id", async (req, res) => {
try {
    const { id } = req.params;
    await pool.execute("DELETE FROM category WHERE id = ?", [id]);
    res.json({ success: true });
} catch (err) {
    console.error("DELETE /category/:id error:", err);
    res.status(500).json({ error: "Database error" });
}
});

module.exports = router;
