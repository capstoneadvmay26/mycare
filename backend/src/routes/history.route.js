const express = require("express");

const {getHistory} = require("../controllers/history.controller");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.get("/history/:profileId", requireAuth, getHistory);

module.exports = router;