const express = require("express");
const profileRoutes = require("./routes/profile.route");
const medicationRoutes = require("./routes/medication.route");
const medicationLogRoutes = require("./routes/medicationLog.route");
const symptomRoutes = require("./routes/symptom.route");
const historyRoutes = require("./routes/history.route");
const consultBriefRoutes = require("./routes/consultBrief.route");
const notificationSettingsRoutes = require("./routes/notificationSettings.route");
const userRoutes = require("./routes/user.route");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api", medicationLogRoutes);
app.use("/api", symptomRoutes);
app.use("/api", historyRoutes);
app.use("/api", consultBriefRoutes);
app.use("/api", notificationSettingsRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "MY CARE API is running",
  });
});

app.use(errorHandler);

module.exports = app;
