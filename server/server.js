const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const partnerRoutes = require('./routes/partnerRoutes');
const backstageRoutes = require('./routes/backstage');
const emailRoutes = require('./routes/emailRoutes');
const videoRoutes = require('./routes/videoRoutes');
const videoProjeckRoutes = require("./routes/videoProjeckRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminAuthRoutes = require("./routes/adminAuth");
const uploadPosterRoute = require("./routes/uploadPosterRoute"); 
const adminRoutes = require("./routes/admin");
const uploadPosterHighlight = require("./routes/uploadPosterHighlight");

const app = express();

app.use(cors());
app.use(express.json());

// Static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public')));
app.use("/api/admin", adminRoutes);
// API routes
app.use('/api/email', emailRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/backstage', backstageRoutes);
app.use('/api/videos', videoRoutes);
app.use("/api/video-projeck", videoProjeckRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/admin", adminRoutes);       
app.use("/api/admin-auth", adminAuthRoutes); 
app.use("/api/upload-poster", uploadPosterRoute);
app.use("/api/upload-poster-highlight", uploadPosterHighlight);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
