// server/routes/commentRoutes.js
const express = require("express");
const db = require("../db");
const router = express.Router();

// POST /api/comments  (submit comment)
router.post("/", (req, res) => {
  const { post_id, user_id, comment_text } = req.body;

  const sql = `
    INSERT INTO comments (post_id, user_id, comment_text)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [post_id, user_id, comment_text], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB insert error" });
    }

    res.json({ success: true, comment_id: result.insertId });
  });
});

// GET /api/comments/:postId  (get comments for a post)
router.get("/:postId", (req, res) => {
  const { postId } = req.params;

  const sql = `
    SELECT 
      c.comment_id,
      c.comment_text,
      c.created_at,
      u.user_id,
      u.username
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;

  db.query(sql, [postId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json(rows);
  });
});

// GET /api/comments/:postId - get all comments for a post
router.get("/:postId", (req, res) => {
  const sql = `
    SELECT c.comment_id, c.comment_text, c.created_at,
           u.user_id, u.username
    FROM comments c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
  `;

  db.query(sql, [req.params.postId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB fetch error" });
    }
    res.json(rows);
  });
});


module.exports = router;
