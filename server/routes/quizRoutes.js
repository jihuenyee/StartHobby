const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

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

router.delete("/question/:id", async (req, res) => {
  try {
    const db = await getDB();

    await db.query(
      "DELETE FROM quiz_questions WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quizzes/claw/analyze - Analyze claw quiz answers with AI
router.post("/claw/analyze", async (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Answers array is required" });
  }

  try {
    const prompt = `
You are a personality analysis expert. Based on the following quiz answers, provide a detailed personality analysis.

Return ONLY valid JSON. No markdown. No explanation.

JSON format:
{
  "personalitySummary": "A 2-3 sentence summary of the person's personality",
  "personalityType": "A short catchy title like 'Creative Soul', 'Adventure Seeker', etc.",
  "encouragingMessage": "An enthusiastic, motivating 1-2 sentence message encouraging them to continue their journey to the next game/adventure. Make it fun and energetic!",
  "traits": [
    { "trait": "trait name", "score": number between 1-10, "description": "short description" }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "recommendedHobbies": [
    { 
      "name": "hobby name", 
      "reason": "why this hobby fits them",
      "difficulty": "beginner/intermediate/advanced"
    }
  ]
}

Quiz responses:
${JSON.stringify(answers, null, 2)}
`;

    // Call OpenAI API
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a personality analysis expert. Return only valid JSON, no markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!aiRes.ok) {
      const errorData = await aiRes.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiData = await aiRes.json();
    console.log("RAW OPENAI RESPONSE:", JSON.stringify(aiData, null, 2));

    // Extract text from response
    let text = aiData.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty AI response");
    }

    // Clean markdown wrappers
    text = text.replace(/```json|```/g, "").trim();

    const analysis = JSON.parse(text);

    res.json({
      success: true,
      analysis,
    });

  } catch (err) {
    console.error("AI Analysis error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
