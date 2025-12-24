const express = require("express");
const router = express.Router();
const db = require("../db");

// Initialize hobby_entries table on first run
const initTable = () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS hobby_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hobby_name VARCHAR(255) NOT NULL,
      hobby_key VARCHAR(255) NOT NULL UNIQUE,
      count INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  
  db.query(createTableSQL, (err) => {
    if (err) {
      console.error("❌ Error creating hobby_entries table:", err);
    } else {
      console.log("✅ hobby_entries table ready");
    }
  });
};

initTable();

// Normalize hobby text
function normalize(text) {
  return text.trim().toLowerCase();
}

// GET aggregated hobby counts from database
router.get("/hobby-entries", (req, res) => {
  const query = `
    SELECT hobby_name as hobby, hobby_key as \`key\`, count 
    FROM hobby_entries 
    ORDER BY count DESC, updated_at DESC
    LIMIT 50
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results || []);
  });
});

// POST submit a hobby to database
router.post("/hobby-entries", (req, res) => {
  const { hobby } = req.body || {};
  if (!hobby || typeof hobby !== "string")
    return res.status(400).json({ error: "Invalid hobby" });

  const hobbyName = hobby.trim();
  const hobbyKey = normalize(hobby);

  const query = `
    INSERT INTO hobby_entries (hobby_name, hobby_key, count)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE 
      count = count + 1,
      updated_at = CURRENT_TIMESTAMP
  `;

  db.query(query, [hobbyName, hobbyKey], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Get updated count
    const selectQuery = `SELECT hobby_name as hobby, hobby_key as \`key\`, count FROM hobby_entries WHERE hobby_key = ?`;
    db.query(selectQuery, [hobbyKey], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      const entry = rows[0];
      res.json({ hobby: entry.hobby, count: entry.count });
    });
  });
});

module.exports = router;
