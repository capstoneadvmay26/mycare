const express = require("express");

const app = express();
const medicationLogRoutes = require('./routes/medicationLog.route');
const symptomRoutes = require("./routes/symptom.route");
const historyRoutes = require("./routes/history.route");
const consultBriefRoutes = require("./routes/consultBrief.route");

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "MY CARE API is running",
  });
});

app.use('/api', medicationLogRoutes);
app.use("/api", symptomRoutes);
app.use("/api", historyRoutes);
app.use("/api", consultBriefRoutes);

module.exports = app;
