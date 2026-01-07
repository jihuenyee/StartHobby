require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const quizRoutes = require("./routes/quizRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const followRoutes = require("./routes/followRoutes");
const authRoutes = require("./routes/authRoutes");
const hobbyGameRoutes = require("./routes/hobbyGameRoutes");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ✅ Put root route at the very top
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

// Test route
app.get("/test-db", (req, res) => {
  db.query("SELECT * FROM users LIMIT 5", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error", details: err });
    }
    res.json(results);
  });
});

// ✅ Make sure module export is correct
module.exports = app;
