const express = require('express');

const {
    getMedicationHistory,
    markDoseAsTaken,
    markDoseAsSkipped
} = require('../controllers/medicationLog.controller');
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/medication-history/:profileId", getMedicationHistory);

router.patch ('/medication-logs/:id/taken', markDoseAsTaken);

router.patch ('/medication-logs/:id/skipped', markDoseAsSkipped);

module.exports = router;