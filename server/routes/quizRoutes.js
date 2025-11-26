// server/routes/quizRoutes.js
const express = require("express");
const db = require("../db");
const router = express.Router();


// =============================
//  GET /api/quizzes
//  List all quizzes
// =============================
router.get("/", (req, res) => {
  db.query("SELECT quiz_id, title, description FROM quiz", (err, rows) => {
    if (err) {
      console.error("GET QUIZZES ERROR:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});


// =============================
//  GET /api/quizzes/:quizId
//  Get quiz with questions + options
// =============================
router.get("/:quizId", (req, res) => {
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

  db.query(sql, [quizId], (err, rows) => {
    if (err) {
      console.error("GET QUIZ DETAILS ERROR:", err);
      return res.status(500).json({ error: "DB error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Transform rows → nested quiz structure
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
  });
});


// =============================
//  POST /api/quizzes/:quizId/answer
//  Save user quiz answer
// =============================
router.post("/:quizId/answer", (req, res) => {
  const { user_id, question_id, selected_option_id, UserQuizAnswercol } = req.body;

  if (!user_id || !question_id || !selected_option_id) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sql = `
    INSERT INTO UserQuizAnswer (user_id, question_id, selected_option_id, UserQuizAnswercol)
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    user_id,
    question_id,
    selected_option_id,
    UserQuizAnswercol || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("INSERT ERROR:", err);  // 🔥 This shows the REAL SQL error
      return res.status(500).json({ error: "DB insert error", details: err });
    }

    res.json({
      success: true,
      answer_id: result.insertId
    });
  });
});

// POST /api/quizzes/:quizId/answer
router.post("/:quizId/answer", (req, res) => {
  const quizId = req.params.quizId;
  const { user_id, question_id, selected_option_id, UserQuizAnswercol } = req.body;

  const sql = `
    INSERT INTO UserQuizAnswer 
    (user_id, question_id, selected_option_id, UserQuizAnswercol)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, question_id, selected_option_id, UserQuizAnswercol], (err, result) => {
    if (err) {
      console.error("INSERT ERROR:", err);
      return res.status(500).json({ error: "DB insert error" });
    }
    res.json({ success: true, answer_id: result.insertId });
  });
});
// POST /api/quizzes/:quizId/submit
router.post("/:quizId/submit", (req, res) => {
  const quizId = req.params.quizId;
  const { user_id, answers } = req.body;

  // answers = array of:
  // [{ question_id: 1, selected_option_id: 3 }, { question_id: 2, selected_option_id: 5 }]

  if (!answers || answers.length === 0) {
    return res.status(400).json({ error: "No answers provided" });
  }

  // 1. Insert all answers
  const insertSql = `
    INSERT INTO UserQuizAnswer (user_id, question_id, selected_option_id)
    VALUES ?
  `;

  const values = answers.map(a => [
    user_id,
    a.question_id,
    a.selected_option_id
  ]);

  db.query(insertSql, [values], (err) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Insert answer failed" });
    }

    // 2. Add XP + points (example: +10 XP, +5 points per quiz)
    const xp_gain = 10;
    const points_gain = 5;

    const progressSql = `
      UPDATE user_progress
      SET xp = xp + ?, points = points + ?
      WHERE user_id = ?
    `;

    db.query(progressSql, [xp_gain, points_gain, user_id], (err2) => {
      if (err2) return res.status(500).json({ error: "Update progress failed" });

      // 3. Update streak
      const streakSql = `
        CALL update_streak_procedure( ? )
      `;

      // ❗ If you don't have a procedure, we manually call your route logic instead
      const today = new Date().toISOString().split("T")[0];

      const streakCheckSql = `
        SELECT current_streak_days, last_login_date
        FROM user_progress
        WHERE user_id = ?
      `;

      db.query(streakCheckSql, [user_id], (err3, rows) => {
        if (err3) return res.status(500).json({ error: "Streak check failed" });

        const { current_streak_days, last_login_date } = rows[0];
        let newStreak = current_streak_days;

        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];

        if (last_login_date === yesterday) newStreak++;
        else newStreak = 1;

        const updateStreakSql = `
          UPDATE user_progress
          SET current_streak_days = ?, last_login_date = ?
          WHERE user_id = ?
        `;

        db.query(updateStreakSql, [newStreak, today, user_id], (err4) => {
          if (err4) return res.status(500).json({ error: "Update streak failed" });

          // 4. Update membership
          const xpSql = `SELECT xp FROM user_progress WHERE user_id = ?`;

          db.query(xpSql, [user_id], (err5, xpRows) => {
            if (err5) return res.status(500).json({ error: "XP fetch failed" });

            const userXp = xpRows[0].xp;

            const membershipSql = `
              SELECT membership_id
              FROM membership
              WHERE min_xp <= ?
              ORDER BY min_xp DESC
              LIMIT 1
            `;

            db.query(membershipSql, [userXp], (err6, mRows) => {
              if (err6) return res.status(500).json({ error: "Membership check failed" });

              const newMembershipId = mRows[0].membership_id;

              const updateMembershipSql = `
                UPDATE user_progress
                SET membership_id = ?
                WHERE user_id = ?
              `;

              db.query(updateMembershipSql, [newMembershipId, user_id], () => {
                // Final response
                res.json({
                  success: true,
                  message: "Quiz submitted successfully",
                  xp_added: xp_gain,
                  points_added: points_gain,
                  new_membership_id: newMembershipId,
                  new_streak: newStreak
                });
              });
            });
          });
        });
      });
    });
  });
});



module.exports = router;
