const express = require('express');

const {
    markDoseAsTaken,
    markDoseAsSkipped
} = require('../controllers/medicationLog.controller');

const router = express.Router();

router.patch ('/medication-logs/:id/taken', markDoseAsTaken);

router.patch ('/medication-logs/:id/skipped', markDoseAsSkipped);

module.exports = router;