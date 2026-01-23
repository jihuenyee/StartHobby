const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

/**
 * GET all quizzes (list by game_type)
 * /api/quizzes
 */
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT DISTINCT game_type FROM quiz_questions"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET quiz by game_type
 * /api/quizzes/:gameType
 */
router.get("/:gameType", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      `
      SELECT
        id AS question_id,
        question,
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

    if (rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json({
      game_type: req.params.gameType,
      questions: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ADD new question
 * POST /api/quizzes/question
 */
router.post("/question", async (req, res) => {
  try {
    const db = await getDB();
    const {
      game_type,
      question,
      option_a,
      option_b,
      option_c,
      option_d
    } = req.body;

    await db.query(
      `
      INSERT INTO quiz_questions
      (game_type, question, option_a, option_b, option_c, option_d)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [game_type, question, option_a, option_b, option_c, option_d]
    );

    res.json({ message: "Question added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE question
 * PUT /api/quizzes/question/:id
 */
router.put("/question/:id", async (req, res) => {
  try {
    const db = await getDB();
    const {
      question,
      option_a,
      option_b,
      option_c,
      option_d
    } = req.body;

    await db.query(
      `
      UPDATE quiz_questions
      SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?
      WHERE id = ?
      `,
      [question, option_a, option_b, option_c, option_d, req.params.id]
    );

    res.json({ message: "Question updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
