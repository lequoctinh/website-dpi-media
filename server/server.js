// ------------------ Load ENV (server/.env[.production]) ------------------
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "production";
const envCandidates = [
  path.join(__dirname, `.env.${env}`), // server/.env.production khi NODE_ENV=production
  path.join(__dirname, ".env"),        // server/.env
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
const isProd = (process.env.NODE_ENV || "production") === "production";

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const ENV_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const FALLBACK_ORIGINS = [
  "http://dpistudio.vn",
  "https://dpistudio.vn",
];

const ALLOWED_ORIGINS = Array.from(new Set([...ENV_ORIGINS, ...FALLBACK_ORIGINS]));

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

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

app.get(["/health", "/api/health"], (_req, res) => res.json({ ok: true }));

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/backstage", backstageRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/video-projeck", videoProjeckRoutes);
app.use("/api/upload-poster", uploadPosterRoute);
app.use("/api/contacts", contactRoutes);
app.use("/api/admin/contacts", adminContactsRoutes);

app.use((req, res, next) => {
  if (res.headersSent) return next();
  return res.status(404).json({ error: "Not Found" });
});

app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  res.status(err.status || 500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
