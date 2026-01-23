const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

/**
 * =====================================================
 * ADMIN: Get ALL quiz questions
 * GET /api/quizzes
 * =====================================================
 */
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM quiz_questions");
    res.json(rows);
  } catch (err) {
    console.error("🔥 ADMIN QUIZ FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * =====================================================
 * GAME: Get quiz questions by game type
 * GET /api/quizzes/game/:gameType
 * Example:
 *   /api/quizzes/game/claw
 *   /api/quizzes/game/snake
 *   /api/quizzes/game/castle
 * =====================================================
 */
router.get("/game/:gameType", async (req, res) => {
  const { gameType } = req.params;

  try {
    const db = await getDB();

    const [rows] = await db.query(
      `
      SELECT 
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d
      FROM quiz_questions
      WHERE game_type = ?
      `,
      [gameType]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const formatted = rows.map((q) => ({
      id: q.id,
      text: q.question,
      options: [
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
      ],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("🔥 QUIZ ROUTE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
