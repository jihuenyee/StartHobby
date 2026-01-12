const express = require("express");
const getDB = require("../db");
const router = express.Router();

/**
 * GET all quiz
 */
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(`
      SELECT quiz_id, title, description, created_at
      FROM quiz
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * GET quiz by ID
 */
router.get("/:quizId", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT * FROM quiz WHERE quiz_id = ?",
      [req.params.quizId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * GET quiz questions
 */
router.get("/:quizId/questions", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order ASC",
      [req.params.quizId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * POST quiz results
 */
router.post("/:quizId/results", async (req, res) => {
  const { user_id, score } = req.body;

  if (!user_id || score === undefined) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const db = await getDB();
    const [result] = await db.query(
      `
      INSERT INTO quiz_results (quiz_id, user_id, score)
      VALUES (?, ?, ?)
      `,
      [req.params.quizId, user_id, score]
    );

    res.json({
      success: true,
      result_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
