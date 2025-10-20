
const express = require("express");
const pool = require("../db"); 
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads/news");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const MAX_MB = Number(process.env.UPLOAD_NEWS_MAX_MB || 8);
const MAX_BYTES = MAX_MB * 1024 * 1024;

const storage = multer.diskStorage({
destination: (_req, _file, cb) => cb(null, uploadDir),
filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
},
});

const fileFilter = (_req, file, cb) => {
const ok = /image\/(png|jpe?g|webp|gif|svg\+xml)/i.test(file.mimetype);
cb(ok ? null : new Error("Chỉ cho phép file ảnh"), ok);
};

const upload = multer({
storage,
fileFilter,
limits: { fileSize: MAX_BYTES },
});

const singleImage = (field) => (req, res, next) =>
upload.single(field)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: `Ảnh quá lớn (tối đa ${MAX_MB}MB)` });
    }
    return res.status(400).json({ message: `Lỗi upload: ${err.code}` });
    }
    return res.status(400).json({ message: err.message || "Lỗi upload" });
});

const makeSlug = (s) =>
String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function uniqueSlug(baseSlug, excludeId = null) {
let slug = baseSlug || String(Date.now());
let i = 1;
while (i <= 50) {
    const sql =
    "SELECT id FROM bai_viet WHERE slug=? " + (excludeId ? "AND id<>?" : "") + " LIMIT 1";
    const [rows] = await pool.query(sql, excludeId ? [slug, excludeId] : [slug]);
    if (!rows.length) return slug;
    slug = `${baseSlug}-${i++}`;
}
return `${baseSlug}-${Date.now()}`;
}

function mapArticleRow(r) {
return {
    id: r.id,
    title: r.tieu_de,
    slug: r.slug,
    thumbnail: r.hinh_anh,
    excerpt: r.mo_ta_ngan,
    content: r.noi_dung,
    author: r.tac_gia,
    status: r.trang_thai,
    views: r.luot_xem,
    published_at: r.ngay_dang,
    created_at: r.created_at,
    updated_at: r.updated_at,
};
}

