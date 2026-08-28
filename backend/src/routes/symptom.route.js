const express = require("express");
const router = express.Router();

const { createSymptom, addCheckIn, getSymptomStatus } = require("../controllers/symptom.controller");
const validate = require("../middlewares/validate");
const { createSymptomSchema, checkInSchema } = require("../validations/symptom.validation");
const requireAuth = require("../middlewares/requireAuth");

router.use(requireAuth);

router.post("/symptoms/log", validate(createSymptomSchema), createSymptom);

router.post("/symptoms/:id/check-in", validate(checkInSchema), addCheckIn);

router.get("/symptoms/:id/status", getSymptomStatus);

module.exports = router;