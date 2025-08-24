const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Lưu poster vào thư mục uploads/posterhighlight
const storage = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, "uploads/posterhighlight/");
},
filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
},
});

const upload = multer({ storage });

// POST /api/upload-poster-highlight
router.post("/", upload.single("poster"), (req, res) => {
if (!req.file) return res.status(400).json({ error: "Không có file được upload" });
const filePath = `/uploads/posterhighlight/${req.file.filename}`;
res.json({ path: filePath });
});

module.exports = router;
