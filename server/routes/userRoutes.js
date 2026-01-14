const express = require("express");
const { getDB } = require("../db");
const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT user_id, username, email, type_id FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "DB error: " + err.message });
  }
});

// PUT update user
router.put("/:userId", async (req, res) => {
  try {
    const db = await getDB();
    const { userId } = req.params;
    const { email, username, type_id } = req.body;

    const fields = [];
    const values = [];

    if (email) { fields.push("email = ?"); values.push(email); }
    if (username) { fields.push("username = ?"); values.push(username); }
    if (type_id !== undefined) { fields.push("type_id = ?"); values.push(type_id); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    values.push(userId);

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`;
    await db.query(sql, values);
    
    // Fetch the updated user to return to frontend
    const [updated] = await db.query(
        "SELECT user_id, username, email, type_id FROM users WHERE user_id = ?", 
        [userId]
    );

    res.json({ success: true, user: updated[0] });
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).json({ error: "DB update error" });
  }
});

module.exports = router;