const express = require("express");
const getDB = require("../db");
const router = express.Router();

router.post("/toggle", async (req, res) => {
  const { post_id, user_id } = req.body;

  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT * FROM likes WHERE post_id = ? AND user_id = ?",
      [post_id, user_id]
    );

    if (rows.length) {
      await db.query(
        "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
        [post_id, user_id]
      );
      return res.json({ liked: false });
    }

    const [result] = await db.query(
      "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
      [post_id, user_id]
    );

    res.json({ liked: true, like_id: result.insertId });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
