const MedicationLogModel = require("../models/medicationLog.model");
const ProfileModel = require("../models/profile.model");
const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const getMedicationHistory = async (req, res, next) => {
    try {
        const {
            profile_id,
            period,
            status,
            medicationId,
            page = 1,
            limit = 10,
        } = req.query;

        // Validate period
        const allowedPeriods = [
            "week",
            "month",
            "2months",
        ];

        if (!allowedPeriods.includes(period)) {
            return res.status(400).json({
                message:
                    "Invalid period. Use week, month, or 2months.",
            });
        }

        // Validate status
        const allowedStatuses = [
            "pending",
            "taken",
            "skipped",
        ];

        if (
            status &&
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message:
                    "Invalid status. Use pending, taken, or skipped.",
            });
        }

        // Validate medicationId
        if (
            medicationId &&
            !mongoose.Types.ObjectId.isValid(
                medicationId
            )
        ) {
            return res.status(400).json({
                message: "Invalid medicationId.",
            });
        }

        // Validate pagination values
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1
        ) {
            return res.status(400).json({
                message:
                    "page must be a positive integer.",
            });
        }

        if (
            !Number.isInteger(limitNumber) ||
            limitNumber < 1
        ) {
            return res.status(400).json({
                message:
                    "limit must be a positive integer.",
            });
        }

        if (limitNumber > 50) {
            return res.status(400).json({
                message:
                    "limit cannot be greater than 50.",
            });
        }

        // Calculate documents to skip
        const skip =
            (pageNumber - 1) *
            limitNumber;

        // Find profile
        const profile =
            await ProfileModel.findById(
                profile_id
            );

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found.",
            });
        }

        // Check profile ownership
        if (
            profile.owner.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                message:
                    "You don't have access to this profile.",
            });
        }

        /*
         * Calculate the history date range using the
         * profile's timezone.
         *
         * This keeps the timezone-aware history behavior
         * we already implemented.
         */
        const todayInProfileTimezone =
            DateTime.now()
                .setZone(profile.timezone)
                .startOf("day");

        let historyStartDateTime;

        const historyEndDateTime =
            todayInProfileTimezone.endOf(
                "day"
            );

        if (period === "week") {
            historyStartDateTime =
                todayInProfileTimezone.minus({
                    days: 6,
                });
        }

        if (period === "month") {
            historyStartDateTime =
                todayInProfileTimezone.minus({
                    days: 29,
                });
        }

        if (period === "2months") {
            historyStartDateTime =
                todayInProfileTimezone.minus({
                    days: 59,
                });
        }

        const historyStartDate =
            historyStartDateTime.toJSDate();

        const historyEndDate =
            historyEndDateTime.toJSDate();

        /*
         * IMPORTANT:
         *
         * This endpoint is now read-only.
         *
         * It does NOT generate missing MedicationLogs.
         * MedicationLogs are created by the medication
         * create/update lifecycle.
         */

        // Build history query
        const query = {
            profile: profile_id,
            scheduledFor: {
                $gte: historyStartDate,
                $lte: historyEndDate,
            },
        };

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by medication
        if (medicationId) {
            query.medication = medicationId;
        }

        // Count matching logs
        const totalLogs =
            await MedicationLogModel.countDocuments(
                query
            );

        // Get paginated logs
        const medicationLogs =
            await MedicationLogModel.find(query)
                .populate("medication")
                .sort({
                    scheduledFor: -1,
                })
                .skip(skip)
                .limit(limitNumber);

        // Calculate total pages
        const totalPages = Math.ceil(
            totalLogs / limitNumber
        );

        // Return history
        return res.status(200).json({
            success: true,
            period,
            startDate: historyStartDate,
            endDate: historyEndDate,

            filters: {
                status: status || "all",
                medicationId:
                    medicationId || "all",
            },

            history: medicationLogs,

            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalLogs,
                limit: limitNumber,
            },
        });
    } catch (error) {
        next(error);
    }
};


const markDoseAsTaken = async (
    req,
    res,
    next
) => {
    try {
        const medicationLog =
            await MedicationLogModel.findById(
                req.params.id
            );

        if (!medicationLog) {
            return res.status(404).json({
                message:
                    "Medication Log not found",
            });
        }

        // Find the profile attached to this medication log
        const profile =
            await ProfileModel.findById(
                medicationLog.profile
            );

        if (!profile) {
            return res.status(404).json({
                message:
                    "Profile not found.",
            });
        }

        // Check that the logged-in user owns the profile
        if (
            profile.owner.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                message:
                    "You don't have access to this medication log.",
            });
        }

        // A dose can only be marked as taken while pending
        if (
            medicationLog.status !== "pending"
        ) {
            return res.status(400).json({
                message:
                    `Medication dose is already ${medicationLog.status}.`,
            });
        }

        // A dose can only be taken within 30 minutes
        // after its scheduled time.
        const now = new Date();

        // A dose cannot be marked as taken before its scheduled time
        if (
            now < medicationLog.scheduledFor
        ) {
            return res.status(400).json({
                message:
                    "This medication dose is not due yet.",
            });
        }

        const thirtyMinutesAfterDose =
            new Date(
                medicationLog.scheduledFor.getTime() +
                    30 * 60 * 1000
            );

        if (
            now >= thirtyMinutesAfterDose
        ) {
            return res.status(400).json({
                message:
                    "The medication dose window has expired. This dose can no longer be marked as taken.",
            });
        }

        // Mark the dose as taken
        medicationLog.status = "taken";
        medicationLog.takenAt = now;
        medicationLog.skippedAt = null;

        await medicationLog.save();

        return res.status(200).json({
            message:
                "Medication marked as taken",
            medicationLog,
        });
    } catch (error) {
        next(error);
    }
};


const markDoseAsSkipped = async (
    req,
    res,
    next
) => {
    try {
        const medicationLog =
            await MedicationLogModel.findById(
                req.params.id
            );

        if (!medicationLog) {
            return res.status(404).json({
                message:
                    "Medication Log not found",
            });
        }

        // Find the profile attached to this medication log
        const profile =
            await ProfileModel.findById(
                medicationLog.profile
            );

        if (!profile) {
            return res.status(404).json({
                message:
                    "Profile not found.",
            });
        }

        // Check that the logged-in user owns the profile
        if (
            profile.owner.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                message:
                    "You don't have access to this medication log.",
            });
        }

        // A dose can only be marked as skipped while pending
        if (
            medicationLog.status !== "pending"
        ) {
            return res.status(400).json({
                message:
                    `Medication dose is already ${medicationLog.status}.`,
            });
        }

        medicationLog.status = "skipped";
        medicationLog.skippedAt =
            new Date();
        medicationLog.takenAt = null;

        await medicationLog.save();

        return res.status(200).json({
            message:
                "Medication marked as skipped",
            medicationLog,
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    markDoseAsTaken,
    markDoseAsSkipped,
    getMedicationHistory,
};
