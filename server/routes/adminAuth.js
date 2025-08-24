const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const db = mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
});

router.post("/login", (req, res) => {
const { username, password } = req.body;

db.query("SELECT * FROM admin_users WHERE username = ?", [username], (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    if (results.length === 0) return res.status(401).json({ error: "Sai tài khoản" });

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) return res.status(500).json({ error: "Lỗi so sánh mật khẩu" });
    if (!isMatch) return res.status(401).json({ error: "Sai mật khẩu" });

    res.json({ token: "tpmedia_admin_ok", username: user.username });
    });
});
});

module.exports = router;
