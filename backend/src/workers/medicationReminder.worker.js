require("dotenv").config();

const { Worker } = require("bullmq");
const redis = require("../config/redis");

const MedicationLog = require("../models/medicationLog.model");
const Profile = require("../models/profile.model");
const Medication = require("../models/medication.model");
const NotificationSettings = require("../models/notificationSettings.model");

const {
    sendPushNotification,
} = require("../services/pushNotification.service");

const THIRTY_MINUTES = 30 * 60 * 1000;


/**
 * Checks whether the current time is inside the user's quiet hours.
 *
 * Quiet hours only affect notification delivery.
 * They do NOT affect automatic dose skipping.
 */
function isWithinQuietHours(
    now,
    timezone,
    quietHours
) {
    if (!quietHours?.enabled) {
        return false;
    }

    const parts = new Intl.DateTimeFormat(
        "en-GB",
        {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        }
    ).formatToParts(now);

    const hour = Number(
        parts.find(
            (part) => part.type === "hour"
        )?.value
    );

    const minute = Number(
        parts.find(
            (part) => part.type === "minute"
        )?.value
    );

    const currentMinutes =
        hour * 60 + minute;

    const [startHour, startMinute] =
        quietHours.start
            .split(":")
            .map(Number);

    const [endHour, endMinute] =
        quietHours.end
            .split(":")
            .map(Number);

    const startMinutes =
        startHour * 60 + startMinute;

    const endMinutes =
        endHour * 60 + endMinute;

    /*
     * Same start/end means quiet hours are effectively
     * active all day.
     */
    if (startMinutes === endMinutes) {
        return true;
    }

    /*
     * Normal same-day quiet period.
     * Example: 13:00 → 15:00
     */
    if (startMinutes < endMinutes) {
        return (
            currentMinutes >= startMinutes &&
            currentMinutes < endMinutes
        );
    }

    /*
     * Overnight quiet period.
     * Example: 22:00 → 07:00
     */
    return (
        currentMinutes >= startMinutes ||
        currentMinutes < endMinutes
    );
}


/**
 * Gets the user's notification settings.
 *
 * If settings do not exist yet, use the model defaults in memory.
 */
async function getUserNotificationSettings(userId) {
    const settings =
        await NotificationSettings.findOne({
            user: userId,
        }).lean();

    if (settings) {
        return settings;
    }

    return {
        pushEnabled: true,
        quietHours: {
            enabled: true,
            start: "22:00",
            end: "07:00",
        },
    };
}


/**
 * Builds the common notification data payload.
 */
function buildNotificationData({
    log,
    profile,
    medication,
    type,
}) {
    return {
        type: "medication-reminder",

        reminderType: type,

        doseId: log._id.toString(),

        profileId: profile._id.toString(),

        medicationId:
            medication._id.toString(),

        scheduledFor:
            log.scheduledFor.toISOString(),
    };
}


/**
 * Sends a medication reminder notification.
 */
async function handleReminderJob(
    job,
    medicationLog
) {
    /*
     * A reminder is only valid while the dose is pending.
     */
    if (medicationLog.status !== "pending") {
        return {
            success: true,
            action: "ignored",
            reason:
                `Dose is already ${medicationLog.status}.`,
        };
    }

    const profile =
        await Profile.findById(
            medicationLog.profile
        );

    if (!profile) {
        return {
            success: true,
            action: "ignored",
            reason: "Profile not found.",
        };
    }

    const medication =
        await Medication.findById(
            medicationLog.medication
        );

    if (!medication) {
        return {
            success: true,
            action: "ignored",
            reason: "Medication not found.",
        };
    }

    /*
     * Archived medications must not send reminders.
     */
    if (medication.status !== "active") {
        return {
            success: true,
            action: "ignored",
            reason: "Medication is archived.",
        };
    }

    const settings =
        await getUserNotificationSettings(
            profile.owner
        );

    /*
     * Push notifications disabled.
     */
    if (!settings.pushEnabled) {
        return {
            success: true,
            action: "ignored",
            reason:
                "Push notifications are disabled.",
        };
    }

    const now = new Date(Date.now());

    /*
     * Quiet hours affect notification delivery only.
     */
    if (
        isWithinQuietHours(
            now,
            profile.timezone || "UTC",
            settings.quietHours
        )
    ) {
        return {
            success: true,
            action: "ignored",
            reason:
                "Notification is inside quiet hours.",
        };
    }

    const localTime =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone:
                    profile.timezone || "UTC",
                hour: "numeric",
                minute: "2-digit",
            }
        ).format(
            medicationLog.scheduledFor
        );

    let title;
    let body;

    if (job.name === "reminder_30") {
        title =
            `Time for ${medication.name} soon`;

        body =
            `${medication.dosage} · due in 30 minutes at ${localTime}`;
    } else {
        title =
            `Time for ${medication.name}`;

        if (job.data.recovery) {
            body =
                `${medication.dosage} · this dose was due at ${localTime}`;
        } else {
            body =
                `${medication.dosage} · it is time to take your medication`;
        }
    }

    const payload = {
        notification: {
            title,
            body,
        },

        data: buildNotificationData({
            log: medicationLog,
            profile,
            medication,
            type: job.name,
        }),
    };

    await sendPushNotification({
        userId: profile.owner,
        payload,
    });

    /*
     * Keep track of reminder delivery state.
     */
    if (job.name === "reminder_30") {
        medicationLog.reminder30MinSent = true;
    }

    if (job.name === "reminder_due") {
        medicationLog.dueReminderSent = true;
    }

    await medicationLog.save();

    return {
        success: true,
        action: "notification_sent",
    };
}


