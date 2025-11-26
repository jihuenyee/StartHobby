const express = require("express");
const db = require("../db");
const router = express.Router();

// CREATE notification
router.post("/", (req, res) => {
  const { user_id, type, message } = req.body;

  if (!user_id || !type || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sql = `
    INSERT INTO notifications (user_id, type, message)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [user_id, type, message], (err, result) => {
    if (err) {
      console.error("Notification insert error:", err);
      return res.status(500).json({ error: "DB insert error" });
    }
    res.json({ success: true, notification_id: result.insertId });
  });
});

// GET all notifications for a user
router.get("/:userId", (req, res) => {
  const sql = `
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [req.params.userId], (err, rows) => {
    if (err) {
      console.error("Notification fetch error:", err);
      return res.status(500).json({ error: "DB fetch error" });
    }
    res.json(rows);
  });
});

// MARK notification as read
router.put("/read/:id", (req, res) => {
  const sql = `
    UPDATE notifications
    SET is_read = 1
    WHERE notification_id = ?
  `;

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error("Notification update error:", err);
      return res.status(500).json({ error: "DB update error" });
    }
    res.json({ success: true });
  });
});

module.exports = router;
