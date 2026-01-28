require("dotenv").config();
const mysql = require("mysql2/promise"); // Change this to promise

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

// A helper function to return the pool
async function getDB() {
  return pool;
}

// Export the function so quizroute.js can find it
module.exports = { getDB };