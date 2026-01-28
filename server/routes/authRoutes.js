const express = require("express");
const { getDB } = require("../db");
const router = express.Router();

/* =========================
   SIGN UP (NO HASHING)
========================= */
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const db = await getDB();

    const sql = `
      INSERT INTO users (username, email, password, type_id)
      VALUES (?, ?, ?, 'normal')
    `;

    const [result] = await db.query(sql, [username, email, password]);

    res.json({
      success: true,
      user_id: result.insertId,
      username: username,
      email: email,
      type_id: 'normal',
      message: "Account created!"
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "DB insert error" });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    const db = await getDB();

    const sql = `
      SELECT user_id, username, email, type_id
      FROM users
      WHERE email = ? AND password = ?
    `;

    const [rows] = await db.query(sql, [email, password]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    res.json({
      success: true,
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      type_id: user.type_id
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "DB error" });
  }
});


router.post("/change-password", async (req, res) => {
  const { user_id, currentPassword, newPassword } = req.body;

  if (!user_id || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const db = await getDB();

    // Verify current password
    const [rows] = await db.query(
      "SELECT password FROM users WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (rows[0].password !== currentPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update to new password
    await db.query(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [newPassword, user_id]
    );

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
