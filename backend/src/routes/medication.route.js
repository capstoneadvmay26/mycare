// src/routes/medication.route.js

const express = require("express");
const router = express.Router();

const {
  addMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  archiveMedication,
} = require("../controllers/medication.controller");

const requireAuth = require("../middlewares/requireAuth");
const validate = require("../middlewares/validate");
const {
  createMedicationSchema,
  updateMedicationSchema,
} = require("../validations/medication.validation");

router.post("/", requireAuth, validate(createMedicationSchema), addMedication);
router.get("/", requireAuth, getMedications);
router.get("/:id", requireAuth, getMedicationById);
router.put("/:id", requireAuth, validate(updateMedicationSchema), updateMedication);
router.delete("/:id", requireAuth, archiveMedication);

module.exports = router;