const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

// --- 🧠 AI LOGIC HELPER FUNCTION ---
const calculatePersonality = (responses) => {
  // Default scores
  const scores = { Creative: 0, Active: 0, Strategic: 0, Social: 0 };

  // Keywords to look for in the user's answers
  const keywords = {
    Creative: ["art", "draw", "paint", "create", "color", "story", "write", "imagination", "express"],
    Active: ["run", "climb", "jump", "sport", "gym", "move", "energy", "outside", "nature"],
    Strategic: ["puzzle", "plan", "logic", "chess", "solve", "think", "map", "strategy", "brain"],
    Social: ["team", "friend", "people", "talk", "share", "lead", "group", "help", "kindness"]
  };

  // scan the answers
  if (Array.isArray(responses)) {
    responses.forEach((item) => {
      const text = (item.answer || "").toLowerCase();
      
      // Check which category this answer belongs to
      for (const [category, words] of Object.entries(keywords)) {
        if (words.some((word) => text.includes(word))) {
          scores[category]++;
        }
      }
    });
  }

  // Find the category with the highest score
  // If there is a tie or no matches, it defaults to the first one found (usually Creative)
  return Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
};

// --- 🚀 THE API ROUTE ---
router.post("/finalize", async (req, res) => {
  // 1. Get the data including the clean 'responses' array
  const { email, clawGame, snakeGame, castleGame, responses } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // 2. Run the AI Logic immediately
    const aiResult = calculatePersonality(responses);

    // 3. Connect to DB
    const db = await getDB();

    // 4. Insert Data (Raw Game Data + AI Result)
    // Note: We added 'ai_personality' to the query
    await db.query(
      `
      INSERT INTO user_game_results
      (email, claw_data, snake_data, castle_data, ai_personality)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        email,
        JSON.stringify(clawGame || {}),   // Safety check in case game is null
        JSON.stringify(snakeGame || {}),
        JSON.stringify(castleGame || {}),
        aiResult
      ]
    );

    console.log(`✅ Saved results for ${email}. Personality: ${aiResult}`);

    // 5. Return the REAL result to the frontend
    res.json({
      success: true,
      personality: aiResult
    });

  } catch (err) {
    console.error("❌ Save failed:", err);
    res.status(500).json({ error: "Failed to save results" });
  }
});

module.exports = router;