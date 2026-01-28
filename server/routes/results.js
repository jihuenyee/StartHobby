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
    // 2. Connect to DB
    const db = await getDB();

    // 3. Insert Data (Raw Game Data)
    await db.query(
      `
      INSERT INTO user_game_results
      (email, claw_data, snake_data, castle_data)
      VALUES (?, ?, ?, ?)
      `,
      [
        email,
        JSON.stringify(clawGame || {}),   // Safety check in case game is null
        JSON.stringify(snakeGame || {}),
        JSON.stringify(castleGame || {})
      ]
    );

    console.log(`✅ Saved results for ${email}`);

    // 4. Return success to the frontend
    res.json({
      success: true
    });

  } catch (err) {
    console.error("❌ Save failed:", err);
    res.status(500).json({ error: "Failed to save results" });
  }
});

// Get all results (must be BEFORE /:email route)
router.get('/all', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      'SELECT * FROM user_game_results ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch all results' });
  }
});

router.get('/email/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const db = await getDB();
    const [rows] = await db.query(
      'SELECT * FROM user_game_results WHERE email = ?',
      [email]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No results found for email' });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user results by email' });
  }
});

module.exports = router;
