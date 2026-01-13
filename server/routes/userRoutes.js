// server/routes/userRoutes.js
const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/users/:userId/profile
router.get("/:userId/profile", (req, res) => {
  const sql = `
    SELECT 
      u.user_id, u.username, u.email, u.type_id,
      up.points, up.xp, up.current_streak_days, up.last_login_date,
      m.membership_id, m.color_name, m.min_xp
    FROM users u
    LEFT JOIN user_progress up ON u.user_id = up.user_id
    LEFT JOIN membership m ON up.membership_id = m.membership_id
    WHERE u.user_id = ?
  `;
  db.query(sql, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  });
});

// GET /api/users/:userId/badges
router.get("/:userId/badges", (req, res) => {
  const sql = `
    SELECT b.badge_id, b.name, b.description
    FROM userbadge ub
    JOIN badge b ON ub.badge_id = b.badge_id
    WHERE ub.user_id = ?
  `;
  db.query(sql, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// GET /api/users/leaderboard
router.get("/leaderboard", (req, res) => {
  const sql = `
    SELECT 
      u.user_id, 
      u.username,
      up.points, 
      up.xp,
      m.color_name AS membership
    FROM users u
    JOIN user_progress up ON u.user_id = up.user_id
    LEFT JOIN membership m ON up.membership_id = m.membership_id
    ORDER BY up.points DESC, up.xp DESC
    LIMIT 20
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// POST /api/users/signup
router.post("/signup", (req, res) => {
  const { username, email, password, type_id } = req.body;
  const sql = `
    INSERT INTO users (username, email, password, type_id)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [username, email, password, type_id], (err, result) => {
    if (err) return res.status(500).json({ error: "DB insert error" });
    res.json({ success: true, user_id: result.insertId });
  });
});

// POST /api/users/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.query(sql, [email, password], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ success: true, user: rows[0] });
  });
});

// POST /api/users/award-badge
router.post("/award-badge", (req, res) => {
  const { user_id, badge_id } = req.body;
  if (!user_id || !badge_id) return res.status(400).json({ error: "Missing user_id or badge_id" });

  const sql = `INSERT INTO userbadge (user_id, badge_id) VALUES (?, ?)`;
  db.query(sql, [user_id, badge_id], (err, result) => {
    if (err) return res.status(500).json({ error: "DB insert error" });
    res.json({ success: true, userbadge_id: result.insertId });
  });
});

// POST /api/users/update-progress
router.post("/update-progress", (req, res) => {
  const { user_id, xp_gain, points_gain } = req.body;
  const sql = `UPDATE user_progress SET xp = xp + ?, points = points + ? WHERE user_id = ?`;
  db.query(sql, [xp_gain, points_gain, user_id], (err) => {
    if (err) return res.status(500).json({ error: "DB update error" });
    res.json({ success: true });
  });
});

// POST /api/users/update-streak
router.post("/update-streak", (req, res) => {
  const { user_id } = req.body;
  const sql = `SELECT current_streak_days, last_login_date FROM user_progress WHERE user_id = ?`;
  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const { current_streak_days, last_login_date } = rows[0];
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = current_streak_days;

    if (!last_login_date || last_login_date < today) {
      newStreak = last_login_date === yesterday ? current_streak_days + 1 : 1;

      const updateSql = `UPDATE user_progress SET current_streak_days = ?, last_login_date = ? WHERE user_id = ?`;
      db.query(updateSql, [newStreak, today, user_id], (err2) => {
        if (err2) return res.status(500).json({ error: "DB update error" });
        return res.json({ success: true, current_streak_days: newStreak, last_login_date: today });
      });
    } else {
      res.json({ success: true, message: "Already updated today", current_streak_days });
    }
  });
});

// GET /api/users
router.get("/", (req, res) => {
  const sql = `SELECT user_id, username, email FROM users`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// POST /api/users/update-membership
router.post("/update-membership", (req, res) => {
  const { user_id } = req.body;
  const xpSql = `SELECT xp FROM user_progress WHERE user_id = ?`;
  db.query(xpSql, [user_id], (err, xpRows) => {
    if (err) return res.status(500).json({ error: "DB error (xp)" });
    if (!xpRows.length) return res.status(404).json({ error: "User not found" });

    const userXp = xpRows[0].xp;
    const membershipSql = `
      SELECT membership_id
      FROM membership
      WHERE min_xp <= ?
      ORDER BY min_xp DESC
      LIMIT 1
    `;
    db.query(membershipSql, [userXp], (err2, mRows) => {
      if (err2) return res.status(500).json({ error: "DB error (membership)" });
      const newMembershipId = mRows[0].membership_id;

      const updateSql = `UPDATE user_progress SET membership_id = ? WHERE user_id = ?`;
      db.query(updateSql, [newMembershipId, user_id], (err3) => {
        if (err3) return res.status(500).json({ error: "DB update error" });
        return res.json({ success: true, new_membership_id: newMembershipId, xp: userXp });
      });
    });
  });
});

// ✅ NEW: PUT /api/users/:userId
router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { password, email, username } = req.body;

  if (!password && !email && !username) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const fields = [];
  const values = [];

  if (password) { fields.push("password = ?"); values.push(password); }
  if (email) { fields.push("email = ?"); values.push(email); }
  if (username) { fields.push("username = ?"); values.push(username); }

  values.push(userId);

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`;
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: "DB update error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "User updated successfully" });
  });
});

module.exports = router;
