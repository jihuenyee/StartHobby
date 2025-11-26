const express = require("express");
const db = require("../db");
const router = express.Router();

// POST /api/follows/toggle
router.post("/toggle", (req, res) => {
  const { following_user_id, followed_user_id } = req.body;

  if (!following_user_id || !followed_user_id) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Check if already following
  const checkSql = `
    SELECT * FROM follows
    WHERE following_user_id = ? AND followed_user_id = ?
  `;

  db.query(checkSql, [following_user_id, followed_user_id], (err, rows) => {
    if (err) {
      console.error("Follow check error:", err);
      return res.status(500).json({ error: "DB error" });
    }

    // Already following → UNFOLLOW
    if (rows.length > 0) {
      const unfollowSql = `
        DELETE FROM follows
        WHERE following_user_id = ? AND followed_user_id = ?
      `;
      db.query(unfollowSql, [following_user_id, followed_user_id], (err) => {
        if (err) {
          console.error("Unfollow error:", err);
          return res.status(500).json({ error: "DB delete error" });
        }
        return res.json({ following: false, message: "Unfollowed" });
      });
    } else {
      // Not following → FOLLOW
      const followSql = `
        INSERT INTO follows (following_user_id, followed_user_id, created_at)
        VALUES (?, ?, NOW())
      `;
      db.query(followSql, [following_user_id, followed_user_id], (err, result) => {
        if (err) {
          console.error("Follow insert error:", err);
          return res.status(500).json({ error: "DB insert error" });
        }
        res.json({ following: true, message: "Followed", follow_id: result.insertId });
      });
    }
  });
});

module.exports = router;
