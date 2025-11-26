const express = require("express");
const db = require("../db");
const router = express.Router();

// ➤ Ensure table exists
const sql = `
CREATE TABLE IF NOT EXISTS bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(sql, (err) => {
  if (err) console.error("❌ Bookmark table error:", err);
  else console.log("✅ Bookmark table ready");
});

// ➤ Toggle bookmark
router.post("/toggle", (req, res) => {
  const { user_id, post_id } = req.body;

  if (!user_id || !post_id) {
    return res.status(400).json({ error: "user_id and post_id required" });
  }

  db.query(
    "SELECT * FROM bookmarks WHERE user_id = ? AND post_id = ?",
    [user_id, post_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error", details: err });

      // Already bookmarked → remove
      if (rows.length > 0) {
        db.query(
          "DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?",
          [user_id, post_id],
          (err2) => {
            if (err2) return res.status(500).json({ error: "DB delete error", details: err2 });
            return res.json({ bookmarked: false, message: "Removed bookmark" });
          }
        );
      }

      // Not bookmarked → insert
      else {
        db.query(
          "INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)",
          [user_id, post_id],
          (err3, result) => {
            if (err3) return res.status(500).json({ error: "DB insert error", details: err3 });
            return res.json({ bookmarked: true, message: "Bookmarked", bookmark_id: result.insertId });
          }
        );
      }
    }
  );
});

// ➤ Get user's bookmarks
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT b.id, p.title, p.body, p.created_at
    FROM bookmarks b
    JOIN posts p ON b.post_id = p.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error", details: err });
    res.json(rows);
  });
});

module.exports = router;
