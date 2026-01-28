require("dotenv").config();
const mysql = require("mysql2/promise");

console.log("[DB] Initializing database connection...");
console.log("[DB] Host:", process.env.DB_HOST || "MISSING");
console.log("[DB] Database:", process.env.DB_NAME || "MISSING");
console.log("[DB] User:", process.env.DB_USER ? "✓" : "✗ MISSING");
console.log("[DB] Password:", process.env.DB_PASSWORD ? "✓" : "✗ MISSING");
console.log("[DB] Port:", process.env.DB_PORT || "3306 (default)");

// Check if critical env vars are missing
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error("❌ [DB] CRITICAL: Missing required database environment variables!");
  console.error("❌ [DB] Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

// Test the connection on startup
pool.getConnection()
  .then(connection => {
    console.log("✅ [DB] Database connection successful!");
    connection.release();
  })
  .catch(err => {
    console.error("❌ [DB] Database connection failed!");
    console.error("❌ [DB] Error:", err.message);
    console.error("❌ [DB] Code:", err.code);
    console.error("❌ [DB] Please check your database credentials and network access");
  });

// A helper function to return the pool
async function getDB() {
  return pool;
}

// Export the function so quizroute.js can find it
module.exports = { getDB };