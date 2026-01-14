const express = require("express");
const { getDB } = require("../db");
const router = express.Router();

// 1. GET ALL QUIZZES
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT quiz_id, title, description FROM quiz");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET QUIZ BY ID (WITH QUESTIONS AND OPTIONS)
router.get("/:quizId", async (req, res) => {
  try {
    const db = await getDB();
    const quizId = String(req.params.quizId).replace(':', '');

    const [quiz] = await db.query("SELECT * FROM quiz WHERE quiz_id = ?", [quizId]);
    if (quiz.length === 0) return res.status(404).json({ error: "Quiz not found" });

    const [questions] = await db.query(
      "SELECT * FROM quizquestions WHERE quiz_id = ?", 
      [quizId]
    );

    // Fetch options for each question
    const fullQuestions = await Promise.all(questions.map(async (q) => {
      const [options] = await db.query(
        "SELECT * FROM questionoption WHERE question_id = ?", 
        [q.question_id]
      );
      return { ...q, options };
    }));

    res.json({ ...quiz[0], questions: fullQuestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST NEW QUESTION (ADDS OPTIONS AUTOMATICALLY)
router.post("/:quizId/questions", async (req, res) => {
  try {
    const db = await getDB();
    const quizId = String(req.params.quizId).replace(':', '');
    const { question_text } = req.body;

    // A. Insert Question
    const [qResult] = await db.query(
      "INSERT INTO quizquestions (quiz_id, question_text) VALUES (?, ?)",
      [quizId, question_text || "New Question"]
    );
    const newId = qResult.insertId;

    // B. Insert 4 Default Options 
    // Note: I'm adding '0' for is_correct just in case your table requires it
    const defaultTexts = ["Option A", "Option B", "Option C", "Option D"];
    
    // We use a loop to ensure they are all inserted before moving on
    for (const text of defaultTexts) {
      await db.query(
        "INSERT INTO questionoption (question_id, option_text) VALUES (?, ?)",
        [newId, text]
      );
    }

    // C. Fetch what we just created to be 100% sure it exists
    const [newOptions] = await db.query(
      "SELECT * FROM questionoption WHERE question_id = ?",
      [newId]
    );

    res.json({
      success: true,
      question_id: newId,
      question_text: question_text || "New Question",
      options: newOptions
    });
  } catch (err) {
    console.error("BACKEND POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. PUT UPDATE QUESTION
router.put("/questions/:questionId", async (req, res) => {
  try {
    const db = await getDB();
    const { question_text } = req.body;
    await db.query("UPDATE quizquestions SET question_text = ? WHERE question_id = ?", [question_text, req.params.questionId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PUT UPDATE OPTION
router.put("/options/:optionId", async (req, res) => {
  try {
    const db = await getDB();
    const { option_text } = req.body;
    await db.query("UPDATE questionoption SET option_text = ? WHERE option_id = ?", [option_text, req.params.optionId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE QUESTION
router.delete("/questions/:questionId", async (req, res) => {
  try {
    const db = await getDB();
    const id = req.params.questionId;
    await db.query("DELETE FROM questionoption WHERE question_id = ?", [id]);
    await db.query("DELETE FROM quizquestions WHERE question_id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;