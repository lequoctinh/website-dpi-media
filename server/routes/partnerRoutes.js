// server/routes/partnerRoutes.js
const express = require("express");
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ------------------ UPLOAD CONFIG ------------------
const uploadDir = path.join(__dirname, "../uploads/partner");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const MAX_MB = Number(process.env.UPLOAD_PARTNER_MAX_MB || 5);
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

const singleLogo = (field) => (req, res, next) =>
upload.single(field)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res
        .status(413)
        .json({ message: `Logo quá lớn (tối đa ${MAX_MB}MB)` });
    }
    return res.status(400).json({ message: `Lỗi upload: ${err.code}` });
    }
    return res.status(400).json({ message: err.message || "Lỗi upload" });
});

// ------------------ HELPERS ------------------
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
    "SELECT id FROM partners WHERE slug=? " +
    (excludeId ? "AND id<>?" : "") +
    " LIMIT 1";
    const [rows] = await pool.query(
    sql,
    excludeId ? [slug, excludeId] : [slug]
    );
    if (!rows.length) return slug;
    slug = `${baseSlug}-${i++}`;
}
return `${baseSlug}-${Date.now()}`;
}

function mapPartnerRow(r) {
return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    logo: r.logo,
    alt_text: r.alt_text,
    website_url: r.website_url,
    industry: r.industry,
    tier: r.tier,
    show_on_home: Boolean(r.show_on_home),
    sort_order: r.sort_order,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
};
}

