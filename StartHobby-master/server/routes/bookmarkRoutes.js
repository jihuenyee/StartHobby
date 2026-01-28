const express = require("express");
const getDB = require("../db");
const router = express.Router();

router.post("/toggle", async (req, res) => {
  const { user_id, post_id } = req.body;
  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT * FROM bookmarks WHERE user_id = ? AND post_id = ?",
      [user_id, post_id]
    );

    if (rows.length) {
      await db.query(
        "DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?",
        [user_id, post_id]
      );
      return res.json({ bookmarked: false });
    }

    const [result] = await db.query(
      "INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)",
      [user_id, post_id]
    );

    res.json({ bookmarked: true, bookmark_id: result.insertId });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(`
      SELECT b.id, p.title, p.body, p.created_at
      FROM bookmarks b
      JOIN posts p ON b.post_id = p.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [req.params.userId]);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
