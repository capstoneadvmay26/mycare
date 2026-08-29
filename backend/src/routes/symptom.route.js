const express = require("express");
const router = express.Router();

const { createSymptom, addCheckIn, getSymptomStatus, recordDoctorFollowUp, getSymptomOptions, getSymptomHistory, updateSymptom, deleteSymptom} = require("../controllers/symptom.controller");
const validate = require("../middlewares/validate");
const { createSymptomSchema, checkInSchema,doctorFollowUpSchema, updateSymptomSchema } = require("../validations/symptom.validation");
const requireAuth = require("../middlewares/requireAuth");

router.use(requireAuth);

// Create symptom
router.post("/symptoms/log", validate(createSymptomSchema), createSymptom);

// Add check-in
router.post("/symptoms/:id/check-in", validate(checkInSchema), addCheckIn);

// Get symptom options
router.get("/symptoms/options", getSymptomOptions);

// Get symptom status
router.get("/symptoms/:id/status", getSymptomStatus);

// Symptom history
router.get("/symptoms/history", getSymptomHistory);

// Update symptom
router.patch("/symptoms/:id", validate(updateSymptomSchema), updateSymptom);

// Delete symptom
router.delete("/symptoms/:id", deleteSymptom);

// Doctor follow-up
router.post("/notifications/doctor-follow-up", validate(doctorFollowUpSchema), recordDoctorFollowUp);

module.exports = router;