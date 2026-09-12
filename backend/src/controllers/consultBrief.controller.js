const mongoose = require("mongoose");

const ProfileModel = require("../models/profile.model");
const MedicationModel = require("../models/medication.model");
const MedicationLogModel = require("../models/medicationLog.model");
const SymptomModel = require("../models/symptom.model");

const generateScheduledOccurrences = require("../utils/medicationLogGenerator");

const getConsultBrief = async (req, res, next) => {
    try {
        const { profile_id } = req.params;
        const { startDate, endDate } = req.query;

        // VALIDATE PROFILE ID
        if (!mongoose.Types.ObjectId.isValid(profile_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid profile_id."
            });
        }

        // FIND PROFILE
        const profile = await ProfileModel.findById(profile_id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found."
            });
        }

        // CHECK PROFILE OWNERSHIP
        if (profile.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this profile."
            });
        }

        // DETERMINE DATE RANGE
        // Dates are OPTIONAL.
        let start;
        let end;

        const now = new Date();

        // Get earliest medication start date
        const earliestMedication = await MedicationModel.findOne({
            profile: profile_id
        })
            .sort({ startDate: 1 })
            .select("startDate");

        // Get earliest symptom date
        const earliestSymptom = await SymptomModel.findOne({
            profile: profile_id
        })
            .sort({ loggedAt: 1 })
            .select("loggedAt");

        // Get earliest medication log date
        const earliestMedicationLog = await MedicationLogModel.findOne({
            profile: profile_id
        })
            .sort({ scheduledFor: 1 })
            .select("scheduledFor");

        // Determine earliest available history date
        const possibleStartDates = [
            earliestMedication?.startDate,
            earliestSymptom?.loggedAt,
            earliestMedicationLog?.scheduledFor
        ].filter(Boolean);

        let earliestDate = now;

        if (possibleStartDates.length > 0) {
            earliestDate = new Date(
                Math.min(
                    ...possibleStartDates.map(date =>
                        new Date(date).getTime()
                    )
                )
            );
        }

        // START DATE
        if (startDate) {
            start = new Date(`${startDate}T00:00:00.000Z`);

            if (isNaN(start.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid startDate."
                });
            }
        } else {
            // No start date supplied:
            // begin from earliest available history.
            start = earliestDate;
        }

        // END DATE
        if (endDate) {
            end = new Date(`${endDate}T23:59:59.999Z`);

            if (isNaN(end.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid endDate."
                });
            }
        } else {
            // No end date supplied:
            // continue through now.
            end = now;
        }

        // VALIDATE DATE ORDER
        if (start > end) {
            return res.status(400).json({
                success: false,
                message: "startDate cannot be after endDate."
            });
        }

        // FIND ALL MEDICATIONS FOR THIS PROFILE
        const medications = await MedicationModel.find({
            profile: profile_id
        });

        // GENERATE MISSING MEDICATION LOGS
        // One MedicationLog = one scheduled dose occurrence.
        //
        // Missing scheduled occurrences are created as pending.
        // Existing logs are not duplicated.
        //
        // This allows adherence to include:
        //
        // pending + taken + skipped
        //
        // even when the user did not manually create a log
        // for every scheduled dose.

        for (const medication of medications) {

            const medicationStart =
                new Date(medication.startDate);

            let medicationEnd = new Date(end);

            // Respect medication end date if one exists
            if (medication.endDate) {

                const medicationEndDate =
                    new Date(medication.endDate);

                medicationEndDate.setUTCHours(
                    23,
                    59,
                    59,
                    999
                );

                if (medicationEndDate < medicationEnd) {
                    medicationEnd = medicationEndDate;
                }
            }

            const generationStart = new Date(
                Math.max(
                    start.getTime(),
                    medicationStart.getTime()
                )
            );

            // Medication did not exist during this period
            if (generationStart > medicationEnd) {
                continue;
            }

            const occurrences =
                generateScheduledOccurrences(
                    medication,
                    generationStart,
                    medicationEnd
                );

            if (occurrences.length === 0) {
                continue;
            }

            // Find existing logs for these occurrences
            const existingLogs =
                await MedicationLogModel.find({
                    profile: profile_id,
                    medication: medication._id,
                    scheduledFor: {
                        $in: occurrences
                    }
                }).select("scheduledFor");

            const existingDates = new Set(
                existingLogs.map(log =>
                    new Date(log.scheduledFor).getTime()
                )
            );

            // Keep only occurrences without existing logs
            const missingOccurrences =
                occurrences.filter(
                    occurrence =>
                        !existingDates.has(
                            occurrence.getTime()
                        )
                );

            if (missingOccurrences.length > 0) {

                const newLogs =
                    missingOccurrences.map(
                        occurrence => ({
                            profile: profile_id,
                            medication: medication._id,
                            scheduledFor: occurrence,
                            status: "pending"
                        })
                    );

                await MedicationLogModel.insertMany(
                    newLogs
                );
            }
        }

        // CURRENT MEDICATIONS
        const currentMedications =
            await MedicationModel.find({
                profile: profile_id,
                status: "active",
                startDate: {
                    $lte: now
                },
                $or: [
                    {
                        endDate: null
                    },
                    {
                        endDate: {
                            $gte: now
                        }
                    }
                ]
            }).sort({
                startDate: 1
            });

        // FORMAT CURRENT MEDICATIONS
        const currentMedicationData =
            currentMedications.map(
                medication => ({
                    medicationId: medication._id,
                    name: medication.name,
                    dosage: medication.dosage,
                    frequency: medication.frequency,
                    scheduleTime: medication.scheduleTime,
                    startDate: medication.startDate,
                    endDate: medication.endDate
                })
            );
            
        // GET MEDICATION LOGS
        const medicationLogs =
            await MedicationLogModel.find({
                profile: profile_id,
                scheduledFor: {
                    $gte: start,
                    $lte: end
                }
            })
                .populate("medication")
                .sort({
                    scheduledFor: -1
                });

        // CALCULATE ADHERENCE
        // Total scheduled doses = pending + taken + skipped

        const totalScheduledDoses =
            medicationLogs.length;

        const takenDoses =
            medicationLogs.filter(
                log => log.status === "taken"
            ).length;

        const skippedDoses =
            medicationLogs.filter(
                log => log.status === "skipped"
            ).length;

        const pendingDoses =
            medicationLogs.filter(
                log => log.status === "pending"
            ).length;

        let adherenceRate = 0;

        if (totalScheduledDoses > 0) {
            adherenceRate =
                (takenDoses /
                    totalScheduledDoses) *
                100;
        }

        adherenceRate =
            Math.round(adherenceRate * 100) / 100;

        // GET SYMPTOMS
        const symptoms =
            await SymptomModel.find({
                profile: profile_id,
                loggedAt: {
                    $gte: start,
                    $lte: end
                }
            }).sort({
                loggedAt: -1
            });

        // FORMAT SYMPTOMS
        const symptomData =
            symptoms.map(symptom => {

                const symptomName =
                    symptom.symptoms &&
                    symptom.symptoms.length > 0
                        ? symptom.symptoms.join(", ")
                        : symptom.otherSymptom ||
                        "Unknown symptom";

                return {
                    symptomId: symptom._id,
                    date: symptom.loggedAt,
                    symptom: symptomName,
                    severity: symptom.severity,

                    checkIns:
                        (symptom.checkIns || []).map(
                            checkIn => ({
                                day: checkIn.day,
                                status: checkIn.status,
                                checkedInAt:
                                    checkIn.checkedInAt
                            })
                        )
                };
            });

        // RESPONSE
        return res.status(200).json({
            success: true,

            profile: {
                profile_id: profile._id,
                name: profile.name
            },

            dateRange: {
                startDate: start,
                endDate: end
            },

            currentMedications:
                currentMedicationData,

            adherence: {
                totalScheduledDoses,
                takenDoses,
                skippedDoses,
                pendingDoses,
                adherenceRate
            },

            symptoms: symptomData
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getConsultBrief
};