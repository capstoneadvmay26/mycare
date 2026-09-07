const express = require("express");

const {
    getMedicationHistory,
    markDoseAsTaken,
    markDoseAsSkipped,
} = require("../controllers/medicationLog.controller");

const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/medications/history/:profile_id", getMedicationHistory);

router.post("/medications/:id/taken", markDoseAsTaken);

router.post("/medications/:id/skipped", markDoseAsSkipped);

module.exports = router;
