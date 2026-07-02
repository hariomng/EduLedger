require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { getUserFromCookie } = require("./lib/auth.js");
const materialsRouter = require("./routes/materials.js");
const marketRouter = require("./routes/market-materials.js");
const profileRouter = require("./routes/profile.js");
const uploadRouter = require("./routes/upload.js");
const topAuthorsRouter = require("./routes/top-authors.js");
const fetchRouter = require("./routes/fetch.js");
const healthRouter = require("./routes/health.js");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Attach authenticated user (if present) to req.user using backend auth helper
app.use(async (req, res, next) => {
  try {
    const user = await getUserFromCookie(req);
    if (user) req.user = user;
  } catch (err) {
    console.error("Auth middleware error:", err);
  }
  return next();
});

// Capture x-client-id header and attach to req.clientId for downstream handlers
app.use((req, res, next) => {
  try {
    const clientId = req.get("x-client-id") || req.headers["x-client-id"] || null;
    if (clientId) req.clientId = clientId;
  } catch (err) {
    console.warn("Failed to read x-client-id header:", err);
  }
  return next();
});

app.use("/api/materials", materialsRouter);
app.use("/api/market-materials", marketRouter);
app.use("/api/profile", profileRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/top-authors", topAuthorsRouter);
app.use("/api/fetch", fetchRouter);
app.use("/api/health", healthRouter);

app.listen(process.env.BACKEND_PORT || 4000);
