// server/routes/likeRoutes.js
const express = require("express");
const db = require("../db");
const router = express.Router();

// 👉 Make sure the likes table exists
const createTableSQL = `
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(createTableSQL, (err) => {
  if (err) console.error("❌ Failed to ensure likes table exists:", err);
  else console.log("✅ Likes table ready");
});

// 👉 POST /api/likes/toggle
router.post("/toggle", (req, res) => {
  const { post_id, user_id } = req.body;

  if (!post_id || !user_id) {
    return res.status(400).json({ error: "post_id and user_id required" });
  }

  console.log("🔍 LIKE Request:", req.body);

  // Check if like exists
  const checkSQL = `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`;

  db.query(checkSQL, [post_id, user_id], (err, rows) => {
    if (err) {
      console.error("❌ LIKE CHECK ERROR:", err);
      return res.status(500).json({ error: "DB error", details: err });
    }

    // 🔄 Already liked -> Unlike
    if (rows.length > 0) {
      const deleteSQL = `DELETE FROM likes WHERE post_id = ? AND user_id = ?`;

      db.query(deleteSQL, [post_id, user_id], (err2) => {
        if (err2) {
          console.error("❌ UNLIKE ERROR:", err2);
          return res.status(500).json({ error: "DB delete error", details: err2 });
        }

        console.log("👍 Unliked successfully");
        return res.json({ liked: false, message: "Unliked" });
      });
    }

    // ❤️ Not liked -> Insert like
    else {
      const insertSQL = `INSERT INTO likes (post_id, user_id) VALUES (?, ?)`;

      db.query(insertSQL, [post_id, user_id], (err3, result) => {
        if (err3) {
          console.error("❌ LIKE INSERT ERROR:", err3);
          return res.status(500).json({ error: "DB insert error", details: err3 });
        }

        console.log("❤️ Liked successfully, ID:", result.insertId);
        return res.json({ liked: true, message: "Liked", like_id: result.insertId });
      });
    }
  });
});

module.exports = router;
