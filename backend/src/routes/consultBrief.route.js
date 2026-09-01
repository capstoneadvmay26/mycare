const express = require("express");

const { getConsultBrief } = require("../controllers/consultBrief.controller");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.get("/reports/consult-brief", requireAuth, getConsultBrief);

module.exports = router;
