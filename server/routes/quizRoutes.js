const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

/**
 * GET all quizzes
 * /api/quizzes
 */
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM quiz_questions");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET quiz by ID
 * /api/quizzes/:id
 */
router.get("/:id", async (req, res) => {
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
      WHERE id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
