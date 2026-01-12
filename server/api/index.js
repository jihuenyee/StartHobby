const express = require("express");

const app = express();

// This responds to /api
app.get("/", (req, res) => {
  res.send("SERVER API BOOT OK 🚀");
});

module.exports = app;
