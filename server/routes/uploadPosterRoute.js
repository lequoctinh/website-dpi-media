const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const POSTERS_DIR = path.join(__dirname, "../uploads/posters");
if (!fs.existsSync(POSTERS_DIR)) fs.mkdirSync(POSTERS_DIR, { recursive: true });


const storage = multer.diskStorage({
destination: (_req, _file, cb) => cb(null, POSTERS_DIR),
filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
},
});

const upload = multer({
storage,
limits: { fileSize: 10 * 1024 * 1024 }, 
fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
    cb(ok ? null : new Error("Chỉ cho phép ảnh PNG/JPG/WebP/GIF"));
},
});

router.post("/", (req, res) => {
upload.single("poster")(req, res, (err) => {
    if (err) {
    const msg = err.message || "Lỗi upload";
    return res.status(400).json({ error: msg });
    }
    if (!req.file) {
    return res.status(400).json({ error: "Không có file được gửi lên." });
    }

    const relPath = `/uploads/posters/${req.file.filename}`;
    return res.status(200).json({ posterPath: relPath });
});
});

module.exports = router;
