const express = require("express");

const {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
  archiveProfile,
  switchProfile,
} = require("../controllers/profile.controller");

const requireAuth = require("../middlewares/requireAuth");
const validate = require("../middlewares/validate");

const {
  createProfileSchema,
  updateProfileSchema,
} = require("../validations/profile.validation");

const router = express.Router();

// ------------------------------------------------------------
// Profile routes
// ------------------------------------------------------------

router.post(
  "/",
  requireAuth,
  validate(createProfileSchema),
  createProfile
);

router.get(
  "/",
  requireAuth,
  getProfiles
);

// IMPORTANT: /switch must come before /:id
router.post(
  "/switch",
  requireAuth,
  switchProfile
);

router.get(
  "/:id",
  requireAuth,
  getProfileById
);

router.put(
  "/:id",
  requireAuth,
  validate(updateProfileSchema),
  updateProfile
);

router.delete(
  "/:id",
  requireAuth,
  archiveProfile
);

module.exports = router;
