const express = require("express");
const userRoutes = require("./routes/user.route");

const app = express();


app.use(express.json());
app.use('/api/users', userRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "MY CARE API is running",
  });
});

module.exports = app;
