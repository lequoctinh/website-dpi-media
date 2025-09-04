// server/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

/* ---------------- Security & core middlewares ---------------- */
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS: bắt buộc chỉ định origin cụ thể khi dùng cookie httpOnly
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ---------------- Static folders ---------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "public")));

/* ---------------- Routes ---------------- */
// import đúng theo tên file trong /routes của bạn
const adminRoutes = require("./routes/admin");
const adminAuthRoutes = require("./routes/adminAuth");
const backstageRoutes = require("./routes/backstage");
const emailRoutes = require("./routes/emailRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const videoProjeckRoutes = require("./routes/videoProjeckRoutes"); 
const uploadPosterRoute = require("./routes/uploadPosterRoute");
const contactRoutes = require("./routes/contactRoutes");
const adminContactsRoutes = require("./routes/adminContacts");

app.use("/api/admin/auth", adminAuthRoutes);

app.use("/api/admin", adminRoutes);

// Business routes
app.use("/api/backstage", backstageRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/video-projeck", videoProjeckRoutes);
app.use("/api/upload-poster", uploadPosterRoute);
app.use("/api/contacts", contactRoutes);
app.use("/api/admin/contacts", adminContactsRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS origin = ${process.env.CLIENT_ORIGIN || "http://localhost:5173"}`);
});
