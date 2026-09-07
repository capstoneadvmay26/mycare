const express = require("express");

const { getConsultBrief } = require("../controllers/consultBrief.controller");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.get("/reports/consult-brief/:profile_id", requireAuth, getConsultBrief);

module.exports = router;
