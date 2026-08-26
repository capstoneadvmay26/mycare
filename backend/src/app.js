const express = require("express");

const app = express();
const medicationLogRoutes = require('./routes/medicationLog.route');

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "MY CARE API is running",
  });
});

app.use('/api', medicationLogRoutes);

module.exports = app;
