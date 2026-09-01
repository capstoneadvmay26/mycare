const SymptomModel = require("../models/symptom.model");
const ProfileModel = require("../models/profile.model");

const createSymptom = async (req, res, next) => {
    try {
        const { profile_id, symptoms, otherSymptom, severity } = req.body;

        // Find profile
        const profile = await ProfileModel.findById(profile_id);

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
            profile: profile_id,
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
            const hasWorseResponse = symptom.checkIns.some(
                checkIn => checkIn.status === "worse"
            );

            const sameOrWorseCount = symptom.checkIns.filter(
                checkIn =>
                    checkIn.status === "same" ||
                    checkIn.status === "worse"
            ).length;

            isImproving =
                !hasWorseResponse && sameOrWorseCount < 2;
        }

        // Check whether professional-care nudge is needed
        const needsDoctorNudge =
            symptom.professionalCareNudge?.shown === true;

        // Determine whether doctor follow-up is due
        let doctorFollowUpDue = false;

        if (needsDoctorNudge) {
            const now = new Date();

            // First follow-up:
            // 8 hours after the professional-care nudge
            if (!symptom.doctorFollowUp?.respondedAt) {
                const firstFollowUpTime = new Date(
                    symptom.professionalCareNudge.shownAt
                );

                firstFollowUpTime.setHours(
                    firstFollowUpTime.getHours() + 8
                );

                doctorFollowUpDue = now >= firstFollowUpTime;
            }

            // Later follow-ups:
            // 8 hours after "remind_later"
            else if (
                symptom.doctorFollowUp.response === "remind_later" &&
                symptom.doctorFollowUp.nextReminderAt
            ) {
                doctorFollowUpDue =
                    now >= symptom.doctorFollowUp.nextReminderAt;
            }
        }

        return res.status(200).json({
            current_day: currentDay,
            is_improving: isImproving,
            needs_doctor_nudge: needsDoctorNudge,
            doctor_follow_up_due: doctorFollowUpDue
        });

    } catch (error) {
        next(error);
    }
};


const recordDoctorFollowUp = async (req, res, next) => {
    try {
        const { symptomId, response } = req.body;

        // Find symptom
        const symptom = await SymptomModel.findById(symptomId);

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

        // Make sure professional-care nudge was shown
        if (!symptom.professionalCareNudge?.shown) {
            return res.status(400).json({
                message: "Professional-care follow-up is not available for this symptom."
            });
        }

        const now = new Date();

        // Make sure the first follow-up is not submitted before 8 hours
        if (!symptom.doctorFollowUp?.respondedAt) {
            const followUpAvailableAt = new Date(
                symptom.professionalCareNudge.shownAt
            );

            followUpAvailableAt.setHours(
                followUpAvailableAt.getHours() + 8
            );

            if (now < followUpAvailableAt) {
                return res.status(400).json({
                    message: "Doctor follow-up is not available yet."
                });
            }
        }

        // If the previous response was remind_later,
        // make sure the next 8-hour reminder is due.
        if (
            symptom.doctorFollowUp?.response === "remind_later" &&
            symptom.doctorFollowUp?.nextReminderAt
        ) {
            if (now < symptom.doctorFollowUp.nextReminderAt) {
                return res.status(400).json({
                    message: "The next doctor follow-up reminder is not available yet."
                });
            }
        }

        // Save user's response
        symptom.doctorFollowUp.response = response;
        symptom.doctorFollowUp.respondedAt = now;

        // Remind again after 8 hours
        if (response === "remind_later") {
            symptom.doctorFollowUp.nextReminderAt = new Date(
                now.getTime() + 8 * 60 * 60 * 1000
            );
        } else {
            // Yes or No ends the follow-up cycle
            symptom.doctorFollowUp.nextReminderAt = null;
        }

        await symptom.save();

        return res.status(200).json({
            success: true,
            message: "Doctor follow-up response recorded successfully.",
            doctorFollowUp: symptom.doctorFollowUp
        });

    } catch (error) {
        next(error);
    }
};

const getSymptomOptions = async (req, res, next) => {
    try {
        const symptoms = [
            "Headache",
            "Fatigue",
            "Fever",
            "Nausea",
            "Dizziness",
            "Body pains",
            "Cough",
            "Chest discomfort",
            "Stomachache",
            "Others"
        ];

        return res.status(200).json({
            symptoms
        });

    } catch (error) {
        next(error);
    }
};

const getSymptomHistory = async (req, res, next) => {
    try {
        const { symptom } = req.query;

        // Find profiles belonging to the authenticated user
        const profiles = await ProfileModel.find({
            owner: req.user.id
        }).select("_id");

        const profile_ids = profiles.map(profile => profile._id);

        // Build query
        const query = {
            profile: { $in: profile_ids }
        };

        // Optional symptom filter
        if (symptom) {
            query.symptoms = {
                $regex: symptom,
                $options: "i"
            };
        }

        // Find symptom history
        const symptoms = await SymptomModel.find(query)
            .sort({ loggedAt: -1 });

        return res.status(200).json({
            success: true,
            count: symptoms.length,
            symptoms
        });

    } catch (error) {
        next(error);
    }
};

const updateSymptom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { symptoms, otherSymptom, severity } = req.body;

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

        // Update supplied fields only
        if (symptoms !== undefined) {
            symptom.symptoms = symptoms;
        }

        if (otherSymptom !== undefined) {
            symptom.otherSymptom = otherSymptom;
        }

        if (severity !== undefined) {
            symptom.severity = severity;
        }

        await symptom.save();

        return res.status(200).json({
            success: true,
            message: "Symptom updated successfully.",
            symptom
        });

    } catch (error) {
        next(error);
    }
};

const deleteSymptom = async (req, res, next) => {
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

        await SymptomModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Symptom deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSymptom,
    addCheckIn,
    getSymptomStatus,
    recordDoctorFollowUp,
    getSymptomOptions,
    getSymptomHistory,
    updateSymptom,
    deleteSymptom
};
