const express = require("express");
const getDB = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, type, message } = req.body;

  try {
    const db = await getDB();
    const [result] = await db.query(
      "INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)",
      [user_id, type, message]
    );
    res.json({ success: true, notification_id: result.insertId });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