// ------------------ LIST (PUBLIC + ADMIN) ------------------
router.get("/", async (req, res) => {
try {
    let {
    status = "hien",
    home,
    tier,
    q,
    page = 1,
    limit = 50,
    } = req.query;

    page = Math.max(1, Number(page) || 1);
    limit = Math.min(200, Math.max(1, Number(limit) || 50));
    const off = (page - 1) * limit;

    const cond = [];
    const params = [];

    if (status) {
    cond.push("status=?");
    params.push(status);
    }
    if (home === "1" || home === "true") {
    cond.push("show_on_home=1");
    }
    if (tier) {
    cond.push("tier=?");
    params.push(tier);
    }
    if (q) {
    cond.push("(name LIKE ? OR industry LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
    }

    const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";

    const [rows] = await pool.query(
    `
    SELECT id,name,slug,logo,alt_text,website_url,industry,tier,
            show_on_home,sort_order,status,created_at,updated_at
    FROM partners
    ${where}
    ORDER BY FIELD(tier,'strategic','featured','regular'),
            sort_order ASC,
            id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, limit, off]
    );

    const [cnt] = await pool.query(
    `SELECT COUNT(*) AS total FROM partners ${where}`,
    params
    );

    res.json({
    data: rows.map(mapPartnerRow),
    page,
    limit,
    total: cnt[0].total,
    });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi lấy danh sách đối tác" });
}
});

// ------------------ DETAIL ------------------
router.get("/:idOrSlug", async (req, res) => {
try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    const [rows] = await pool.query(
    `
    SELECT id,name,slug,logo,alt_text,website_url,industry,tier,
            show_on_home,sort_order,status,created_at,updated_at
    FROM partners
    WHERE ${isId ? "id=?" : "slug=?"}
    LIMIT 1
    `,
    [idOrSlug]
    );
    if (!rows.length)
    return res.status(404).json({ message: "Không tìm thấy đối tác" });
    res.json(mapPartnerRow(rows[0]));
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi lấy chi tiết đối tác" });
}
});

// ------------------ CREATE (ADMIN) ------------------
router.post("/", singleLogo("logo"), async (req, res) => {
try {
    const {
    name,
    alt_text,
    website_url,
    industry,
    tier,
    show_on_home,
    sort_order,
    status,
    } = req.body;

    if (!name) return res.status(400).json({ message: "Thiếu tên đối tác" });

    const validTier = ["strategic", "featured", "regular"];
    const tierVal = validTier.includes(tier) ? tier : "regular";

    const showHomeVal =
    show_on_home === "0" || show_on_home === "false" ? 0 : 1;

    const sortVal = Number(sort_order) || 0;
    const statusVal = status === "an" ? "an" : "hien";

    const baseSlug = makeSlug(name);
    const slug = await uniqueSlug(baseSlug);

    const logoPath = req.file
    ? `/uploads/partner/${req.file.filename}`
    : null;
    if (!logoPath) {
    return res.status(400).json({ message: "Thiếu logo đối tác" });
    }

    const [rs] = await pool.query(
    `
    INSERT INTO partners
    (name,slug,logo,alt_text,website_url,industry,tier,show_on_home,sort_order,status)
    VALUES (?,?,?,?,?,?,?,?,?,?)
    `,
    [
        name,
        slug,
        logoPath,
        alt_text || null,
        website_url || null,
        industry || null,
        tierVal,
        showHomeVal,
        sortVal,
        statusVal,
    ]
    );

    const [rows] = await pool.query(
    `
    SELECT id,name,slug,logo,alt_text,website_url,industry,tier,
            show_on_home,sort_order,status,created_at,updated_at
    FROM partners
    WHERE id=? LIMIT 1
    `,
    [rs.insertId]
    );

    res.json({
    ...mapPartnerRow(rows[0]),
    message: "Tạo đối tác thành công",
    });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi tạo đối tác" });
}
});

// ------------------ UPDATE (ADMIN) ------------------
router.put("/:id", singleLogo("logo"), async (req, res) => {
try {
    const { id } = req.params;
    const {
    name,
    alt_text,
    website_url,
    industry,
    tier,
    show_on_home,
    sort_order,
    status,
    } = req.body;

    const [oldRows] = await pool.query(
    `
    SELECT name,logo,alt_text,website_url,industry,tier,
            show_on_home,sort_order,status
    FROM partners
    WHERE id=? LIMIT 1
    `,
    [id]
    );
    if (!oldRows.length)
    return res.status(404).json({ message: "Không tìm thấy đối tác" });

    const old = oldRows[0];

    const validTier = ["strategic", "featured", "regular"];
    const tierVal = validTier.includes(tier) ? tier : old.tier || "regular";
    const showHomeVal =
    show_on_home === "0" || show_on_home === "false"
        ? 0
        : show_on_home === "1" || show_on_home === "true"
        ? 1
        : old.show_on_home;
    const sortVal =
    typeof sort_order !== "undefined"
        ? Number(sort_order) || 0
        : old.sort_order;
    const statusVal =
    status === "an" || status === "hien" ? status : old.status || "hien";

    const baseSlug = makeSlug(name || old.name);
    const slug = await uniqueSlug(baseSlug, id);

    let logoPath = old.logo;
    if (req.file) {
    logoPath = `/uploads/partner/${req.file.filename}`;
    if (old.logo) {
        const oldFile = path.join(
        __dirname,
        "..",
        old.logo.replace(/^\//, "")
        );
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }
    }

    await pool.query(
    `
    UPDATE partners
    SET name=?, slug=?, logo=?, alt_text=?, website_url=?, industry=?,
        tier=?, show_on_home=?, sort_order=?, status=?, updated_at=NOW()
    WHERE id=?
    `,
    [
        name || old.name,
        slug,
        logoPath,
        typeof alt_text !== "undefined" ? alt_text || null : old.alt_text,
        typeof website_url !== "undefined"
        ? website_url || null
        : old.website_url,
        typeof industry !== "undefined" ? industry || null : old.industry,
        tierVal,
        showHomeVal,
        sortVal,
        statusVal,
        id,
    ]
    );

    const [rows] = await pool.query(
    `
    SELECT id,name,slug,logo,alt_text,website_url,industry,tier,
            show_on_home,sort_order,status,created_at,updated_at
    FROM partners
    WHERE id=? LIMIT 1
    `,
    [id]
    );

    res.json({
    ...mapPartnerRow(rows[0]),
    message: "Cập nhật đối tác thành công",
    });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi cập nhật đối tác" });
}
});

// ------------------ PATCH STATUS (ẩn/hiện) ------------------
router.patch("/:id/status", async (req, res) => {
try {
    const { id } = req.params;
    const { status } = req.body;
    const statusVal = status === "an" ? "an" : "hien";

    await pool.query(
    "UPDATE partners SET status=?, updated_at=NOW() WHERE id=?",
    [statusVal, id]
    );

    const [rows] = await pool.query(
    `
    SELECT id,name,slug,logo,alt_text,website_url,industry,tier,
            show_on_home,sort_order,status,created_at,updated_at
    FROM partners
    WHERE id=? LIMIT 1
    `,
    [id]
    );

    if (!rows.length)
    return res.status(404).json({ message: "Không tìm thấy đối tác" });

    res.json({
    ...mapPartnerRow(rows[0]),
    message: "Cập nhật trạng thái thành công",
    });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
}
});

// ------------------ PATCH SHOW_ON_HOME ------------------
router.patch("/:id/home", async (req, res) => {
try {
    const { id } = req.params;
    const { show_on_home } = req.body;
    const val =
    show_on_home === "0" || show_on_home === "false"
        ? 0
        : show_on_home === "1" || show_on_home === "true"
        ? 1
        : 1;

    await pool.query(
    "UPDATE partners SET show_on_home=?, updated_at=NOW() WHERE id=?",
    [val, id]
    );

    const [rows] = await pool.query(
    `
    SELECT id,name,slug,logo,alt_text,website_url,industry,tier,
            show_on_home,sort_order,status,created_at,updated_at
    FROM partners
    WHERE id=? LIMIT 1
    `,
    [id]
    );

    if (!rows.length)
    return res.status(404).json({ message: "Không tìm thấy đối tác" });

    res.json({
    ...mapPartnerRow(rows[0]),
    message: "Cập nhật hiển thị trang chủ thành công",
    });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi cập nhật show_on_home" });
}
});

// ------------------ DELETE ------------------
router.delete("/:id", async (req, res) => {
try {
    const { id } = req.params;

    const [rows] = await pool.query(
    "SELECT logo FROM partners WHERE id=? LIMIT 1",
    [id]
    );
    if (!rows.length)
    return res.status(404).json({ message: "Không tìm thấy đối tác" });

    const logo = rows[0].logo;
    if (logo) {
    const file = path.join(__dirname, "..", logo.replace(/^\//, ""));
    if (fs.existsSync(file)) fs.unlinkSync(file);
    }

    await pool.query("DELETE FROM partners WHERE id=?", [id]);
    res.json({ message: "Đã xóa đối tác" });
} catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi xóa đối tác" });
}
});

module.exports = router;
