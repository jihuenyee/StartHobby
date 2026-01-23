const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

// GET game types
router.get("/games", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT DISTINCT game_type FROM quiz_questions"
    );
    res.json(rows.map(r => r.game_type));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET quizzes by game type
router.get("/game/:gameType", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      `
      SELECT
        id,
        game_type,
        option_a,
        option_b,
        option_c,
        option_d,
        created_at
      FROM quiz_questions
      WHERE game_type = ?
      `,
      [req.params.gameType]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;