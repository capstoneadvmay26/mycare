const mongoose = require("mongoose");
const ProfileModel = require("../models/profile.model");

const toProfileResponse = (profile) => ({
  id: profile.id || profile._id.toString(),
  name: profile.name,
  relationship: profile.isSelf
    ? "Self"
    : profile.relationship,
  condition: profile.condition ?? null,
});

const getProfiles = async (req, res, next) => {
  try {
    const profiles = await ProfileModel.find({
      owner: req.user.id,
      status: { $ne: "archived" },
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      profiles: profiles.map(toProfileResponse),
    });
  } catch (error) {
    next(error);
  }
};

const createProfile = async (req, res, next) => {
  try {
    const { name, relationship, condition } = req.body;

    const isSelf = relationship.toLowerCase() === "self";

    if (isSelf) {
      const existingSelf = await ProfileModel.findOne({
        owner: req.user.id,
        isSelf: true,
        status: { $ne: "archived" },
      });

      if (existingSelf) {
        return res.status(400).json({
          success: false,
          message: "A self profile already exists.",
          errors: {},
        });
      }
    }

    const profile = await ProfileModel.create({
      owner: req.user.id,
      name,
      relationship: isSelf ? "Self" : relationship,
      condition: condition ?? null,
      isSelf,
    });

    return res.status(201).json({
      success: true,
      data: toProfileResponse(profile),
    });
  } catch (error) {
    next(error);
  }
};

const getProfileById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
        errors: {},
      });
    }

    const profile = await ProfileModel.findOne({
      _id: req.params.id,
      status: { $ne: "archived" },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
        errors: {},
      });
    }

    if (profile.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this profile.",
        errors: {},
      });
    }

    return res.status(200).json({
      success: true,
      data: toProfileResponse(profile)
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
        errors: {},
      });
    }

    const allowedFields = ["name", "relationship", "condition"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.relationship !== undefined) {
      updates.isSelf = updates.relationship === "self";
    }

    const profile = await ProfileModel.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $ne: "archived" },
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
        errors: {},
      });
    }

    if (profile.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this profile.",
        errors: {},
      });
    }

    return res.status(200).json({
      success: true,
      data: toProfileResponse(profile)
    });
  } catch (error) {
    next(error);
  }
};

const archiveProfile = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
        errors: {},
      });
    }

    const profile = await ProfileModel.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $ne: "archived" },
      },
      { $set: { status: "archived" } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
        errors: {},
      });
    }

    if (profile.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this profile.",
        errors: {},
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const switchProfile = async (req, res, next) => {
  try {
    const { profile_id } = req.body;

    if (!profile_id || !mongoose.Types.ObjectId.isValid(profile_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID.",
        errors: {},
      });
    }

    const profile = await ProfileModel.findOne({
      _id: profile_id,
      owner: req.user.id,
      status: { $ne: "archived" },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
        errors: {},
      });
    }

    return res.status(200).json({
      success: true,
      active_profile: toProfileResponse(profile),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
  archiveProfile,
  switchProfile,
};
