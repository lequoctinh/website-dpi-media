const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Kết nối DB
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Cấu hình upload ảnh vào public/backstage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/backstage'));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });


// 📌 GET tất cả ảnh hậu kỳ
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM backstage');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// 📌 POST - Thêm ảnh hậu kỳ
router.post('/', upload.single('img'), async (req, res) => {
    try {
        const { name } = req.body;
        const imgPath = '/images/backstage/' + req.file.filename;

        await pool.execute('INSERT INTO backstage (name, img) VALUES (?, ?)', [name, imgPath]);
        res.json({ message: 'Thêm ảnh hậu kỳ thành công', path: imgPath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi thêm ảnh hậu kỳ' });
    }
});


// 📌 PUT - Cập nhật hậu kỳ (tên + hình mới nếu có)
router.put('/:id', upload.single('img'), async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    try {
        let updateSql, params;

        if (req.file) {
            const newPath = '/images/backstage/' + req.file.filename;

            // Xoá file cũ (nếu có)
            const [rows] = await pool.query('SELECT img FROM backstage WHERE id = ?', [id]);
            if (rows[0]?.img) {
                const oldImgPath = path.join(__dirname, '../public', rows[0].img);
                if (fs.existsSync(oldImgPath)) {
                    fs.unlinkSync(oldImgPath);
                }
            }

            updateSql = 'UPDATE backstage SET name = ?, img = ? WHERE id = ?';
            params = [name, newPath, id];
        } else {
            updateSql = 'UPDATE backstage SET name = ? WHERE id = ?';
            params = [name, id];
        }

        await pool.execute(updateSql, params);
        res.json({ message: 'Cập nhật hậu kỳ thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi cập nhật hậu kỳ' });
    }
});


// 📌 DELETE - Xoá hậu kỳ
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy đường dẫn ảnh để xoá file
        const [rows] = await pool.query('SELECT img FROM backstage WHERE id = ?', [id]);
        if (rows[0]?.img) {
            const imgPath = path.join(__dirname, '../public', rows[0].img);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }

        await pool.query('DELETE FROM backstage WHERE id = ?', [id]);
        res.json({ message: 'Xoá hậu kỳ thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi xoá hậu kỳ' });
    }
});

module.exports = router;
