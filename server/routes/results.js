const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

// GET /api/results/all - Fetch all game results for admin
router.get("/all", async (req, res) => {
  try {
    const db = await getDB();
    
    // Fetch all results with user information
    const [rows] = await db.query(`
      SELECT 
        ugr.id,
        ugr.email,
        ugr.claw_data,
        ugr.snake_data,
        ugr.castle_data,
        ugr.created_at,
        u.username
      FROM user_game_results ugr
      LEFT JOIN users u ON ugr.email = u.email
      ORDER BY ugr.created_at DESC
    `);
    
    console.log('Fetched results count:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching all results:", err.message);
    res.status(500).json({ 
      error: err.message,
      code: err.code 
    });
  }
});

// GET /api/results/ai-profile/:email - Fetch AI profile for a user
router.get("/ai-profile/:email", async (req, res) => {
  try {
    const db = await getDB();
    const { email } = req.params;
    
    const [rows] = await db.query(`
      SELECT 
        id,
        email,
        personality_summary,
        traits,
        hobbies,
        created_at
      FROM user_ai_profiles
      WHERE email = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [email]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "AI profile not found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching AI profile:", err.message);
    res.status(500).json({ 
      error: err.message,
      code: err.code 
    });
  }
});


router.post("/finalize", async (req, res) => {
  const { email, clawGame, snakeGame, castleGame } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    const db = await getDB();

    // 1️⃣ Save game data
    await db.query(
      `
      INSERT INTO user_game_results
      (email, claw_data, snake_data, castle_data)
      VALUES (?, ?, ?, ?)
      `,
      [
        email,
        JSON.stringify(clawGame),
        JSON.stringify(snakeGame),
        JSON.stringify(castleGame),
      ]
    );

    // 2️⃣ Prepare responses
    const responses = [
      ...(clawGame?.answers || []).map(a => ({
        game: "claw",
        question: a.question,
        answer: a.answer,
      })),
      ...(castleGame?.answers || []).map(a => ({
        game: "castle",
        question: a.question,
        answer: a.answer,
      })),
      ...(snakeGame?.answers || []).map(a => ({
        game: "snake",
        question: a.question,
        answer: a.answer,
      })),
    ];

    const prompt = `
Return ONLY valid JSON. No markdown. No explanation.

JSON format:
{
  "personalitySummary": string,
  "traits": [{ "trait": string, "score": number }],
  "hobbies": [
    { "name": string, "why": string, "category": string, "social": boolean }
  ]
}

Quiz responses:
${JSON.stringify(responses, null, 2)}
`;

    // 3️⃣ Call OpenAI Responses API
    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const aiData = await aiRes.json();
    console.log("RAW OPENAI RESPONSE:", JSON.stringify(aiData, null, 2));

    // 4️⃣ Extract text safely
    let text = null;

    if (aiData.output_text) {
      text = aiData.output_text;
    } else if (
      aiData.output?.[0]?.content?.[0]?.text
    ) {
      text = aiData.output[0].content[0].text;
    }

    if (!text) {
      throw new Error("Empty AI response");
    }

    // 5️⃣ CLEAN ```json WRAPPERS (THIS FIXES YOUR ISSUE)
    text = text.replace(/```json|```/g, "").trim();

    const analysis = JSON.parse(text);

    // ✅ ALWAYS RETURN SUCCESS
    return res.json({
      success: true,
      analysis,
    });

  } catch (err) {
    console.error("Finalize error:", err.message);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
