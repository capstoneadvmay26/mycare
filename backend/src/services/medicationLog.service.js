const MedicationLog = require("../models/medicationLog.model");
const generateScheduledOccurrences = require("../utils/medicationLogGenerator");
const { DateTime } = require("luxon");

const ONGOING_MEDICATION_DAYS = 7;

/**
 * Converts a JavaScript Date into a UTC calendar date.
 *
 * This is used only for calendar-date calculations.
 * The actual medication occurrence is later generated
 * in the profile's timezone.
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
 * Creates medication logs for the current scheduling window.
 *
 * For medications without an endDate, we only generate seven calendar days at a time
 *
 * The medication's profile timezone determines what the scheduleTime means.
 */
async function createMedicationLogs(medication, profile) {
    const timezone = profile.timezone || "UTC";
    const timezoneCheck = DateTime.now().setZone(timezone);

    if (!timezoneCheck.isValid) {
        throw new Error(`Invalid profile timezone: ${timezone}`);
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

        // Get today's calendar date in the user's timezone.
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

        // Do not generate logs before the medication starts.
        generationStartDate =
            medicationStartDate > todayCalendarDate
                ? medicationStartDate
                : todayCalendarDate;

        // Seven-day scheduling window. Today + 6 additional days = 7 calendar days.
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

    const operations = occurrences.map(
        (scheduledFor) => ({
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
        })
    );

    /*
     * Run the bulk operation and keep the result.
     *
     * MongoDB tells us which operations actually
     * inserted new MedicationLogs through upsert.
     */
    const bulkResult = await MedicationLog.bulkWrite(
        operations,
        {
            ordered: false,
        }
    );

    /*
     * Only these operations created new
     * MedicationLog documents.
     *
     * Existing logs are deliberately excluded.
     */
    const upsertedIds = Object.values(
        bulkResult.upsertedIds || {}
    );

    if (upsertedIds.length === 0) {
        return [];
    }

    /*
     * Fetch only the MedicationLogs that were
     * newly inserted by this bulk operation.
     *
     * These are the only logs that need new
     * BullMQ reminder jobs.
     */
    const newLogs = await MedicationLog.find({
        _id: {
            $in: upsertedIds,
        },
    }).sort({
        scheduledFor: 1,
    });

    return newLogs;
}

// Rebuilds future pending logs when a medication's schedule changes.
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

// Removes future pending logs when a medication is archived.
async function removeFuturePendingMedicationLogs(
    medicationId
) {
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