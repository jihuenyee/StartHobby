require("dotenv").config();
const express = require("express");
const apiApp = require("./api/index");

const app = express();
const PORT = process.env.PORT || 5000;

// 👇 THIS is the missing piece
app.use("/api", apiApp);

app.listen(PORT, () => {
  console.log(`🚀 Local API running at http://localhost:${PORT}/api`);
});
