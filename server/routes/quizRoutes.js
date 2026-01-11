const express = require("express");
const getDB = require("../db");
const router = express.Router();
<<<<<<< HEAD
const { GoogleGenerativeAI } = require("@google-generative-ai/client");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: "v1",
});

const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/* =============================
   GET quiz + questions + options
   ============================= */
router.get("/:quizId", async (req, res) => {
  const quizId = req.params.quizId;

  const sql = `
    SELECT 
      q.quiz_id, q.title AS quiz_title, q.description AS quiz_description,
      qq.question_id, qq.question_text,
      qo.option_id, qo.option_text
    FROM quiz q
    JOIN quizquestions qq ON q.quiz_id = qq.quiz_id
    JOIN questionoption qo ON qq.question_id = qo.question_id
    WHERE q.quiz_id = ?
    ORDER BY qq.question_id, qo.option_id
  `;
=======
>>>>>>> e3eea3da4612d8ee5315b034f426690521ee1ab3

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
