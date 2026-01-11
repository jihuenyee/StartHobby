const express = require("express");
const getDB = require("../db");
const router = express.Router();

<<<<<<< HEAD
// GET /api/users  → Get all users
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      u.user_id, 
      u.username, 
      u.email, 
      u.type_id,
      up.points, 
      up.xp, 
      up.current_streak_days, 
      up.last_login_date,
      m.color_name AS membership
    FROM users u
    LEFT JOIN user_progress up ON u.user_id = up.user_id
    LEFT JOIN membership m ON up.membership_id = m.membership_id
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
=======
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(`
      SELECT 
        u.user_id, u.username, u.email, u.type_id,
        up.points, up.xp, up.current_streak_days, up.last_login_date,
        m.color_name AS membership
      FROM users u
      LEFT JOIN user_progress up ON u.user_id = up.user_id
      LEFT JOIN membership m ON up.membership_id = m.membership_id
    `);
>>>>>>> e3eea3da4612d8ee5315b034f426690521ee1ab3
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

<<<<<<< HEAD
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
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
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
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});

// GET /api/users/leaderboard
router.get("/leaderboard", (req, res) => {
  const sql = `
    SELECT u.user_id, u.username, up.points, up.xp
    FROM users u
    JOIN user_progress up ON u.user_id = up.user_id
    ORDER BY up.points DESC
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
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB insert error" });
    }

    res.json({
      success: true,
      user_id: result.insertId,
      username,
      email,
      type_id,
    });
  });
});

// POST /api/users/award-badge
router.post("/award-badge", (req, res) => {
  const { user_id, badge_id } = req.body;

  if (!user_id || !badge_id) {
    return res.status(400).json({ error: "Missing user_id or badge_id" });
=======
router.get("/:userId/profile", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(`
      SELECT 
        u.user_id, u.username, u.email, u.type_id,
        up.points, up.xp, up.current_streak_days, up.last_login_date,
        m.membership_id, m.color_name, m.min_xp
      FROM users u
      LEFT JOIN user_progress up ON u.user_id = up.user_id
      LEFT JOIN membership m ON up.membership_id = m.membership_id
      WHERE u.user_id = ?
    `, [req.params.userId]);

    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
>>>>>>> e3eea3da4612d8ee5315b034f426690521ee1ab3
  }
});

router.get("/:userId/badges", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(`
      SELECT b.badge_id, b.name, b.description
      FROM userbadge ub
      JOIN badge b ON ub.badge_id = b.badge_id
      WHERE ub.user_id = ?
    `, [req.params.userId]);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(`
      SELECT u.user_id, u.username, up.points, up.xp,
             m.color_name AS membership
      FROM users u
      JOIN user_progress up ON u.user_id = up.user_id
      LEFT JOIN membership m ON up.membership_id = m.membership_id
      ORDER BY up.points DESC, up.xp DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
