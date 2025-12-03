// server/routes/quizRoutes.js
const express = require("express");
const db = require("../db");
const router = express.Router();

// ========== GEMINI CONFIG (HTTP, NO SDK) ==========
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Optional: override in .env if you know the exact ID from AI Studio
// e.g. GEMINI_MODEL=gemini-2.5-pro
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

if (!GEMINI_API_KEY) {
  console.error("[Gemini] Missing GEMINI_API_KEY / GOOGLE_API_KEY env var!");
}

// Node 18+ has global fetch. If you're on Node 16, install node-fetch and uncomment:
// const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ========== DB HELPER ==========
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/* ==================================================
   DYNAMIC ANSWER-SAVE HELPERS (quiz_user_answers)
   ================================================== */

/**
 * Find the largest question number that already exists
 * based on QnX columns in quiz_user_answers.
 * e.g. if you have Qn1, Qn2, Qn3 => returns 3
 */
async function getExistingQuestionColumnCount() {
  const sql = `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'quiz_user_answers'
      AND COLUMN_NAME LIKE 'Qn%'
  `;
  const rows = await query(sql);

  let maxQn = 0;
  rows.forEach((r) => {
    const name = r.COLUMN_NAME;
    const match = name.match(/^Qn(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) maxQn = Math.max(maxQn, num);
    }
  });

  return maxQn;
}

/**
 * Ensure the table has QnX / Ans_QnX columns
 * for up to requiredCount questions.
 */
async function ensureQuestionColumns(requiredCount) {
  const currentMax = await getExistingQuestionColumnCount();

  if (requiredCount <= currentMax) return;

  console.log(
    `[quiz_user_answers] Adding columns for questions ${currentMax + 1} to ${requiredCount}`
  );

  for (let i = currentMax + 1; i <= requiredCount; i++) {
    const sql = `
      ALTER TABLE quiz_user_answers
      ADD COLUMN Qn${i} TEXT NULL,
      ADD COLUMN Ans_Qn${i} TEXT NULL
    `;
    console.log(`[quiz_user_answers] ALTER TABLE add Qn${i}, Ans_Qn${i}`);
    await query(sql);
  }
}

/**
 * Save one row into quiz_user_answers, with
 * Qn1/Ans_Qn1, Qn2/Ans_Qn2, ... based on qaPairs length.
 */
async function saveAnswersRow(quizId, userId, qaPairs) {
  if (!userId) return; // only save if we know the user
  if (!Array.isArray(qaPairs) || qaPairs.length === 0) return;

  const requiredQuestions = qaPairs.length;

  // 1) Make sure the table schema has enough columns
  await ensureQuestionColumns(requiredQuestions);

  // 2) Build INSERT dynamically
  const cols = ["user_id", "quiz_id"];
  const placeholders = ["?", "?"];
  const values = [userId, quizId];

  qaPairs.forEach((pair, index) => {
    const qNum = index + 1;
    const qCol = `Qn${qNum}`;
    const aCol = `Ans_Qn${qNum}`;

    cols.push(qCol, aCol);
    placeholders.push("?", "?");

    values.push(pair.question, pair.answer);
  });

  const sql = `
    INSERT INTO quiz_user_answers (${cols.join(", ")})
    VALUES (${placeholders.join(", ")})
  `;

  await query(sql, values);
}

/* ==================================================
   ADMIN: LIST ALL QUIZZES
   GET /api/quizzes
   ================================================== */
router.get("/", async (req, res) => {
  const sql = `
    SELECT quiz_id, title, description
    FROM quiz
    ORDER BY quiz_id
  `;

  try {
    const rows = await query(sql);
    res.json(rows);
  } catch (err) {
    console.error("List quizzes error:", err);
    res.status(500).json({ error: "DB error listing quizzes" });
  }
});

