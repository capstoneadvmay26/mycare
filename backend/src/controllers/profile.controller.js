const Profile = require("../models/profile.model");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
// CREATE - POST /api/profiles
async function createProfile(req, res, next) {
  try {
    const { isSelf } = req.body;

    // Enforce: a user can only have ONE profile marked isSelf: true.
    // Prevents someone accidentally creating two "self" profiles.
    if (isSelf) {
      const existingSelf = await Profile.findOne({
        owner: req.user.id,
        isSelf: true,
        status: "active",
      });
      if (existingSelf) {
        return res.status(400).json({
          success: false,
          message: "You already have a self profile.",
        });
      }
    }

    const profile = await Profile.create({
      ...req.body,
      owner: req.user.id,
    });

    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

// READ ALL - GET /api/profiles
// Returns only the logged-in user's own profiles (self + dependents),
// excluding archived ones by default.
async function getProfiles(req, res, next) {
  try {
    const profiles = await Profile.find({
      owner: req.user.id,
      status: "active",
    }).sort({ isSelf: -1, createdAt: 1 }); // self profile first, then dependents oldest-first

    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
}

// READ ONE - GET /api/profiles/:id
async function getProfileById(req, res, next) {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Ownership check: only the owning user can view this profile.
    if (profile.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this profile.",
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

// UPDATE - PUT /api/profiles/:id
async function updateProfile(req, res, next) {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (profile.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this profile.",
      });
    }

    Object.assign(profile, req.body);
    await profile.save();

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

// ARCHIVE (soft delete) - DELETE /api/profiles/:id
async function archiveProfile(req, res, next) {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (profile.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this profile.",
      });
    }

    profile.status = "archived";
    await profile.save();

    res.status(200).json({ success: true, message: "Profile archived" });
  } catch (error) {
    next(error);
  }
}

const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// UPLOAD or CHANGE profile image — POST /api/profiles/:id/image
async function uploadProfileImage(req, res, next) {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (profile.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this profile.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file was uploaded.",
      });
    }

    // If this profile ALREADY has an image, delete the old one from
    // Cloudinary first — otherwise, changing your photo would leave
    // orphaned, unused images piling up on your Cloudinary account forever.
    if (profile.profileImage && profile.profileImage.publicId) {
      await cloudinary.uploader.destroy(profile.profileImage.publicId);
    }

    // Upload the new image. "folder" keeps all profile images organized
    // together in your Cloudinary dashboard instead of scattered loosely.
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "mycare/profile-images",
    });

    // Delete the temporary local file now that Cloudinary has it —
    // we don't need to keep our own copy on the server.
    fs.unlinkSync(req.file.path);

    profile.profileImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    await profile.save();

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

// DELETE profile image — DELETE /api/profiles/:id/image
async function deleteProfileImage(req, res, next) {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (profile.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this profile.",
      });
    }

    if (!profile.profileImage || !profile.profileImage.publicId) {
      return res.status(400).json({
        success: false,
        message: "This profile doesn't have an image to delete.",
      });
    }

    // Remove the actual image file from Cloudinary's servers.
    await cloudinary.uploader.destroy(profile.profileImage.publicId);

    // Clear the reference on our own database record.
    profile.profileImage = { url: null, publicId: null };
    await profile.save();

    res.status(200).json({ success: true, message: "Profile image deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
  archiveProfile,
  uploadProfileImage, //NEW
  deleteProfileImage, // NEW
};