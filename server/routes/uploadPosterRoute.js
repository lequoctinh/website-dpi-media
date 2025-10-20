const express = require("express");
const pool = require("../db"); 
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
destination: (req, file, cb) => {
    cb(null, "uploads/posters/");
},
filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
},
});

const upload = multer({ storage });

router.post("/", upload.single("poster"), (req, res) => {
if (!req.file) {
    return res.status(400).json({ error: "Không có file được gửi lên." });
}

res.status(200).json({ posterPath: `/uploads/posters/${req.file.filename}` });
});

module.exports = router;
