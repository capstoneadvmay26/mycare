const SymptomModel = require("../models/symptom.model");
const ProfileModel = require("../models/profile.model");

const createSymptom = async (req, res, next) => {
    try {
        const { profileId, symptoms, otherSymptom, severity } = req.body;

        // Find profile
        const profile = await ProfileModel.findById(profileId);

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found."
            });
        }

        // Check profile ownership
        if (profile.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You don't have access to this profile."
            });
        }

        // Create symptom
        const symptom = new SymptomModel({
            profile: profileId,
            symptoms,
            otherSymptom,
            severity,
            loggedAt: new Date()
        });
        
        await symptom.save();

        return res.status(201).json({
            success: true,
            message: "Symptom logged successfully.",
            symptom
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSymptom
};