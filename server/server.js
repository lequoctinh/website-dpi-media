// server/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const app = express();

/* ---------------- Core & Security ---------------- */
app.set("trust proxy", 1); // đứng sau Nginx để lấy IP client đúng

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// CORS: whitelist domain production + localhost (dev)
const ALLOWED_ORIGINS = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  "http://dpistudio.vn",
  "https://dpistudio.vn",
];
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

// Rate limit cho toàn bộ prefix /api
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ---------------- Static folders ---------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "public")));

/* ---------------- Routes ---------------- */
// Import đúng theo tên file trong /routes của bạn
const adminRoutes = require("./routes/admin");
const adminAuthRoutes = require("./routes/adminAuth");
const backstageRoutes = require("./routes/backstage");
const emailRoutes = require("./routes/emailRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const videoProjeckRoutes = require("./routes/videoProjeckRoutes");
const uploadPosterRoute = require("./routes/uploadPosterRoute");
const contactRoutes = require("./routes/contactRoutes");
const adminContactsRoutes = require("./routes/adminContacts");

// Auth
app.use("/api/admin/auth", adminAuthRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Business
app.use("/api/backstage", backstageRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/video-projeck", videoProjeckRoutes);
app.use("/api/upload-poster", uploadPosterRoute);
app.use("/api/contacts", contactRoutes);
app.use("/api/admin/contacts", adminContactsRoutes);

/* ---------------- Health check ---------------- */
// Cho phép kiểm tra trực tiếp (port 3001) và qua Nginx (/api/health)
app.get(["/health", "/api/health"], (_req, res) => res.json({ ok: true }));

/* ---------------- 404 & Error handler ---------------- */
app.use((req, res, next) => {
  if (res.headersSent) return next();
  res.status(404).json({ error: "Not Found" });
});

// Handler lỗi tập trung (đảm bảo không lộ stack ở prod)
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  res.status(err.status || 500).json({
    error: "Internal Server Error",
  });
});

/* ---------------- Start server ---------------- */
const PORT = process.env.PORT || 3001; // .env của bạn đang PORT=3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `CORS origins: ${ALLOWED_ORIGINS.join(", ")}`
  );
});
