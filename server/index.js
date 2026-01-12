require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const getDB = require("./db")

// Import routes
const quizRoutes = require("./routes/quizRoutes");
const postRoutes = require("./routes/postRoutes");
const hobbyGameRoutes = require("./routes/hobbyGameRoutes");
const userRoutes = require("./routes/userRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const followRoutes = require("./routes/followRoutes");
const authRoutes = require("./routes/authRoutes");

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

// ✅ Root route
app.get("/", (req, res) => {
  res.send("StartHobby API is running 🚀");
});

// API routes
app.use("/api/quizzes", quizRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/hobby-game", hobbyGameRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/auth", authRoutes);

// Test database
app.get("/test-db", async (req, res) => {
  try {
    const db = await getDB();
    const [results] = await db.query("SELECT * FROM users LIMIT 5");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server if run directly (for local development)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// ✅ Export app for Vercel
module.exports = app;
