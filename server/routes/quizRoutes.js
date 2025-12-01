// server/routes/quizRoutes.js
const express = require("express");
const db = require("../db");
const router = express.Router();

/* ------------------------------ helpers ------------------------------ */

/** Wrap db.query in a Promise so we can use async/await */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/* =============================
   GET /api/quizzes
   List all quizzes
   ============================= */
router.get("/", async (req, res) => {
  try {
    const rows = await query(
      "SELECT quiz_id, title, description FROM quiz"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET QUIZZES ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =============================
   GET /api/quizzes/:quizId
   Get quiz with questions + options
   ============================= */
router.get("/:quizId", async (req, res) => {
  const quizId = req.params.quizId;

  const sql = `
    SELECT 
      q.quiz_id, 
      q.title AS quiz_title, 
      q.description AS quiz_description,
      qq.question_id, 
      qq.question_text,
      qo.option_id, 
      qo.option_text
    FROM quiz q
    JOIN quizquestions qq ON q.quiz_id = qq.quiz_id
    JOIN questionoption qo ON qq.question_id = qo.question_id
    WHERE q.quiz_id = ?
    ORDER BY qq.question_id, qo.option_id
  `;

  try {
    const rows = await query(sql, [quizId]);

    if (!rows.length) {
      return res.status(404).json({ error: "Quiz not found" });
    }

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
    console.error("GET QUIZ DETAILS ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =============================
   POST /api/quizzes/:quizId/answer
   Save a SINGLE user quiz answer
   ============================= */
router.post("/:quizId/answer", async (req, res) => {
  const { user_id, question_id, selected_option_id, UserQuizAnswercol } =
    req.body;

  if (!user_id || !question_id || !selected_option_id) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sql = `
    INSERT INTO UserQuizAnswer 
      (user_id, question_id, selected_option_id, UserQuizAnswercol)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const result = await query(sql, [
      user_id,
      question_id,
      selected_option_id,
      UserQuizAnswercol || null,
    ]);

    res.json({
      success: true,
      answer_id: result.insertId,
    });
  } catch (err) {
    console.error("INSERT ANSWER ERROR:", err);
    res.status(500).json({ error: "DB insert error" });
  }
});

/* =============================
   POST /api/quizzes/:quizId/submit
   Save ALL answers + update XP / streak / membership
   (your original gamification logic, cleaned slightly)
   ============================= */
router.post("/:quizId/submit", async (req, res) => {
  const quizId = req.params.quizId;
  const { user_id, answers } = req.body;

  // answers = [{ question_id, selected_option_id }, ...]
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }
  if (!answers || !Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ error: "No answers provided" });
  }

  try {
    // 1. Insert all answers
    const insertSql = `
      INSERT INTO UserQuizAnswer (user_id, question_id, selected_option_id)
      VALUES ?
    `;
    const values = answers.map((a) => [
      user_id,
      a.question_id,
      a.selected_option_id,
    ]);
    await query(insertSql, [values]);

    // 2. Add XP + points
    const xp_gain = 10;
    const points_gain = 5;

    const progressSql = `
      UPDATE user_progress
      SET xp = xp + ?, points = points + ?
      WHERE user_id = ?
    `;
    await query(progressSql, [xp_gain, points_gain, user_id]);

    // 3. Update streak
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    const streakCheckSql = `
      SELECT current_streak_days, last_login_date
      FROM user_progress
      WHERE user_id = ?
    `;
    const streakRows = await query(streakCheckSql, [user_id]);
    const row = streakRows[0];

    let newStreak = row?.current_streak_days || 0;
    if (row?.last_login_date === yesterday) newStreak++;
    else newStreak = 1;

    const updateStreakSql = `
      UPDATE user_progress
      SET current_streak_days = ?, last_login_date = ?
      WHERE user_id = ?
    `;
    await query(updateStreakSql, [newStreak, today, user_id]);

    // 4. Update membership based on XP
    const xpSql = `SELECT xp FROM user_progress WHERE user_id = ?`;
    const xpRows = await query(xpSql, [user_id]);
    const userXp = xpRows[0]?.xp || 0;

    const membershipSql = `
      SELECT membership_id
      FROM membership
      WHERE min_xp <= ?
      ORDER BY min_xp DESC
      LIMIT 1
    `;
    const mRows = await query(membershipSql, [userXp]);
    const newMembershipId = mRows[0]?.membership_id || null;

    if (newMembershipId != null) {
      const updateMembershipSql = `
        UPDATE user_progress
        SET membership_id = ?
        WHERE user_id = ?
      `;
      await query(updateMembershipSql, [newMembershipId, user_id]);
    }

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      xp_added: xp_gain,
      points_added: points_gain,
      new_membership_id: newMembershipId,
      new_streak: newStreak,
    });
  } catch (err) {
    console.error("QUIZ SUBMIT ERROR:", err);
    res.status(500).json({ error: "Quiz submit failed", details: err.message });
  }
});

/* =============================
   POST /api/quizzes/:quizId/evaluate
   Rule-based "AI" evaluation of answers.
   - optionally saves answers if user_id present
   - returns personality + hobby suggestions
   ============================= */
router.post("/:quizId/evaluate", async (req, res) => {
  const quizId = req.params.quizId;
  const { user_id, answers } = req.body;

  // answers = [{ question_id, selected_option_id }, ...]
  if (!answers || !Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ error: "No answers provided" });
  }

  try {
    /* ---------- (optional) save answers ---------- */
    if (user_id) {
      const insertSql = `
        INSERT INTO UserQuizAnswer (user_id, question_id, selected_option_id)
        VALUES ?
      `;
      const values = answers.map((a) => [
        user_id,
        a.question_id,
        a.selected_option_id,
      ]);
      await query(insertSql, [values]);
    }

    /* ---------- load question + chosen option text ---------- */
    const questionIds = answers.map((a) => a.question_id);
    const optionIds = answers.map((a) => a.selected_option_id);

    const qPlaceholders = questionIds.map(() => "?").join(",");
    const oPlaceholders = optionIds.map(() => "?").join(",");

    const qaSql = `
      SELECT 
        qq.question_id,
        qq.question_text,
        qo.option_id,
        qo.option_text
      FROM quizquestions qq
      JOIN questionoption qo ON qq.question_id = qo.question_id
      WHERE qq.quiz_id = ?
        AND qq.question_id IN (${qPlaceholders})
        AND qo.option_id IN (${oPlaceholders})
      ORDER BY qq.question_id, qo.option_id
    `;
    const params = [quizId, ...questionIds, ...optionIds];
    const rows = await query(qaSql, params);

    if (!rows.length) {
      return res.status(400).json({
        error: "No matching questions/options found for these answers",
      });
    }

    /* ---------- simple personality scoring ---------- */
    const traitScores = { Adventurer: 0, Thinker: 0, Creator: 0 };
    const byQuestion = {};
    rows.forEach((r) => {
      if (!byQuestion[r.question_id]) byQuestion[r.question_id] = [];
      byQuestion[r.question_id].push(r);
    });

    const qaPairs = [];

    answers.forEach((ans) => {
      const list = byQuestion[ans.question_id] || [];
      const ordered = list.sort((a, b) => a.option_id - b.option_id);
      const idx = ordered.findIndex(
        (o) => o.option_id === ans.selected_option_id
      );

      let trait = null;
      if (idx === 0) trait = "Adventurer";
      else if (idx === 1) trait = "Thinker";
      else if (idx === 2) trait = "Creator";

      if (trait) traitScores[trait] += 1;

      const row = list.find((o) => o.option_id === ans.selected_option_id);
      if (row) {
        qaPairs.push({
          question: row.question_text,
          answer: row.option_text,
        });
      }
    });

    // pick dominant trait
    let bestTrait = "Adventurer";
    let bestScore = -1;
    for (const key of Object.keys(traitScores)) {
      if (traitScores[key] > bestScore) {
        bestScore = traitScores[key];
        bestTrait = key;
      }
    }

    const result = buildPersonalityResult(bestTrait, traitScores, qaPairs);

    res.json({
      success: true,
      ai_result: result,
    });
  } catch (err) {
    console.error("AI EVALUATE ERROR:", err);
    res.status(500).json({
      error: "Failed to evaluate quiz",
      details: err.message || String(err),
    });
  }
});

/* ---------------- personality helper ---------------- */

function buildPersonalityResult(bestTrait, scores, qaPairs) {
  const baseTexts = {
    Adventurer: {
      personality:
        "You’re energetic, curious, and drawn to real-world experiences. You enjoy movement, exploration, and trying new things.",
      hobbies: [
        {
          hobby: "Hiking & Nature Trails",
          reason: "You like being outdoors and discovering new places.",
        },
        {
          hobby: "Rock Climbing / Bouldering",
          reason:
            "You enjoy challenge, movement, and pushing your limits in a safe way.",
        },
        {
          hobby: "Team Sports (e.g. futsal, volleyball)",
          reason:
            "You thrive on energy, action, and social interaction with others.",
        },
      ],
    },
    Thinker: {
      personality:
        "You’re reflective, analytical, and enjoy understanding how things work. You like structure, depth, and strategy.",
      hobbies: [
        {
          hobby: "Strategy Board Games / Chess",
          reason:
            "You enjoy planning ahead and analysing different possibilities.",
        },
        {
          hobby: "Coding / Programming Projects",
          reason: "You like solving problems and building logical systems.",
        },
        {
          hobby: "Reading & Research Clubs",
          reason:
            "You’re motivated by learning, ideas, and deep discussions with others.",
        },
      ],
    },
    Creator: {
      personality:
        "You’re imaginative, expressive, and see patterns, stories, and aesthetics everywhere. You like bringing ideas to life.",
      hobbies: [
        {
          hobby: "Digital Art / Illustration",
          reason: "You enjoy visual expression and experimenting with styles.",
        },
        {
          hobby: "Music Production / Learning an Instrument",
          reason:
            "You’re drawn to mood, rhythm, and emotional storytelling through sound.",
        },
        {
          hobby: "Content Creation (video, blog, photography)",
          reason:
            "You like sharing perspectives and crafting narratives others can enjoy.",
        },
      ],
    },
  };

  const chosen = baseTexts[bestTrait] || baseTexts.Adventurer;

  return {
    personality_type: bestTrait,
    personality_summary: `${chosen.personality} (Scores – Adventurer: ${scores.Adventurer}, Thinker: ${scores.Thinker}, Creator: ${scores.Creator})`,
    recommended_hobbies: chosen.hobbies,
    raw_answers: qaPairs,
  };
}

module.exports = router;
