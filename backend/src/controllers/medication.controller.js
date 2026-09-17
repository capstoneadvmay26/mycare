const Medication = require("../models/medication.model");
const MedicationLog = require("../models/medicationLog.model");
const Profile = require("../models/profile.model");

const {
    createMedicationLogs,
    reconcileMedicationLogs,
    removeFuturePendingMedicationLogs,
} = require("../services/medicationLog.service");

const {
    scheduleMedicationReminderJobs,
    cancelMedicationReminderJobs,
} = require("../services/medicationReminderScheduler");


// Small shared helper — confirms the logged-in user actually owns the
// profile a medication is attached to. Used by every function below.
async function verifyProfileOwnership(profile_id, userId) {
    const profile = await Profile.findById(profile_id);

    if (!profile) {
        return {
            error: "Profile not found",
            status: 404,
        };
    }

    if (profile.owner.toString() !== userId) {
        return {
            error: "You don't have access to this profile.",
            status: 403,
        };
    }

    return { profile };
}


// CREATE - POST /api/v1/medications
async function addMedication(req, res, next) {
    try {
        const { profile_id } = req.body;

        const check = await verifyProfileOwnership(
            profile_id,
            req.user.id
        );

        if (check.error) {
            return res.status(check.status).json({
                success: false,
                message: check.error,
            });
        }

        const medication = await Medication.create({
            ...req.body,
            profile: profile_id,
        });

        const logs = await createMedicationLogs(
            medication,
            check.profile
        );

        /*
         * Only schedule reminders for future occurrences.
         *
         * If a medication is created after one of today's scheduled
         * times has already passed, we should not create a late reminder
         * for that occurrence.
         */
        const now = new Date();

        const futureLogs = logs.filter(
            (log) => log.scheduledFor > now
        );

        if (futureLogs.length > 0) {
            await scheduleMedicationReminderJobs(
                futureLogs
            );
        }

        // Keep the existing frontend response unchanged.
        return res.status(201).json({
            success: true,
            data: medication,
        });
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

        const check = await verifyProfileOwnership(
            profile_id,
            req.user.id
        );

        if (check.error) {
            return res.status(check.status).json({
                success: false,
                message: check.error,
            });
        }

        const medications = await Medication.find({
            profile: profile_id,
            status: "active",
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: medications,
        });
    } catch (error) {
        next(error);
    }
}


// READ ONE - GET /api/v1/medications/:id
async function getMedicationById(req, res, next) {
    try {
        const medication = await Medication.findById(
            req.params.id
        );

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: "Medication not found",
            });
        }

        const check = await verifyProfileOwnership(
            medication.profile,
            req.user.id
        );

        if (check.error) {
            return res.status(check.status).json({
                success: false,
                message: check.error,
            });
        }

        return res.status(200).json({
            success: true,
            data: medication,
        });
    } catch (error) {
        next(error);
    }
}


// UPDATE - PUT /api/v1/medications/:id
async function updateMedication(req, res, next) {
    try {
        const medication = await Medication.findById(
            req.params.id
        );

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: "Medication not found",
            });
        }

        const check = await verifyProfileOwnership(
            medication.profile,
            req.user.id
        );

        if (check.error) {
            return res.status(check.status).json({
                success: false,
                message: check.error,
            });
        }

        /*
         * These fields affect which MedicationLogs should exist.
         * Name and dosage do not affect scheduling.
         */
        const scheduleFields = [
            "frequency",
            "scheduleTime",
            "startDate",
            "endDate",
        ];

        const scheduleChanged = scheduleFields.some(
            (field) => req.body[field] !== undefined
        );

        /*
         * Capture the old future pending logs before changing
         * the medication so we can cancel their BullMQ jobs.
         */
        let oldFuturePendingLogs = [];

        if (scheduleChanged) {
            oldFuturePendingLogs =
                await MedicationLog.find({
                    medication: medication._id,
                    status: "pending",
                    scheduledFor: {
                        $gte: new Date(),
                    },
                });
        }

        Object.assign(medication, req.body);

        await medication.save();

        if (scheduleChanged) {
            /*
             * Cancel reminder jobs belonging to the old schedule.
             */
            if (oldFuturePendingLogs.length > 0) {
                await cancelMedicationReminderJobs(
                    oldFuturePendingLogs
                );
            }

            /*
             * Reconcile future pending logs using the new schedule.
             *
             * Historical taken/skipped logs remain untouched.
             */
            const updatedLogs =
                await reconcileMedicationLogs(
                    medication,
                    check.profile
                );

            /*
             * Schedule reminders for the new future occurrences.
             */
            const now = new Date();

            const futureLogs =
                updatedLogs.filter(
                    (log) => log.scheduledFor > now
                );

            if (futureLogs.length > 0) {
                await scheduleMedicationReminderJobs(
                    futureLogs
                );
            }
        }

        return res.status(200).json({
            success: true,
            data: medication,
        });
    } catch (error) {
        next(error);
    }
}


// ARCHIVE - DELETE /api/v1/medications/:id
async function archiveMedication(req, res, next) {
    try {
        const medication = await Medication.findById(
            req.params.id
        );

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: "Medication not found",
            });
        }

        const check = await verifyProfileOwnership(
            medication.profile,
            req.user.id
        );

        if (check.error) {
            return res.status(check.status).json({
                success: false,
                message: check.error,
            });
        }

        /*
         * Capture future pending logs before removing them so
         * their BullMQ reminder jobs can also be cancelled.
         */
        const futurePendingLogs =
            await MedicationLog.find({
                medication: medication._id,
                status: "pending",
                scheduledFor: {
                    $gte: new Date(),
                },
            });

        medication.status = "archived";

        await medication.save();

        /*
         * Cancel reminder jobs for future pending doses.
         */
        if (futurePendingLogs.length > 0) {
            await cancelMedicationReminderJobs(
                futurePendingLogs
            );
        }

        /*
         * Remove future pending logs.
         *
         * Historical taken/skipped logs remain untouched.
         */
        await removeFuturePendingMedicationLogs(
            medication._id
        );

        return res.status(200).json({
            success: true,
            message: "Medication archived",
        });
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
