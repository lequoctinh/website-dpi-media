// server/routes/adminAuth.js
const express = require("express");
const pool = require("../db"); 
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Tạo pool kết nối ngay trong file này
const pool = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD || "",
database: process.env.DB_NAME,
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0,
timezone: "Z",
charset: "utf8mb4_general_ci",
});

// Helper tạo JWT
function signToken(payload, expiresIn) {
return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

// Helper set cookie httpOnly
function setAuthCookie(res, token, remember) {
res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // đổi thành true khi deploy HTTPS
    maxAge: remember
    ? 7 * 24 * 60 * 60 * 1000 // 7 ngày
    : 24 * 60 * 60 * 1000, // 1 ngày
    path: "/",
});
}

// POST /api/admin/auth/login
router.post("/login", async (req, res) => {
try {
    const { username, password, remember } = req.body;

    if (!username || !password) {
    return res.status(400).json({ error: "Thiếu tài khoản hoặc mật khẩu" });
    }

    const [rows] = await pool.query(
    "SELECT id, username, password FROM admin_users WHERE username = ? LIMIT 1",
    [username]
    );
    if (!rows || rows.length === 0) {
    return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
    return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
    }

    const expires = remember ? "7d" : "1d";
    const token = signToken({ uid: user.id, uname: user.username }, expires);
    setAuthCookie(res, token, !!remember);

    return res.json({ message: "Đăng nhập thành công", username: user.username });
} catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Lỗi server" });
}
});

// GET /api/admin/auth/me
router.get("/me", async (req, res) => {
try {
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ error: "Chưa đăng nhập" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ uid: decoded.uid, username: decoded.uname });
} catch (err) {
    return res.status(401).json({ error: "Phiên đăng nhập không hợp lệ" });
}
});

// POST /api/admin/auth/logout
router.post("/logout", (req, res) => {
res.clearCookie("admin_token", { path: "/" });
return res.json({ message: "Đã đăng xuất" });
});

module.exports = router;
