const express = require("express");
const profileRoutes = require("./routes/profile.route");
const medicationRoutes = require("./routes/medication.route");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "MY CARE API is running",
  });
});

app.use("/api/profiles", profileRoutes);
app.use("/api/medications",medicationRoutes);
app.use(errorHandler);

module.exports = app;