/**
 * Automatically skips a dose if it is still pending after
 * the 30-minute dose window.
 */
async function handleAutoSkipJob(
    medicationLog
) {
    /*
     * Always re-check the current database state.
     */
    if (medicationLog.status !== "pending") {
        return {
            success: true,
            action: "ignored",
            reason:
                `Dose is already ${medicationLog.status}.`,
        };
    }

    const scheduledFor =
        medicationLog.scheduledFor.getTime();

    const autoSkipAt =
        scheduledFor + THIRTY_MINUTES;

    const now = Date.now();

    /*
     * If the worker runs early for any reason,
     * don't skip yet.
     */
    if (now < autoSkipAt) {
        return {
            success: true,
            action: "not_ready",
        };
    }

    medicationLog.status = "skipped";
    medicationLog.skippedAt = new Date();
    medicationLog.takenAt = null;
    medicationLog.skipReason =
        "Dose was not marked as taken within 30 minutes of the scheduled time.";

    await medicationLog.save();

    return {
        success: true,
        action: "auto_skipped",
    };
}


/**
 * Processes one BullMQ medication reminder job.
 *
 * Exported separately so the business logic can be tested
 * without creating a real BullMQ worker.
 */
async function processMedicationReminderJob(job) {
    const medicationLog =
        await MedicationLog.findById(
            job.data.medicationLogId
        );

    if (!medicationLog) {
        return {
            success: true,
            action: "ignored",
            reason:
                "Medication log not found.",
        };
    }

    if (
        job.name === "reminder_30" ||
        job.name === "reminder_due"
    ) {
        return handleReminderJob(
            job,
            medicationLog
        );
    }

    if (job.name === "auto_skip") {
        return handleAutoSkipJob(
            medicationLog
        );
    }

    return {
        success: true,
        action: "ignored",
        reason:
            `Unknown job type: ${job.name}`,
    };
}


/**
 * Creates the BullMQ worker.
 *
 * Start with:
 * node src/workers/medicationReminder.worker.js
 */
function createMedicationReminderWorker() {
    const worker = new Worker(
        "medication-reminders",
        async (job) => {
            console.log("Job received:", {
                id: job.id,
                name: job.name,
                data: job.data,
            });

            return processMedicationReminderJob(
                job
            );
        },
        {
            connection: redis,
        }
    );

    worker.on("completed", (job) => {
        console.log(
            `Job ${job.id} completed.`
        );
    });

    worker.on("failed", (job, error) => {
        console.error(
            `Job ${job?.id} failed:`,
            error.message
        );
    });

    worker.on("error", (error) => {
        console.error(
            "Worker error:",
            error.message
        );
    });

    console.log(
        "Medication reminder worker started."
    );

    return worker;
}


// Start the worker only when this file is executed directly.
if (require.main === module) {
    createMedicationReminderWorker();
}


module.exports = {
    processMedicationReminderJob,
    createMedicationReminderWorker,
    isWithinQuietHours,
};
