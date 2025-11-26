// server/routes/postRoutes.js
const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/posts  → list published posts with author
router.get("/", (req, res) => {
  const sql = `
    SELECT p.id, p.title, p.body, p.status, p.created_at,
           u.user_id, u.username
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});

// GET /api/posts/:id  → single post
router.get("/:id", (req, res) => {
  const sql = `
    SELECT p.id, p.title, p.body, p.status, p.created_at,
           u.user_id, u.username
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    WHERE p.id = ?
  `;
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    if (!rows.length) return res.status(404).json({ error: "Post not found" });
    res.json(rows[0]);
  });
});

// POST /api/posts
router.post("/", (req, res) => {
  const { title, body, user_id } = req.body;

  const sql = `
    INSERT INTO posts (title, body, user_id, status)
    VALUES (?, ?, ?, 'published')
  `;

  db.query(sql, [title, body, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: "DB insert error" });

    res.json({ success: true, post_id: result.insertId });
  });
});


module.exports = router;
