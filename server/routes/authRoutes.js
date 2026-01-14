const express = require("express");
const db = require("../db");
const router = express.Router();

// ➤ SIGN UP (no hashing)
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
      message: "Account created!"
    });
  });
});

// ➤ LOGIN (no hashing)
router.post("/login", (req, res) => {
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
      type_id: user.type_id // ✅ REQUIRED
    });
  });
});

module.exports = router;