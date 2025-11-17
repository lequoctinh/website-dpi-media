const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Thư mục lưu file
const POSTERS_DIR = path.join(__dirname, "../uploads/posters");
if (!fs.existsSync(POSTERS_DIR)) {
fs.mkdirSync(POSTERS_DIR, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
destination: (_req, _file, cb) => cb(null, POSTERS_DIR),
filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
},
});

const upload = multer({
storage,
limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
    if (!ok) {
    return cb(new Error("Chỉ cho phép ảnh PNG/JPG/WebP/GIF"));
    }
    cb(null, true);
},
});

router.post("/", upload.single("poster"), (req, res) => {
console.log("Upload poster - file:", req.file); // debug

if (!req.file) {
    return res.status(400).json({ error: "Không có file được gửi lên." });
}

const relPath = `/uploads/posters/${req.file.filename}`;
return res.status(200).json({ posterPath: relPath });
});

module.exports = router;
