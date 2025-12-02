// server/routes/auth.js
const express = require("express");
const db = require("../db");

const router = express.Router();

/**
 * POST /api/auth/signup
 */
router.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sql = `
    INSERT INTO users (username, email, password, type_id)
    VALUES (?, ?, ?, 'normal')
  `;

  db.query(sql, [username, email, password], (err, result) => {
    if (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ error: "DB insert error" });
    }

    res.json({
      success: true,
      user_id: result.insertId,
      username,
      email,
      message: "Account created!",
    });
  });
});

/**
 * POST /api/auth/Login
 * (Matches "/auth/Login" used in AuthContext)
 */
router.post("/Login", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT * FROM users
    WHERE email = ? AND password = ?
  `;

  db.query(sql, [email, password], (err, rows) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "DB error" });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    res.json({
      success: true,
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    });
  });
});

/**
 * POST /api/auth/change-password
 * Used by AuthContext.changePassword()
 */
router.post("/change-password", (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  // FIXED syntax: missing || operator
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 1. Verify current password
  const selectSql = `
    SELECT * FROM users
    WHERE email = ? AND password = ?
  `;

  db.query(selectSql, [email, currentPassword], (err, rows) => {
    if (err) {
      console.error("Change password - select error:", err);
      return res.status(500).json({ error: "DB error" });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    // 2. Update to new password
    const updateSql = `
      UPDATE users
      SET password = ?
      WHERE email = ?
    `;

    db.query(updateSql, [newPassword, email], (err2) => {
      if (err2) {
        console.error("Change password - update error:", err2);
        return res.status(500).json({ error: "Failed to update password." });
      }

      return res.json({
        success: true,
        message: "Password changed successfully.",
      });
    });
  });
});

module.exports = router;
