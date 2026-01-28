const express = require("express");
const router = express.Router();
const { getDB } = require("../db");

router.post("/save", async (req, res) => {
  const { email, profile } = req.body;

  if (!email || !profile) {
    return res.status(400).json({ error: "Missing email or profile" });
  }

  try {
    const db = await getDB();

    await db.query(
      `
      INSERT INTO user_ai_profiles
      (email, personality_summary, traits, hobbies)
      VALUES (?, ?, ?, ?)
      `,
      [
        email,
        profile.personalitySummary,
        JSON.stringify(profile.traits),
        JSON.stringify(profile.hobbies),
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Save AI profile error:", err);
    res.status(500).json({ error: "Failed to save AI profile" });
  }
});

module.exports = router;
