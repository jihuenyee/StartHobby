const express = require("express");
const getDB = require("../db");
const router = express.Router();

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
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

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
