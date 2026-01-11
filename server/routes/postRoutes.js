const express = require("express");
const getDB = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(`
      SELECT p.id, p.title, p.body, p.created_at,
             u.user_id, u.username
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/", async (req, res) => {
  const { title, body, user_id } = req.body;

  try {
    const db = await getDB();
    const [result] = await db.query(
      "INSERT INTO posts (title, body, user_id, status) VALUES (?, ?, ?, 'published')",
      [title, body, user_id]
    );
    res.json({ success: true, post_id: result.insertId });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
