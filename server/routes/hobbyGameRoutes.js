const express = require("express");
const getDB = require("../db");
const router = express.Router();

router.get("/hobby-entries", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(`
      SELECT hobby_name AS hobby, hobby_key AS \`key\`, count
      FROM hobby_entries
      ORDER BY count DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/hobby-entries", async (req, res) => {
  const { hobby } = req.body;
  try {
    const db = await getDB();
    await db.query(`
      INSERT INTO hobby_entries (hobby_name, hobby_key, count)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE count = count + 1
    `, [hobby, hobby.toLowerCase()]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
