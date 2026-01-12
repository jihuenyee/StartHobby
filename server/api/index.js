const express = require("express");
const userRoutes = require("../routes/userRoutes");

const app = express();

app.use(express.json());

// Root test
app.get("/", (req, res) => {
  res.send("SERVER API BOOT OK 🚀");
});

// 👇 THIS is what enables /api/users
app.use("/users", userRoutes);

module.exports = app;
