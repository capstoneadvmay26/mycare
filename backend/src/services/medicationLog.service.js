const MedicationLog = require("../models/medicationLog.model");
const generateScheduledOccurrences = require("../utils/medicationLogGenerator");
const { DateTime } = require("luxon");

const ONGOING_MEDICATION_DAYS = 30;

/**
 * Converts a JavaScript Date into a date-only UTC value.
 *
 * Medication startDate/endDate are treated as calendar dates.
 */
function toCalendarDate(date) {
    return new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        )
    );
}

/**
 * Creates the MedicationLog records that should exist for a medication.
 *
 * Finite medication:
 *   medication startDate → medication endDate
 *
 * Ongoing medication:
 *   today → next 30 calendar days
 *
 * Existing logs are preserved.
 */
async function createMedicationLogs(medication, profile) {
    const timezone = profile.timezone || "UTC";

    const timezoneCheck = DateTime.now().setZone(timezone);

    if (!timezoneCheck.isValid) {
        throw new Error(
            `Invalid profile timezone: ${timezone}`
        );
    }

    let generationStartDate;
    let generationEndDate;

    if (medication.endDate) {
        generationStartDate = toCalendarDate(
            new Date(medication.startDate)
        );

        generationEndDate = toCalendarDate(
            new Date(medication.endDate)
        );
    } else {
        const today = DateTime.now()
            .setZone(timezone)
            .startOf("day");

        const todayCalendarDate = new Date(
            Date.UTC(
                today.year,
                today.month - 1,
                today.day
            )
        );

        const medicationStartDate = toCalendarDate(
            new Date(medication.startDate)
        );

        generationStartDate =
            medicationStartDate > todayCalendarDate
                ? medicationStartDate
                : todayCalendarDate;

        const endDate = today.plus({
            days: ONGOING_MEDICATION_DAYS - 1,
        });

        generationEndDate = new Date(
            Date.UTC(
                endDate.year,
                endDate.month - 1,
                endDate.day
            )
        );
    }

    if (generationStartDate > generationEndDate) {
        return [];
    }

    const occurrences = generateScheduledOccurrences(
        medication,
        generationStartDate,
        generationEndDate,
        timezone
    );

    if (occurrences.length === 0) {
        return [];
    }

    const operations = occurrences.map((scheduledFor) => ({
        updateOne: {
            filter: {
                medication: medication._id,
                scheduledFor,
            },
            update: {
                $setOnInsert: {
                    profile: medication.profile,
                    medication: medication._id,
                    scheduledFor,
                    status: "pending",
                },
            },
            upsert: true,
        },
    }));

    await MedicationLog.bulkWrite(operations, {
        ordered: false,
    });

    const logs = await MedicationLog.find({
        profile: medication.profile,
        medication: medication._id,
        scheduledFor: {
            $in: occurrences,
        },
    }).sort({ scheduledFor: 1 });

    return logs;
}


/**
 * Reconciles logs after a schedule-affecting medication update.
 *
 * Only future pending logs are removed.
 *
 * Taken and skipped logs are never deleted or modified because they
 * represent medication history that has already been recorded.
 */
async function reconcileMedicationLogs(medication, profile) {
    await MedicationLog.deleteMany({
        medication: medication._id,
        status: "pending",
        scheduledFor: {
            $gte: new Date(),
        },
    });

    return createMedicationLogs(
        medication,
        profile
    );
}


/**
 * Removes future pending logs when a medication is archived.
 *
 * Taken and skipped logs are preserved as part of the user's
 * medication history.
 */
async function removeFuturePendingMedicationLogs(medicationId) {
    await MedicationLog.deleteMany({
        medication: medicationId,
        status: "pending",
        scheduledFor: {
            $gte: new Date(),
        },
    });
}


module.exports = {
    createMedicationLogs,
    reconcileMedicationLogs,
    removeFuturePendingMedicationLogs,
};