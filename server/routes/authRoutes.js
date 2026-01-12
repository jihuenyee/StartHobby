// server/routes/auth.js
const express = require("express");
const getDB = require("../db");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const db = await getDB();
    const [result] = await db.query(`
      INSERT INTO users (username, email, password, type_id)
      VALUES (?, ?, ?, 'normal')
    `, [username, email, password]);

    res.json({
      success: true,
      user_id: result.insertId,
      username,
      email,
      type_id: "normal",
    });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (!rows.length)
      return res.status(400).json({ error: "Invalid credentials" });

    const u = rows[0];
    res.json({
      success: true,
      user_id: u.user_id,
      username: u.username,
      email: u.email,
      type_id: u.type_id,
    });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
