const express = require("express");
const getDB = require("../db");
const router = express.Router();

router.post("/toggle", async (req, res) => {
  const { following_user_id, followed_user_id } = req.body;

  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT * FROM follows WHERE following_user_id = ? AND followed_user_id = ?",
      [following_user_id, followed_user_id]
    );

    if (rows.length) {
      await db.query(
        "DELETE FROM follows WHERE following_user_id = ? AND followed_user_id = ?",
        [following_user_id, followed_user_id]
      );
      return res.json({ following: false });
    }

    const [result] = await db.query(
      "INSERT INTO follows (following_user_id, followed_user_id, created_at) VALUES (?, ?, NOW())",
      [following_user_id, followed_user_id]
    );

    res.json({ following: true, follow_id: result.insertId });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
