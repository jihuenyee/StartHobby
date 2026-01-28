const express = require("express");
const getDB = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  const { post_id, user_id, comment_text } = req.body;
  try {
    const db = await getDB();
    const [result] = await db.query(
      "INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)",
      [post_id, user_id, comment_text]
    );
    res.json({ success: true, comment_id: result.insertId });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(`
      SELECT c.comment_id, c.comment_text, c.created_at,
             u.user_id, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.postId]);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
