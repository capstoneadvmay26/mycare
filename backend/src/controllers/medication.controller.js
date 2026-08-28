const Medication = require("../models/medication.model");
const Profile = require("../models/profile.model");

// Small shared helper — confirms the logged-in user actually owns the
// profile a medication is attached to. Used by every function below.
async function verifyProfileOwnership(profileId, userId) {
  const profile = await Profile.findById(profileId);
  if (!profile) {
    return { error: "Profile not found", status: 404 };
  }
  if (profile.owner.toString() !== userId) {
    return { error: "You don't have access to this profile.", status: 403 };
  }
  return { profile };
}

// CREATE - POST /api/medications
async function addMedication(req, res, next) {
  try {
    const { profileId } = req.body;

    const check = await verifyProfileOwnership(profileId, req.user.id);
    if (check.error) {
      return res.status(check.status).json({ success: false, message: check.error });
    }

    const medication = await Medication.create({
      ...req.body,
      profile: profileId,
    });

    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
}

// READ ALL - GET /api/medications?profileId=...
async function getMedications(req, res, next) {
  try {
    const { profileId } = req.query;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "profileId query parameter is required.",
      });
    }

    const check = await verifyProfileOwnership(profileId, req.user.id);
    if (check.error) {
      return res.status(check.status).json({ success: false, message: check.error });
    }

    const medications = await Medication.find({
      profile: profileId,
      status: "active",
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: medications });
  } catch (error) {
    next(error);
  }
}

// READ ONE - GET /api/medications/:id
async function getMedicationById(req, res, next) {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: "Medication not found" });
    }

    const check = await verifyProfileOwnership(medication.profile, req.user.id);
    if (check.error) {
      return res.status(check.status).json({ success: false, message: check.error });
    }

    res.status(200).json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
}

// UPDATE - PUT /api/medications/:id
async function updateMedication(req, res, next) {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: "Medication not found" });
    }

    const check = await verifyProfileOwnership(medication.profile, req.user.id);
    if (check.error) {
      return res.status(check.status).json({ success: false, message: check.error });
    }

    Object.assign(medication, req.body);
    await medication.save();

    res.status(200).json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
}

// ARCHIVE - DELETE /api/medications/:id
async function archiveMedication(req, res, next) {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: "Medication not found" });
    }

    const check = await verifyProfileOwnership(medication.profile, req.user.id);
    if (check.error) {
      return res.status(check.status).json({ success: false, message: check.error });
    }

    medication.status = "archived";
    await medication.save();

    res.status(200).json({ success: true, message: "Medication archived" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  archiveMedication,
};
