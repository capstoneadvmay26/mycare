const express = require("express");
const router = express.Router();

const { createSymptom } = require("../controllers/symptom.controller");
const validate = require("../middlewares/validate");
const { createSymptomSchema } = require("../validations/symptom.validation");

router.post("/symptoms/log", validate(createSymptomSchema), createSymptom);

module.exports = router;