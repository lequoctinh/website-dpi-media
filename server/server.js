// ------------------ Load .env by NODE_ENV ------------------
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";
const envCandidates = [
  path.join(__dirname, `.env.${env}`),
  path.join(__dirname, ".env"),
];
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

// ------------------ Core deps ------------------
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const app = express();
const isProd = process.env.NODE_ENV === "production";

// Chỉ trust proxy khi chạy sau Nginx/Reverse Proxy (prod)
if (isProd) app.set("trust proxy", 1);
app.disable("x-powered-by");

// Helmet: tắt CSP mặc định (tuỳ app frontend), bật CORP: cross-origin để phục vụ ảnh
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// Nén response
app.use(compression());

// Giới hạn body JSON (có thể chỉnh qua env nếu cần upload JSON lớn)
const JSON_LIMIT = process.env.JSON_LIMIT || "1mb";
app.use(express.json({ limit: JSON_LIMIT }));
app.use(cookieParser());

// --------------- CORS allow-list ---------------
const ENV_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = Array.from(new Set(ENV_ORIGINS));

const corsOptions = {
  origin(origin, cb) {
    // cho phép tools/server-side không có Origin
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(null, false); // sẽ trả 200 nhưng chặn CORS — đủ an toàn
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

// Preflight cho tất cả routes
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// --------- Rate limit cho toàn bộ /api (tuỳ chỉnh) ---------
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --------- Static files ----------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "public")));

// ------------------ Routes ------------------
const adminRoutes = require("./routes/admin");
const adminAuthRoutes = require("./routes/adminAuth");
const backstageRoutes = require("./routes/backstage");
const emailRoutes = require("./routes/emailRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const videoProjeckRoutes = require("./routes/videoProjeckRoutes");
const uploadPosterRoute = require("./routes/uploadPosterRoute");
const contactRoutes = require("./routes/contactRoutes");
const adminContactsRoutes = require("./routes/adminContacts");
const baiVietRoutes = require("./routes/baiVietRoutes");

// Healthcheck
app.get(["/health", "/api/health"], (_req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV || "development" })
);

// API mounts
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/backstage", backstageRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/video-projeck", videoProjeckRoutes);
app.use("/api/upload-poster", uploadPosterRoute);
app.use("/api/contacts", contactRoutes);
app.use("/api/admin/contacts", adminContactsRoutes);
app.use("/api/bai-viet", baiVietRoutes);

// 404
app.use((req, res, next) => {
  if (res.headersSent) return next();
  return res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal Server Error" : err.message,
  });
});

// Process-level error safety nets
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  const mode = isProd ? "PROD" : "DEV";
  console.log(`(${mode}) Server is running on http://localhost:${PORT}`);
  console.log(`CORS origins: ${ALLOWED_ORIGINS.join(", ") || "(none)"}`);
});
