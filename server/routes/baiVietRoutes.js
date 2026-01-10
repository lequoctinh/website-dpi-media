const express = require("express");
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// 1. Cấu hình lưu trữ ảnh
const uploadDir = path.join(__dirname, "../uploads/news");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
destination: (_req, _file, cb) => cb(null, uploadDir),
filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
},
});

const upload = multer({
storage,
limits: { fileSize: 8 * 1024 * 1024 }, 
});

// 2. Hàm bổ trợ (Helpers)
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
    const sql = "SELECT id FROM bai_viet WHERE slug=? " + (excludeId ? "AND id<>?" : "") + " LIMIT 1";
    const [rows] = await pool.query(sql, excludeId ? [slug, excludeId] : [slug]);
    if (!rows.length) return slug;
    slug = `${baseSlug}-${i++}`;
}
return `${baseSlug}-${Date.now()}`;
}

// Mapper để đồng nhất dữ liệu trả về cho Frontend
function mapArticleRow(r) {
return {
    id: r.id,
    categoryId: r.category_id,
    categoryName: r.category_name, 
    title: r.tieu_de,
    slug: r.slug,
    thumbnail: r.hinh_anh,
    excerpt: r.mo_ta_ngan,
    content: r.noi_dung,
    author: r.tac_gia,
    status: r.trang_thai,
    isFeatured: !!r.is_featured,
    metaDescription: r.meta_description,
    views: r.luot_xem,
    published_at: r.ngay_dang,
    created_at: r.created_at,
    updated_at: r.updated_at,
};
}

// 3. API Routes

router.get("/", async (req, res) => {
try {
    let { status, q, categoryId, isFeatured, page = 1, limit = 12 } = req.query;
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 12));
    const offset = (page - 1) * limit;

    const cond = [];
    const params = [];

    if (status) { cond.push("bv.trang_thai = ?"); params.push(status); }
    if (q) { cond.push("(bv.tieu_de LIKE ? OR bv.mo_ta_ngan LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
    if (categoryId) { cond.push("bv.category_id = ?"); params.push(categoryId); }
    if (isFeatured !== undefined) { cond.push("bv.is_featured = ?"); params.push(isFeatured === 'true' ? 1 : 0); }

    const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";

    const sql = `
    SELECT bv.*, c.name as category_name 
    FROM bai_viet bv
    LEFT JOIN category c ON bv.category_id = c.id
    ${where}
    ORDER BY bv.is_featured DESC, COALESCE(bv.ngay_dang, bv.created_at) DESC
    LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(sql, [...params, limit, offset]);
    const [cnt] = await pool.query(`SELECT COUNT(*) AS total FROM bai_viet bv ${where}`, params);

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

// --- Lấy chi tiết (Dùng cho trang bài viết đơn phía Client) ---
router.get("/:idOrSlug", async (req, res) => {
try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    const sql = `
    SELECT bv.*, c.name as category_name 
    FROM bai_viet bv
    LEFT JOIN category c ON bv.category_id = c.id
    WHERE bv.${isId ? "id=?" : "slug=?"} LIMIT 1
    `;
    const [rows] = await pool.query(sql, [idOrSlug]);
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.json(mapArticleRow(rows[0]));
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi lấy chi tiết bài viết" });
}
});

// --- Tạo bài viết mới ---
router.post("/", upload.single("hinh_anh"), async (req, res) => {
try {
    const { tieu_de, mo_ta_ngan, noi_dung, tac_gia, trang_thai, category_id, is_featured, meta_description } = req.body;
    if (!tieu_de) return res.status(400).json({ message: "Thiếu tiêu đề bài viết" });

    const status = trang_thai === "xuat_ban" ? "xuat_ban" : "nhap";
    const slug = await uniqueSlug(makeSlug(tieu_de));
    const imgPath = req.file ? `/uploads/news/${req.file.filename}` : null;

    const sql = `
    INSERT INTO bai_viet 
    (category_id, tieu_de, slug, hinh_anh, mo_ta_ngan, noi_dung, tac_gia, trang_thai, is_featured, meta_description, ngay_dang)
    VALUES (?,?,?,?,?,?,?,?,?,?, CASE WHEN ?='xuat_ban' THEN NOW() ELSE NULL END)
    `;
    
    const [rs] = await pool.query(sql, [
    category_id || null, 
    tieu_de, 
    slug, 
    imgPath, 
    mo_ta_ngan || null, 
    noi_dung || null, 
    tac_gia || null, 
    status, 
    is_featured === 'true' || is_featured == 1 ? 1 : 0,
    meta_description || null,
    status
    ]);

    res.status(201).json({ id: rs.insertId, message: "Tạo bài viết thành công" });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi server khi tạo bài viết" });
}
});

// --- Cập nhật bài viết ---
router.put("/:id", upload.single("hinh_anh"), async (req, res) => {
try {
    const { id } = req.params;
    const { tieu_de, mo_ta_ngan, noi_dung, tac_gia, trang_thai, category_id, is_featured, meta_description } = req.body;

    const [oldRows] = await pool.query("SELECT hinh_anh, tieu_de FROM bai_viet WHERE id=?", [id]);
    if (!oldRows.length) return res.status(404).json({ message: "Bài viết không tồn tại" });
    const old = oldRows[0];

    let imgPath = old.hinh_anh;
    if (req.file) {
    imgPath = `/uploads/news/${req.file.filename}`;
    if (old.hinh_anh) {
        const oldPath = path.join(__dirname, "..", old.hinh_anh);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    }

    const slug = tieu_de && tieu_de !== old.tieu_de ? await uniqueSlug(makeSlug(tieu_de), id) : undefined;

    const sql = `
    UPDATE bai_viet SET 
        category_id=?, tieu_de=?, ${slug ? "slug=?," : ""} hinh_anh=?, 
        mo_ta_ngan=?, noi_dung=?, tac_gia=?, trang_thai=?, 
        is_featured=?, meta_description=?, updated_at=NOW()
    WHERE id=?
    `;

    const params = [
    category_id || null,
    tieu_de || old.tieu_de,
    ...(slug ? [slug] : []),
    imgPath,
    mo_ta_ngan || null,
    noi_dung || null,
    tac_gia || null,
    trang_thai || 'nhap',
    is_featured === 'true' || is_featured == 1 ? 1 : 0,
    meta_description || null,
    id
    ];

    await pool.query(sql, params);
    res.json({ message: "Cập nhật thành công" });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi cập nhật bài viết" });
}
});

// --- Xóa bài viết ---
router.delete("/:id", async (req, res) => {
try {
    const [rows] = await pool.query("SELECT hinh_anh FROM bai_viet WHERE id=?", [req.params.id]);
    if (rows.length && rows[0].hinh_anh) {
    const file = path.join(__dirname, "..", rows[0].hinh_anh);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    }
    await pool.query("DELETE FROM bai_viet WHERE id=?", [req.params.id]);
    res.json({ message: "Đã xóa bài viết vĩnh viễn" });
} catch (e) {
    res.status(500).json({ message: "Lỗi khi xóa bài viết" });
}
});

module.exports = router;