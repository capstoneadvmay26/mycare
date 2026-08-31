const express = require("express");
const router = express.Router();

const {
    createProfile,
    getProfiles,
    getProfileById,
    updateProfile,
    archiveProfile,
} = require("../controllers/profile.controller");

const requireAuth = require("../middlewares/requireAuth");
const validate = require("../middlewares/validate");
const {
    createProfileSchema,
    updateProfileSchema,
} = require("../validations/profile.validation");

router.post("/", requireAuth, validate(createProfileSchema), createProfile);
router.get("/", requireAuth, getProfiles);
router.get("/:id",requireAuth, getProfileById);
router.put("/:id", requireAuth, validate(updateProfileSchema), updateProfile);
router.delete("/:id", requireAuth, archiveProfile);

module.exports = router;