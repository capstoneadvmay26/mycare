const MedicationLogModel = require('../models/medicationLog.model');
const MedicationModel = require('../models/medication.model');
const ProfileModel = require('../models/profile.model');
const generateScheduledOccurrences = require('../utils/medicationLogGenerator');
const mongoose = require('mongoose');


const getMedicationHistory = async (req, res, next) => {
    try {
        const { profileId } = req.params;

        const {
            period,
            status,
            medicationId,
            page = 1,
            limit = 10
        } = req.query;

        // Validate period
        const allowedPeriods = ["week", "month", "2months"];

        if (!allowedPeriods.includes(period)) {
            return res.status(400).json({
                message: "Invalid period. Use week, month, or 2months."
            });
        }

        // Validate status
        const allowedStatuses = ["pending", "taken", "skipped"];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Use pending, taken, or skipped."
            });
        }

        // Validate medicationId
        if (
            medicationId &&
            !mongoose.Types.ObjectId.isValid(medicationId)
        ) {
            return res.status(400).json({
                message: "Invalid medicationId."
            });
        }

        // Validate pagination values
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({
                message: "page must be a positive integer."
            });
        }

        if (!Number.isInteger(limitNumber) || limitNumber < 1) {
            return res.status(400).json({
                message: "limit must be a positive integer."
            });
        }

        if (limitNumber > 50) {
            return res.status(400).json({
                message: "limit cannot be greater than 50."
            });
        }

        // Calculate documents to skip
        const skip = (pageNumber - 1) * limitNumber;

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

        // Calculate date range
        const today = new Date();

        let historyStartDate;
        const historyEndDate = new Date(today);

        if (period === "week") {
            historyStartDate = new Date(today);
            historyStartDate.setDate(today.getDate() - 6);
        }

        if (period === "month") {
            historyStartDate = new Date(today);
            historyStartDate.setDate(today.getDate() - 29);
        }

        if (period === "2months") {
            historyStartDate = new Date(today);
            historyStartDate.setDate(today.getDate() - 59);
        }

        // Find active medications
        const medications = await MedicationModel.find({
            profile: profileId,
            status: "active"
        });

        // Generate missing logs
        for (const medication of medications) {

            // Determine generation start
            const generationStartDate = new Date(
                Math.max(
                    historyStartDate.getTime(),
                    medication.startDate.getTime()
                )
            );

            // Determine generation end
            let generationEndDate = new Date(historyEndDate);

            if (
                medication.endDate &&
                medication.endDate < generationEndDate
            ) {
                generationEndDate = new Date(medication.endDate);
            }

            // Skip invalid date range
            if (generationStartDate > generationEndDate) {
                continue;
            }

            // Generate scheduled occurrences
            const occurrences = generateScheduledOccurrences(
                medication,
                generationStartDate,
                generationEndDate
            );

            // Find existing logs
            const existingLogs = await MedicationLogModel.find({
                profile: profileId,
                medication: medication._id,
                scheduledFor: {
                    $in: occurrences
                }
            });

            // Store existing dates
            const existingScheduledDates = new Set(
                existingLogs.map(log => log.scheduledFor.getTime())
            );

            // Find missing occurrences
            const missingOccurrences = occurrences.filter(
                occurrence =>
                    !existingScheduledDates.has(
                        occurrence.getTime()
                    )
            );

            // Create pending logs
            const newLogs = missingOccurrences.map(occurrence => ({
                profile: profileId,
                medication: medication._id,
                scheduledFor: occurrence,
                status: "pending"
            }));

            if (newLogs.length > 0) {
                await MedicationLogModel.insertMany(newLogs);
            }
        }

        // Build history query
        const query = {
            profile: profileId,
            scheduledFor: {
                $gte: historyStartDate,
                $lte: historyEndDate
            }
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
        const totalLogs = await MedicationLogModel.countDocuments(query);

        // Get paginated logs
        const medicationLogs = await MedicationLogModel.find(query)
            .populate("medication")
            .sort({ scheduledFor: -1 })
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
                medicationId: medicationId || "all"
            },

            history: medicationLogs,

             pagination: {
                currentPage: pageNumber,
                totalPages,
                totalLogs,
                limit: limitNumber
            }
        });

    } catch (error) {
        next(error);
    }
};


const markDoseAsTaken = async (req, res, next) => {
    try {
        const medicationLog = await MedicationLogModel.findById(
            req.params.id
        );

        if (!medicationLog) {
            return res.status(404).json({
                message: "Medication Log not found"
            });
        }

        // Find the profile attached to this medication log
        const profile = await ProfileModel.findById(
            medicationLog.profile
        );

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found."
            });
        }

        // Check that the logged-in user owns the profile
        if (profile.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message:
                    "You don't have access to this medication log."
            });
        }

        // Only the owner can mark the dose as taken
        medicationLog.status = "taken";
        medicationLog.takenAt = new Date();
        medicationLog.skippedAt = null;

        await medicationLog.save();

        return res.status(200).json({
            message: "Medication marked as taken",
            medicationLog
        });

    } catch (error) {
        next(error);
    }
};


const markDoseAsSkipped = async (req, res, next) => {
    try {
        const medicationLog = await MedicationLogModel.findById(
            req.params.id
        );

        if (!medicationLog) {
            return res.status(404).json({
                message: "Medication Log not found"
            });
        }

        // Find the profile attached to this medication log
        const profile = await ProfileModel.findById(
            medicationLog.profile
        );

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found."
            });
        }

        // Check that the logged-in user owns the profile
        if (profile.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message:
                    "You don't have access to this medication log."
            });
        }

        // Only the owner can mark the dose as skipped
        medicationLog.status = "skipped";
        medicationLog.skippedAt = new Date();
        medicationLog.takenAt = null;

        await medicationLog.save();

        return res.status(200).json({
            message: "Medication marked as skipped",
            medicationLog
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    markDoseAsTaken,
    markDoseAsSkipped,
    getMedicationHistory
};