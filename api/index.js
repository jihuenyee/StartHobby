require("dotenv").config();
const express = require("express");
const cors = require("cors");
const getDB = require("../server/db");

// Import routes (from /server/routes)
const quizRoutes = require("../server/routes/quizRoutes");
const postRoutes = require("../server/routes/postRoutes");
const hobbyGameRoutes = require("../server/routes/hobbyGameRoutes");
const userRoutes = require("../server/routes/userRoutes");
const commentRoutes = require("../server/routes/commentRoutes");
const likeRoutes = require("../server/routes/likeRoutes");
const bookmarkRoutes = require("../server/routes/bookmarkRoutes");
const notificationRoutes = require("../server/routes/notificationRoutes");
const followRoutes = require("../server/routes/followRoutes");
const authRoutes = require("../server/routes/authRoutes");

const app = express();

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON parser
app.use(express.json());

// Root: /api
app.get("/", (req, res) => {
  res.send("StartHobby API is running 🚀");
});

// ❗ NO /api prefix here
app.use("/quizzes", quizRoutes);
app.use("/posts", postRoutes);
app.use("/hobby-game", hobbyGameRoutes);
app.use("/users", userRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);
app.use("/bookmarks", bookmarkRoutes);
app.use("/notifications", notificationRoutes);
app.use("/follows", followRoutes);
app.use("/auth", authRoutes);

// Test DB: /api/test-db
app.get("/test-db", async (req, res) => {
  try {
    const db = await getDB();
    const [results] = await db.query("SELECT * FROM users LIMIT 5");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export for Vercel
module.exports = app;
