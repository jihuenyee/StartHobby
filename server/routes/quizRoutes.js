const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

/**
 * GET all gameTypes (Admin sidebar)
 * /api/quizzes/games
 */
router.get("/games", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT DISTINCT gameType FROM quiz_questions"
    );
    res.json(rows.map(r => r.gameType));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET quizzes by gameType
 * /api/quizzes/game/:gameType
 */
router.get("/game/:gameType", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      `
      SELECT
        id,
        gameType,
        option_a,
        option_b,
        option_c,
        option_d,
        created_at
      FROM quiz_questions
      WHERE gameType = ?
      `,
      [req.params.gameType]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
