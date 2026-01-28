require("dotenv").config();
const mysql = require("mysql2/promise");

console.log("[DB] Initializing database connection...");
console.log("[DB] Host:", process.env.DB_HOST);
console.log("[DB] Database:", process.env.DB_NAME);
console.log("[DB] User:", process.env.DB_USER ? "✓" : "✗");
console.log("[DB] Password:", process.env.DB_PASSWORD ? "✓" : "✗");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection on startup
pool.getConnection()
  .then(connection => {
    console.log("[DB] ✓ Database connection successful");
    connection.release();
  })
  .catch(err => {
    console.error("[DB] ✗ Database connection failed:", err.message);
  });

// A helper function to return the pool
async function getDB() {
  return pool;
}

// Export the function so quizroute.js can find it
module.exports = { getDB };