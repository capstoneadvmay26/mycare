const express = require("express");

const profileRoutes = require("./routes/profile.route");
const medicationRoutes = require("./routes/medication.route");
const medicationLogRoutes = require("./routes/medicationLog.route");
const symptomRoutes = require("./routes/symptom.route");
const historyRoutes = require("./routes/history.route");
const consultBriefRoutes = require("./routes/consultBrief.route");
const notificationSettingsRoutes = require("./routes/notificationSettings.route");
const userRoutes = require("./routes/user.route");

const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ------------------------------------------------------------
// Global middleware
// ------------------------------------------------------------

app.use(logger);

app.use(express.json());

// ------------------------------------------------------------
// Routes
// ------------------------------------------------------------

app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api", medicationLogRoutes);
app.use("/api", symptomRoutes);
app.use("/api", historyRoutes);
app.use("/api", consultBriefRoutes);
app.use("/api", notificationSettingsRoutes);

// ------------------------------------------------------------
// Health check
// ------------------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MY CARE API is running",
    requestId: req.requestId,
  });
});

// ------------------------------------------------------------
// 404 handler
//
// Must come AFTER all routes and BEFORE the global error handler.
// ------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "NOT_FOUND",
    requestId: req.requestId,
  });
});

// ------------------------------------------------------------
// Global error handler
//
// Must be the final middleware.
// ------------------------------------------------------------

app.use(errorHandler);

module.exports = app;
