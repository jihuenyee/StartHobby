const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

/**
 * GET quiz questions by game type
 * /api/quizzes/claw
 * /api/quizzes/snake
 * /api/quizzes/castle
 */
router.get("/:gameType", async (req, res) => {
  const { gameType } = req.params;

  try {
    const db = await getDB(); // ✅ IMPORTANT FIX

    const [rows] = await db.query(
      "SELECT question, option_a, option_b, option_c, option_d FROM quiz_questions WHERE game_type = ?",
      [gameType]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const formatted = rows.map((q) => ({
      text: q.question,
      options: [
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d
      ],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("🔥 QUIZ ROUTE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
