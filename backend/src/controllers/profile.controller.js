const Profile = require("../models/profile.model");

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

module.exports = {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
  archiveProfile,
};