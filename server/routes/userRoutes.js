// server/routes/userRoutes.js
const express = require("express");
const db = require("../db");
const router = express.Router();

/**
 * GET /api/users
 * Return all users with basic info + progress + membership
 */
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
      console.error("DB error (GET /api/users):", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

/**
 * GET /api/users/:userId/profile
 * Detailed profile for one user
 */
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
      console.error("DB error (GET /:userId/profile):", err);
      return res.status(500).json({ error: "DB error" });
    }
    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(rows[0]);
  });
});

/**
 * GET /api/users/:userId/badges
 * Badges earned by user
 */
router.get("/:userId/badges", (req, res) => {
  const sql = `
    SELECT b.badge_id, b.name, b.description
    FROM userbadge ub
    JOIN badge b ON ub.badge_id = b.badge_id
    WHERE ub.user_id = ?
  `;

  db.query(sql, [req.params.userId], (err, rows) => {
    if (err) {
      console.error("DB error (GET /:userId/badges):", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});

/**
 * GET /api/users/leaderboard
 * Top 20 users by points/xp
 */
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
    if (err) {
      console.error("DB error (GET /leaderboard):", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});

/**
 * POST /api/users/award-badge
 * Give a badge to a user
 */
router.post("/award-badge", (req, res) => {
  const { user_id, badge_id } = req.body;

  if (!user_id || !badge_id) {
    return res.status(400).json({ error: "Missing user_id or badge_id" });
  }

  const sql = `
    INSERT INTO userbadge (user_id, badge_id)
    VALUES (?, ?)
  `;

  db.query(sql, [user_id, badge_id], (err, result) => {
    if (err) {
      console.error("DB error (POST /award-badge):", err);
      return res.status(500).json({ error: "DB insert error" });
    }

    res.json({ success: true, userbadge_id: result.insertId });
  });
});

/**
 * POST /api/users/update-progress
 * Update XP + points for a user
 */
router.post("/update-progress", (req, res) => {
  const { user_id, xp_gain, points_gain } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  const sql = `
    UPDATE user_progress
    SET xp = xp + ?, points = points + ?
    WHERE user_id = ?
  `;

  db.query(sql, [xp_gain || 0, points_gain || 0, user_id], (err, result) => {
    if (err) {
      console.error("DB error (POST /update-progress):", err);
      return res.status(500).json({ error: "DB update error" });
    }

    res.json({ success: true });
  });
});

/**
 * POST /api/users/update-streak
 * Update login streak for the day
 */
router.post("/update-streak", (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  const sql = `
    SELECT current_streak_days, last_login_date
    FROM user_progress
    WHERE user_id = ?
  `;

  db.query(sql, [user_id], (err, rows) => {
    if (err) {
      console.error("DB error (POST /update-streak select):", err);
      return res.status(500).json({ error: "DB error" });
    }

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const { current_streak_days, last_login_date } = rows[0];
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // If already logged in today → nothing to change
    if (last_login_date === today) {
      return res.json({
        success: true,
        message: "Already updated today",
        current_streak_days,
      });
    }

    let newStreak;
    if (last_login_date === yesterday) {
      newStreak = current_streak_days + 1; // continue streak
    } else {
      newStreak = 1; // reset streak
    }

    const updateSql = `
      UPDATE user_progress
      SET current_streak_days = ?, last_login_date = ?
      WHERE user_id = ?
    `;

    db.query(updateSql, [newStreak, today, user_id], (err2) => {
      if (err2) {
        console.error("DB error (POST /update-streak update):", err2);
        return res.status(500).json({ error: "DB update error" });
      }

      return res.json({
        success: true,
        current_streak_days: newStreak,
        last_login_date: today,
      });
    });
  });
});

/**
 * POST /api/users/update-membership
 * Recalculate membership level based on XP
 */
router.post("/update-membership", (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  // Step 1: get user's XP
  const xpSql = `
    SELECT xp FROM user_progress WHERE user_id = ?
  `;

  db.query(xpSql, [user_id], (err, xpRows) => {
    if (err) {
      console.error("DB error (update-membership xp):", err);
      return res.status(500).json({ error: "DB error (xp)" });
    }

    if (!xpRows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const userXp = xpRows[0].xp;

    // Step 2: get membership level user qualifies for
    const membershipSql = `
      SELECT membership_id
      FROM membership
      WHERE min_xp <= ?
      ORDER BY min_xp DESC
      LIMIT 1
    `;

    db.query(membershipSql, [userXp], (err2, mRows) => {
      if (err2) {
        console.error("DB error (update-membership membership):", err2);
        return res.status(500).json({ error: "DB error (membership)" });
      }

      if (!mRows.length) {
        return res.status(500).json({ error: "No membership level found" });
      }

      const newMembershipId = mRows[0].membership_id;

      // Step 3: update user_progress
      const updateSql = `
        UPDATE user_progress
        SET membership_id = ?
        WHERE user_id = ?
      `;

      db.query(updateSql, [newMembershipId, user_id], (err3) => {
        if (err3) {
          console.error("DB error (update-membership update):", err3);
          return res.status(500).json({ error: "DB update error" });
        }

        return res.json({
          success: true,
          new_membership_id: newMembershipId,
          xp: userXp,
        });
      });
    });
  });
});

/**
 * PUT /api/users/:userId
 * Update username + email (used by your Profile page)
 */
router.put("/:userId", (req, res) => {
  const userId = req.params.userId;
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: "Missing username or email" });
  }

  const sql = "UPDATE users SET username = ?, email = ? WHERE user_id = ?";

  db.query(sql, [username, email, userId], (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ message: "Failed to update profile" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      success: true,
      user_id: Number(userId),
      username,
      email,
    });
  });
});

module.exports = router;
