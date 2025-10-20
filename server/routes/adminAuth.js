
const express = require("express");
const pool = require("../db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

function signToken(payload, expiresIn) {
return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

const isProd = process.env.NODE_ENV === "production";

function setAuthCookie(res, token, remember) {
res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax", 
    secure: isProd,                  
    maxAge: remember ? 7*24*60*60*1000 : 24*60*60*1000,
    path: "/",
});
}
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


router.post("/logout", (req, res) => {
res.clearCookie("admin_token", { path: "/" });
return res.json({ message: "Đã đăng xuất" });
});

module.exports = router;
