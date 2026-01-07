// server/api/index.js
const app = require("../index"); // index.js is one level up
const serverless = require("serverless-http");

module.exports = serverless(app);
