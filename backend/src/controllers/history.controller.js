const SymptomModel = require("../models/symptom.model");
const MedicationLogModel = require("../models/medicationLog.model");
const ProfileModel = require("../models/profile.model");


const getHistory = async (req, res, next) => {
    try {
        const { profileId } = req.params;

        const {
            startDate,
            endDate,
            type = "all"
        } = req.query;

        // VALIDATE TYPE
        const allowedTypes = [
            "all",
            "symptoms",
            "check-ins",
            "medications"
        ];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid type. Use all, symptoms, check-ins, or medications."
            });
        }

        // VALIDATE DATES
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "startDate and endDate are required."
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid startDate or endDate."
            });
        }

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: "startDate cannot be after endDate."
            });
        }

        // FIND PROFILE
        const profile = await ProfileModel.findById(profileId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found."
            });
        }

        // CHECK OWNERSHIP
        if (profile.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this profile."
            });
        }

        // HISTORY ARRAY
        let history = [];

        // SYMPTOMS
        if (type === "all" || type === "symptoms") {

            const symptoms = await SymptomModel.find({
                profile: profileId,
                loggedAt: {
                    $gte: start,
                    $lte: end
                }
            }).sort({ loggedAt: -1 });


            for (const symptom of symptoms) {

                const symptomName =
                    symptom.symptoms?.join(", ") ||
                    symptom.otherSymptom ||
                    "Unknown symptom";


                history.push({
                    type: "symptom",
                    date: symptom.loggedAt,
                    title: "Logged symptom",
                    symptom: symptomName,
                    severity: symptom.severity,
                    symptomId: symptom._id
                });
            }
        }

        // CHECK-INS
        if (type === "all" || type === "check-ins") {

            const symptomsWithCheckIns =
                await SymptomModel.find({
                    profile: profileId
                });


            for (const symptom of symptomsWithCheckIns) {

                const symptomName =
                    symptom.symptoms?.join(", ") ||
                    symptom.otherSymptom ||
                    "Unknown symptom";


                for (const checkIn of symptom.checkIns || []) {

                    const checkInDate = checkIn.checkedInAt;

                    if (
                        checkInDate >= start &&
                        checkInDate <= end
                    ) {

                        history.push({
                            type: "check-in",
                            date: checkInDate,
                            title: `Check-in Day ${checkIn.day}`,
                            symptom: symptomName,
                            status: checkIn.status,
                            symptomId: symptom._id
                        });
                    }
                }
            }
        }


        // MEDICATIONS
        if (type === "all" || type === "medications") {

            const medicationLogs =
                await MedicationLogModel.find({
                    profile: profileId,
                    status: {
                        $in: ["taken", "skipped"]
                    },
                    scheduledFor: {
                        $gte: start,
                        $lte: end
                    }
                })
                .populate("medication")
                .sort({ scheduledFor: -1 });


            for (const log of medicationLogs) {

                history.push({
                    type: "medication",
                    date:
                        log.status === "taken"
                            ? log.takenAt || log.scheduledFor
                            : log.skippedAt || log.scheduledFor,

                    title:
                        log.status === "taken"
                            ? "Medication taken"
                            : "Medication skipped",

                    medication: log.medication?.name,
                    dosage: log.medication?.dosage,
                    status: log.status,
                    medicationLogId: log._id
                });
            }
        }

        // SORT EVERYTHING TOGETHER
        // NEWEST → OLDEST
        history.sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        );

        // RESPONSE
        return res.status(200).json({
            success: true,
            profileId,
            startDate: start,
            endDate: end,
            type,
            count: history.length,
            history
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getHistory
};