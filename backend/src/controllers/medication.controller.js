const Medication = require("../models/medication.model");
const Profile = require("../models/profile.model");

// Small shared helper — confirms the logged-in user actually owns the
// profile a medication is attached to. Used by every function below.
async function verifyProfileOwnership(profile_id, userId) {
  const profile = await Profile.findById(profile_id);
  if (!profile) {
    return { error: "Profile not found", status: 404 };
  }
  if (profile.owner.toString() !== userId) {
    return { error: "You don't have access to this profile.", status: 403 };
  }
  return { profile };
}

// CREATE - POST /api/v1/medications
async function addMedication(req, res, next) {
  try {
    const { profile_id } = req.body;

    const check = await verifyProfileOwnership(profile_id, req.user.id);
    if (check.error) {
      return res.status(check.status).json({ success: false, message: check.error });
    }

    const medication = await Medication.create({
      ...req.body,
      profile: profile_id,
    });

    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
}

// READ ALL - GET /api/v1/medications?profile_id=...
async function getMedications(req, res, next) {
  try {
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: "profile_id query parameter is required.",
      });
    }

    const check = await verifyProfileOwnership(profile_id, req.user.id);
    if (check.error) {
      return res.status(check.status).json({ success: false, message: check.error });
    }

    const medications = await Medication.find({
      profile: profile_id,
      status: "active",
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: medications });
  } catch (error) {
    next(error);
  }
}

// READ ONE - GET /api/v1/medications/:id
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

// UPDATE - PUT /api/v1/medications/:id
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

// ARCHIVE - DELETE /api/v1/medications/:id
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
