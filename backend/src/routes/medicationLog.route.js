const express = require('express');

const {
    getMedicationHistory,
    markDoseAsTaken,
    markDoseAsSkipped
} = require('../controllers/medicationLog.controller');

const router = express.Router();

router.get("/medication-history/:profileId", getMedicationHistory);

router.patch ('/medication-logs/:id/taken', markDoseAsTaken);

router.patch ('/medication-logs/:id/skipped', markDoseAsSkipped);

module.exports = router;