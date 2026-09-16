const express = require("express");
const router = express.Router();

const {
    createProfile,
    getProfiles,
    getProfileById,
    updateProfile,
    archiveProfile,
    uploadProfileImage, // NEW
    deleteProfileImage, // NEW
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
// NEW - upload.single("image") means: expect ONE file, sent under the
// form field name "image". This must match whatever ke name the
// frontend uses when it builds its FormData for the upload.
router.post("/:id/image", requireAuth, uploadProfileImage);
router.delete("/:id/image", requireAuth, deleteProfileImage);
module.exports = router;