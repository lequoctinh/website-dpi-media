const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

const pool = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
});

// 📥 GET: Lấy tất cả đối tác
router.get('/', async (req, res) => {
try {
    const [rows] = await pool.execute('SELECT * FROM partners ORDER BY id DESC');
    res.json(rows);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
}
});

// ➕ POST: Thêm đối tác mới
router.post('/', async (req, res) => {
const { name, logo } = req.body;
if (!name || !logo) {
    return res.status(400).json({ error: 'Vui lòng cung cấp name và logo' });
}

try {
    const [result] = await pool.execute(
    'INSERT INTO partners (name, logo) VALUES (?, ?)',
    [name, logo]
    );
    res.json({ message: 'Đã thêm đối tác', id: result.insertId });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi thêm đối tác' });
}
});

// 🖊 PUT: Cập nhật đối tác
router.put('/:id', async (req, res) => {
const { name, logo } = req.body;
const { id } = req.params;

if (!name || !logo) {
    return res.status(400).json({ error: 'Vui lòng cung cấp name và logo' });
}

try {
    await pool.execute(
    'UPDATE partners SET name = ?, logo = ? WHERE id = ?',
    [name, logo, id]
    );
    res.json({ message: 'Đã cập nhật đối tác' });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi cập nhật đối tác' });
}
});

// ❌ DELETE: Xoá đối tác
router.delete('/:id', async (req, res) => {
const { id } = req.params;
try {
    await pool.execute('DELETE FROM partners WHERE id = ?', [id]);
    res.json({ message: 'Đã xoá đối tác' });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi xoá đối tác' });
}
});

module.exports = router;