router.get("/", async (req, res) => {
try {
    let { status = "xuat_ban", q, page = 1, limit = 12 } = req.query;
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 12));
    const off = (page - 1) * limit;

    const cond = [];
    const params = [];

    if (status) {
    cond.push("trang_thai=?");
    params.push(status);
    }
    if (q) {
    cond.push("(tieu_de LIKE ? OR mo_ta_ngan LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
    }

    const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
    const [rows] = await pool.query(
    `SELECT id,tieu_de,slug,hinh_anh,mo_ta_ngan,noi_dung,tac_gia,trang_thai,ngay_dang,luot_xem,created_at,updated_at
    FROM bai_viet
    ${where}
    ORDER BY COALESCE(ngay_dang, created_at) DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, off]
    );

    const [cnt] = await pool.query(
    `SELECT COUNT(*) AS total FROM bai_viet ${where}`,
    params
    );

    res.json({
    data: rows.map(mapArticleRow),
    page,
    limit,
    total: cnt[0].total,
    });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi lấy danh sách bài viết" });
}
});

router.get("/:idOrSlug", async (req, res) => {
try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    const [rows] = await pool.query(
    `SELECT id,tieu_de,slug,hinh_anh,mo_ta_ngan,noi_dung,tac_gia,trang_thai,ngay_dang,luot_xem,created_at,updated_at
    FROM bai_viet
    WHERE ${isId ? "id=?" : "slug=?"} LIMIT 1`,
    [idOrSlug]
    );
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.json(mapArticleRow(rows[0]));
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi lấy chi tiết bài viết" });
}
});

router.post("/", singleImage("hinh_anh"), async (req, res) => {
try {
    const { tieu_de, mo_ta_ngan, noi_dung, tac_gia, trang_thai } = req.body;
    if (!tieu_de) return res.status(400).json({ message: "Thiếu tiêu đề" });

    const status = trang_thai === "xuat_ban" ? "xuat_ban" : "nhap";
    const baseSlug = makeSlug(tieu_de);
    const slug = await uniqueSlug(baseSlug);
    const imgPath = req.file ? `/uploads/news/${req.file.filename}` : null;

    const [rs] = await pool.query(
    `INSERT INTO bai_viet
    (tieu_de, slug, hinh_anh, mo_ta_ngan, noi_dung, tac_gia, trang_thai, ngay_dang)
    VALUES (?,?,?,?,?,?,?, CASE WHEN ?='xuat_ban' THEN NOW() ELSE NULL END)`,
    [tieu_de, slug, imgPath, mo_ta_ngan || null, noi_dung || null, tac_gia || null, status, status]
    );

    const [rows] = await pool.query(
    `SELECT id,tieu_de,slug,hinh_anh,mo_ta_ngan,noi_dung,tac_gia,trang_thai,ngay_dang,luot_xem,created_at,updated_at
    FROM bai_viet WHERE id=? LIMIT 1`,
    [rs.insertId]
    );
    res.json({ ...mapArticleRow(rows[0]), message: "Tạo bài viết thành công" });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi tạo bài viết" });
}
});

router.put("/:id", singleImage("hinh_anh"), async (req, res) => {
try {
    const { id } = req.params;
    const { tieu_de, mo_ta_ngan, noi_dung, tac_gia, trang_thai } = req.body;

    const [oldRows] = await pool.query(
    "SELECT tieu_de,hinh_anh,trang_thai,ngay_dang FROM bai_viet WHERE id=? LIMIT 1",
    [id]
    );
    if (!oldRows.length) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    const old = oldRows[0];

    const status =
    trang_thai === "xuat_ban" ? "xuat_ban" : trang_thai === "nhap" ? "nhap" : old.trang_thai;
    const baseSlug = makeSlug(tieu_de || old.tieu_de);
    const slug = await uniqueSlug(baseSlug, id);

    let imgPath = old.hinh_anh;
    if (req.file) {
    imgPath = `/uploads/news/${req.file.filename}`;
    if (old.hinh_anh) {
        const oldFile = path.join(__dirname, "..", old.hinh_anh.replace(/^\//, ""));
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }
    }

    await pool.query(
    `UPDATE bai_viet
    SET tieu_de=?, slug=?, hinh_anh=?, mo_ta_ngan=?, noi_dung=?, tac_gia=?, trang_thai=?,
        ngay_dang = CASE WHEN ?='xuat_ban' AND ngay_dang IS NULL THEN NOW() ELSE ngay_dang END,
        updated_at=NOW()
    WHERE id=?`,
    [
        tieu_de || old.tieu_de,
        slug,
        imgPath,
        mo_ta_ngan || null,
        noi_dung || null,
        tac_gia || null,
        status,
        status,
        id,
    ]
    );

    const [rows] = await pool.query(
    `SELECT id,tieu_de,slug,hinh_anh,mo_ta_ngan,noi_dung,tac_gia,trang_thai,ngay_dang,luot_xem,created_at,updated_at
    FROM bai_viet WHERE id=? LIMIT 1`,
    [id]
    );
    res.json({ ...mapArticleRow(rows[0]), message: "Cập nhật bài viết thành công" });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi cập nhật bài viết" });
}
});

router.patch("/:id/publish", async (req, res) => {
try {
    const { id } = req.params;
    await pool.query(
    "UPDATE bai_viet SET trang_thai='xuat_ban', ngay_dang=COALESCE(ngay_dang, NOW()), updated_at=NOW() WHERE id=?",
    [id]
    );
    const [rows] = await pool.query(
    `SELECT id,tieu_de,slug,hinh_anh,mo_ta_ngan,noi_dung,tac_gia,trang_thai,ngay_dang,luot_xem,created_at,updated_at
    FROM bai_viet WHERE id=? LIMIT 1`,
    [id]
    );
    res.json({ ...mapArticleRow(rows[0]), message: "Đã xuất bản bài viết" });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi xuất bản" });
}
});

router.patch("/:id/view", async (req, res) => {
try {
    const { id } = req.params;
    await pool.query("UPDATE bai_viet SET luot_xem = luot_xem + 1 WHERE id=?", [id]);
    res.json({ message: "OK" });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi cập nhật lượt xem" });
}
});

router.delete("/:id", async (req, res) => {
try {
    const { id } = req.params;

    const [rows] = await pool.query("SELECT hinh_anh FROM bai_viet WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy bài viết" });

    if (rows[0].hinh_anh) {
    const file = path.join(__dirname, "..", rows[0].hinh_anh.replace(/^\//, ""));
    if (fs.existsSync(file)) fs.unlinkSync(file);
    }

    await pool.query("DELETE FROM bai_viet WHERE id=?", [id]);
    res.json({ message: "Đã xóa bài viết" });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi xóa bài viết" });
}
});

module.exports = router;
