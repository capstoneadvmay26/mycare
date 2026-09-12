const SymptomModel = require("../models/symptom.model");
const MedicationLogModel = require("../models/medicationLog.model");
const ProfileModel = require("../models/profile.model");

const getHistory = async (req, res, next) => {
    try {
        const { profile_id, type = "all" } = req.query;

        // VALIDATE TYPE
        const allowedTypes = [
            "all",
            "symptoms",
            "check-ins",
            "medications",
        ];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid type. Use all, symptoms, check-ins, or medications.",
            });
        }

        // VALIDATE PROFILE ID
        if (!profile_id) {
            return res.status(400).json({
                success: false,
                message: "Profile ID is required.",
            });
        }

        // FIND PROFILE
        const profile = await ProfileModel.findById(profile_id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found.",
            });
        }

        // CHECK OWNERSHIP
        if (profile.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this profile.",
            });
        }

        // HISTORY ARRAY
        const history = [];

        // SYMPTOMS
        if (type === "all" || type === "symptoms") {
            const symptoms = await SymptomModel.find({
                profile: profile_id,
            }).sort({ loggedAt: -1 });

            for (const symptom of symptoms) {
                const symptomName =
                    symptom.symptoms?.length
                        ? symptom.symptoms.join(", ")
                        : symptom.otherSymptom || "Unknown symptom";

                history.push({
                    id: symptom._id.toString(),
                    type: "symptom",
                    date: symptom.loggedAt,
                    title: "Logged symptom",
                    symptom: symptomName,
                    severity: symptom.severity,
                    symptomId: symptom._id.toString(),
                });
            }
        }

        // CHECK-INS
        if (type === "all" || type === "check-ins") {
            const symptomsWithCheckIns = await SymptomModel.find({
                profile: profile_id,
            });

            for (const symptom of symptomsWithCheckIns) {
                const symptomName =
                    symptom.symptoms?.length
                        ? symptom.symptoms.join(", ")
                        : symptom.otherSymptom || "Unknown symptom";

                for (const checkIn of symptom.checkIns || []) {
                    if (!checkIn.checkedInAt) {
                        continue;
                    }

                    history.push({
                        id: `${symptom._id.toString()}-${checkIn.day}`,
                        type: "check-in",
                        date: checkIn.checkedInAt,
                        title: `Check-in Day ${checkIn.day}`,
                        symptom: symptomName,
                        status: checkIn.status,
                        symptomId: symptom._id.toString(),
                    });
                }
            }
        }

        // MEDICATIONS
        if (type === "all" || type === "medications") {
            const medicationLogs = await MedicationLogModel.find({
                profile: profile_id,
                status: {
                    $in: ["taken", "skipped"],
                },
            })
                .populate("medication")
                .sort({ scheduledFor: -1 });

            for (const log of medicationLogs) {
                const eventDate =
                    log.status === "taken"
                        ? log.takenAt || log.scheduledFor
                        : log.skippedAt || log.scheduledFor;

                history.push({
                    id: log._id.toString(),
                    type: "medication",
                    date: eventDate,
                    title:
                        log.status === "taken"
                            ? "Medication taken"
                            : "Medication skipped",
                    medication:
                        log.medication?.name || "Unknown medication",
                    dosage:
                        log.medication?.dosage || null,
                    status: log.status,
                    medicationLogId: log._id.toString(),
                });
            }
        }

        // SORT NEWEST → OLDEST
        history.sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        );

        // RESPONSE
        return res.status(200).json({
            success: true,
            profile_id,
            type,
            count: history.length,
            history,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHistory,
};