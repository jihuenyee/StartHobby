// server/routes/quizRoutes.js
const express = require("express");
const db = require("../db");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  try {
    const rows = await query(sql, [quizId]);
    if (!rows.length) return res.status(404).json({ error: "Quiz not found" });

    const quiz = {
      quiz_id: rows[0].quiz_id,
      title: rows[0].quiz_title,
      description: rows[0].quiz_description,
      questions: []
    };

    const questionMap = {};

    rows.forEach(r => {
      if (!questionMap[r.question_id]) {
        questionMap[r.question_id] = {
          question_id: r.question_id,
          question_text: r.question_text,
          options: []
        };
        quiz.questions.push(questionMap[r.question_id]);
      }
      questionMap[r.question_id].options.push({
        option_id: r.option_id,
        option_text: r.option_text
      });
    });

    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =============================
   AI Evaluation Route
   ============================= */
router.post("/:quizId/evaluate", async (req, res) => {
  const quizId = req.params.quizId;
  const { user_id, answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid answers" });
  }

  try {
    // Get all the question-answer pairs
    const qaPairs = [];
    
    for (const ans of answers) {
      const sql = `
        SELECT qq.question_text, qo.option_text
        FROM quizquestions qq
        JOIN questionoption qo ON qq.question_id = qo.question_id
        WHERE qq.quiz_id = ?
        AND qq.question_id = ?
        AND qo.option_id = ?
      `;
      
      const rows = await query(sql, [quizId, ans.question_id, ans.selected_option_id]);
      
      if (rows.length > 0) {
        qaPairs.push({
          question: rows[0].question_text,
          answer: rows[0].option_text
        });
      }
    }

    if (qaPairs.length === 0) {
      return res.status(400).json({ error: "No valid answers found" });
    }

    const prompt = `
Analyze this quiz result and provide hobby recommendations:

${JSON.stringify(qaPairs, null, 2)}

Return ONLY valid JSON (no markdown, no extra text):

{
  "personality_type": "A personality type name",
  "personality_summary": "A 2-3 sentence summary of the personality",
  "strengths": ["strength1", "strength2", "strength3"],
  "suggested_hobbies": [
    {"hobby": "hobby name", "reason": "why this hobby fits them"}
  ],
  "generated_at": "$(new Date().toISOString())"
}
`;

    const response = await geminiModel.generateContent(prompt);
    let text = response.response.text().trim();
    
    // Remove markdown code blocks if present
    if (text.startsWith("```")) {
      text = text.replace(/```json|```/g, "").trim();
    }

    const aiJson = JSON.parse(text);

    res.json({
      success: true,
      ai_result: aiJson,
      source: "gemini"
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "AI failed", details: err.message });
  }
});

/* =============================
   Save AI Result to DB
   ============================= */
router.post("/save-result", async (req, res) => {
  const { user_id, personality_type, personality_summary, strengths, suggested_hobbies, reasons } = req.body;

  const sql = `
    INSERT INTO user_ai_results (
      user_id, personality_type, personality_summary, strengths, suggested_hobbies, reasons, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  try {
    await query(sql, [
      user_id,
      personality_type,
      personality_summary,
      JSON.stringify(strengths),
      JSON.stringify(suggested_hobbies),
      JSON.stringify(reasons),
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "DB insert failed" });
  }
});

module.exports = router;