/* ==================================================
   GET QUIZ + QUESTIONS + OPTIONS
   GET /api/quizzes/:quizId
   ================================================== */
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
      questions: [],
    };

    const questionMap = {};

    rows.forEach((r) => {
      if (!questionMap[r.question_id]) {
        questionMap[r.question_id] = {
          question_id: r.question_id,
          question_text: r.question_text,
          options: [],
        };
        quiz.questions.push(questionMap[r.question_id]);
      }
      questionMap[r.question_id].options.push({
        option_id: r.option_id,
        option_text: r.option_text,
      });
    });

    res.json(quiz);
  } catch (err) {
    console.error("Get quiz error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ==================================================
   ADMIN: UPDATE QUESTION TEXT
   PUT /api/quizzes/questions/:questionId
   body: { question_text }
   ================================================== */
router.put("/questions/:questionId", async (req, res) => {
  const { questionId } = req.params;
  const { question_text } = req.body;

  if (!question_text) {
    return res.status(400).json({ error: "question_text is required" });
  }

  const sql = `
    UPDATE quizquestions
    SET question_text = ?
    WHERE question_id = ?
  `;

  try {
    const result = await query(sql, [question_text, questionId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json({ success: true, question_id: Number(questionId), question_text });
  } catch (err) {
    console.error("Update question error:", err);
    res.status(500).json({ error: "DB error updating question" });
  }
});

/* ==================================================
   ADMIN: UPDATE OPTION TEXT
   PUT /api/quizzes/options/:optionId
   body: { option_text }
   ================================================== */
router.put("/options/:optionId", async (req, res) => {
  const { optionId } = req.params;
  const { option_text } = req.body;

  if (!option_text) {
    return res.status(400).json({ error: "option_text is required" });
  }

  const sql = `
    UPDATE questionoption
    SET option_text = ?
    WHERE option_id = ?
  `;

  try {
    const result = await query(sql, [option_text, optionId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Option not found" });
    }
    res.json({ success: true, option_id: Number(optionId), option_text });
  } catch (err) {
    console.error("Update option error:", err);
    res.status(500).json({ error: "DB error updating option" });
  }
});

/* ==================================================
   ADMIN: DELETE QUESTION (+ options)
   DELETE /api/quizzes/questions/:questionId
   ================================================== */
router.delete("/questions/:questionId", async (req, res) => {
  const { questionId } = req.params;

  const deleteOptionsSql = `DELETE FROM questionoption WHERE question_id = ?`;
  const deleteQuestionSql = `DELETE FROM quizquestions WHERE question_id = ?`;

  try {
    await query(deleteOptionsSql, [questionId]);
    const result = await query(deleteQuestionSql, [questionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({ success: true, deleted_question_id: Number(questionId) });
  } catch (err) {
    console.error("Delete question error:", err);
    res.status(500).json({ error: "DB error deleting question" });
  }
});

/* ==================================================
   ADMIN: ADD NEW QUESTION + OPTIONS
   POST /api/quizzes/:quizId/questions
   body: { question_text, options: [ "opt1", "opt2", ... ] }
   ================================================== */
router.post("/:quizId/questions", async (req, res) => {
  const { quizId } = req.params;
  const { question_text, options } = req.body;

  if (!question_text) {
    return res.status(400).json({ error: "question_text is required" });
  }
  if (!Array.isArray(options) || options.length < 2) {
    return res
      .status(400)
      .json({ error: "At least 2 options are required" });
  }

  try {
    const insertQuestionSql = `
      INSERT INTO quizquestions (quiz_id, question_text)
      VALUES (?, ?)
    `;
    const qResult = await query(insertQuestionSql, [quizId, question_text]);
    const newQuestionId = qResult.insertId;

    const insertedOptions = [];
    const insertOptionSql = `
      INSERT INTO questionoption (question_id, option_text)
      VALUES (?, ?)
    `;

    for (const optText of options) {
      const oResult = await query(insertOptionSql, [newQuestionId, optText]);
      insertedOptions.push({
        option_id: oResult.insertId,
        option_text: optText,
      });
    }

    res.json({
      question_id: newQuestionId,
      question_text,
      options: insertedOptions,
    });
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ error: "DB error adding question" });
  }
});

/* ==================================================
   HELPER: CALL GEMINI (HTTP v1) WITH FALLBACK MODELS
   ================================================== */
async function callGeminiForQuiz(qaPairs) {
  const modelCandidates = [
    GEMINI_MODEL,
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
  ].filter((m, i, arr) => m && arr.indexOf(m) === i); // dedupe / remove falsy

  const prompt = `
You are a helpful personality and hobby-matching assistant.

Based on the following question/answer pairs, infer:
- a short personality type name,
- a 2–3 sentence summary,
- 3–6 key strengths,
- and several hobby suggestions with reasons.

Question and answer pairs:

${JSON.stringify(qaPairs, null, 2)}

Return ONLY valid JSON (no markdown, no extra comments) exactly in this format:

{
  "personality_type": "A short personality type name",
  "personality_summary": "A 2-3 sentence summary of the personality.",
  "strengths": ["strength1", "strength2", "strength3"],
  "suggested_hobbies": [
    { "hobby": "hobby name", "reason": "why this hobby fits them" }
  ]
}
`;

  let lastError;

  for (const model of modelCandidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const body = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      };

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (!resp.ok) {
        const msg = data.error?.message || JSON.stringify(data);
        console.error(`Gemini HTTP error for model ${model}:`, resp.status, msg);

        if (resp.status === 404) {
          lastError = new Error(`Model ${model} not available: ${msg}`);
          continue;
        }

        throw new Error(`Gemini error ${resp.status}: ${msg}`);
      }

      const rawText =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || "")
          .join("")
          .trim() || "";

      if (!rawText) {
        console.error("Gemini empty response for model", model, data);
        throw new Error("Empty response from Gemini");
      }

      let cleaned = rawText;
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/```json|```/g, "").trim();
      }

      let aiJson;
      try {
        aiJson = JSON.parse(cleaned);
      } catch (err) {
        console.error(
          "JSON parse error from Gemini for model",
          model,
          "raw:",
          cleaned
        );
        throw new Error("Failed to parse Gemini JSON output");
      }

      aiJson.personality_type =
        aiJson.personality_type || "Unique Explorer";
      aiJson.personality_summary =
        aiJson.personality_summary ||
        "You have a unique mix of curiosity, creativity, and practicality.";
      aiJson.strengths = Array.isArray(aiJson.strengths)
        ? aiJson.strengths
        : ["Curiosity", "Creativity", "Adaptability"];
      aiJson.suggested_hobbies = Array.isArray(aiJson.suggested_hobbies)
        ? aiJson.suggested_hobbies
        : [
            {
              hobby: "Reading",
              reason: "It matches your curiosity and desire to learn.",
            },
          ];

      aiJson.generated_at = new Date().toISOString();

      console.log("[Gemini] Using model:", model);
      return aiJson;
    } catch (err) {
      console.error(`Gemini call failed for model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

/* ==================================================
   AI EVALUATION ROUTE
   POST /api/quizzes/:quizId/evaluate
   ================================================== */
router.post("/:quizId/evaluate", async (req, res) => {
  const quizId = req.params.quizId;
  const { user_id, answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Invalid answers" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
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

      const rows = await query(sql, [
        quizId,
        ans.question_id,
        ans.selected_option_id,
      ]);

      if (rows.length > 0) {
        qaPairs.push({
          question: rows[0].question_text,
          answer: rows[0].option_text,
        });
      }
    }

    if (qaPairs.length === 0) {
      return res.status(400).json({ error: "No valid answers found" });
    }

    // 💾 Save raw question + answer mapping into quiz_user_answers
    await saveAnswersRow(quizId, user_id, qaPairs);

    const aiJson = await callGeminiForQuiz(qaPairs);

    res.json({
      success: true,
      ai_result: aiJson,
      source: "gemini",
    });
  } catch (err) {
    console.error("AI ERROR (evaluate):", err);
    res.status(500).json({
      error: "AI failed",
      details: err.message || String(err),
    });
  }
});

/* ==================================================
   SAVE AI RESULT TO DB
   POST /api/quizzes/save-result
   ================================================== */
router.post("/save-result", async (req, res) => {
  const {
    user_id,
    personality_type,
    personality_summary,
    strengths,
    suggested_hobbies,
    reasons,
  } = req.body;

  const sql = `
    INSERT INTO user_ai_results (
      user_id, personality_type, personality_summary, strengths,
      suggested_hobbies, reasons, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  try {
    await query(sql, [
      user_id,
      personality_type,
      personality_summary,
      JSON.stringify(strengths || []),
      JSON.stringify(suggested_hobbies || []),
      JSON.stringify(reasons || []),
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Save AI result error:", err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

module.exports = router;
