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


const addCheckIn = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Find symptom
        const symptom = await SymptomModel.findById(id);

        if (!symptom) {
            return res.status(404).json({
                message: "Symptom not found."
            });
        }

        // Find profile
        const profile = await ProfileModel.findById(symptom.profile);

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found."
            });
        }

        // Check profile ownership
        if (profile.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You don't have access to this symptom."
            });
        }

        // Check completed days
        const checkInCount = symptom.checkIns.length;

        if (checkInCount >= 3) {
            return res.status(400).json({
                message: "The 3-day check-in cycle is already complete."
            });
        }

        // Determine day
        const day = checkInCount + 1;

        // Get current date and time
        const now = new Date();

        // Check first day timing
        if (day === 1) {
            const nextAvailableDate = new Date(symptom.loggedAt);

            nextAvailableDate.setDate(
                nextAvailableDate.getDate() + 1
            );

            if (now < nextAvailableDate) {
                return res.status(400).json({
                    message: "Day 1 check-in will be available tomorrow."
                });
            }
        }

        // Check previous check-in timing
        if (day > 1) {
            const previousCheckIn =
                symptom.checkIns[checkInCount - 1];

            const nextAvailableDate = new Date(
                previousCheckIn.checkedInAt
            );

            nextAvailableDate.setDate(
                nextAvailableDate.getDate() + 1
            );

            if (now < nextAvailableDate) {
                return res.status(400).json({
                    message: `Day ${day} check-in will be available tomorrow.`
                });
            }
        }

        // Save check-in
        symptom.checkIns.push({
            day,
            status,
            checkedInAt: now
        });

        // Default response
        let professionalCareNudge = {
            shown: false
        };

        // Evaluate professional-care nudge after Day 3
        if (day === 3) {
            const hasWorseResponse = symptom.checkIns.some(
                checkIn => checkIn.status === "worse"
            );

            const sameOrWorseCount = symptom.checkIns.filter(
                checkIn =>
                    checkIn.status === "same" ||
                    checkIn.status === "worse"
            ).length;

            // Nudge if there is any "worse"
            // OR "same/worse" appears on 2 or more check-ins
            if (hasWorseResponse || sameOrWorseCount >= 2) {
                symptom.professionalCareNudge.shown = true;
                symptom.professionalCareNudge.shownAt = now;

                professionalCareNudge = {
                    shown: true,
                    shownAt: now,
                    message: "Hasn't been improving, it's worth seeing a doctor."
                };
            }
        }

        await symptom.save();

        return res.status(201).json({
            success: true,
            message: `Day ${day} check-in recorded successfully.`,
            checkIn: symptom.checkIns[symptom.checkIns.length - 1],
            professionalCareNudge
        });

    } catch (error) {
        next(error);
    }
};

const getSymptomStatus = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find symptom
        const symptom = await SymptomModel.findById(id);

        if (!symptom) {
            return res.status(404).json({
                message: "Symptom not found."
            });
        }

        // Find profile
        const profile = await ProfileModel.findById(symptom.profile);

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found."
            });
        }

        // Check profile ownership
        if (profile.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You don't have access to this symptom."
            });
        }

        // Number of completed check-ins
        const checkInCount = symptom.checkIns.length;

        // Determine current day
        const currentDay = Math.min(checkInCount + 1, 3);

        // No check-ins means we cannot determine improvement yet
        let isImproving = null;

        if (checkInCount > 0) {
            // Check if any check-in was worse
            const hasWorseResponse = symptom.checkIns.some(
                checkIn => checkIn.status === "worse"
            );

            // Count same/worse responses
            const sameOrWorseCount = symptom.checkIns.filter(
                checkIn =>
                    checkIn.status === "same" ||
                    checkIn.status === "worse"
            ).length;

            // Any "worse" OR 2+ "same/worse" responses
            // means the symptom is not considered improving.
            isImproving =
                !hasWorseResponse && sameOrWorseCount < 2;
        }

        // Check whether professional-care nudge is needed
        const needsDoctorNudge =
            symptom.professionalCareNudge?.shown === true;

        return res.status(200).json({
            current_day: currentDay,
            is_improving: isImproving,
            needs_doctor_nudge: needsDoctorNudge
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSymptom,
    addCheckIn,
    getSymptomStatus
};