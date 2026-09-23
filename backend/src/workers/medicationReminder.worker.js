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

    if (startMinutes === endMinutes) {
        return true;
    }

    if (startMinutes < endMinutes) {
        return (
            currentMinutes >= startMinutes &&
            currentMinutes < endMinutes
        );
    }

    return (
        currentMinutes >= startMinutes ||
        currentMinutes < endMinutes
    );
}

async function getUserNotificationSettings(
    userId
) {
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

async function handleReminderJob(
    job,
    medicationLog
) {
    /*
     * If the user has already taken or skipped the dose,
     * no reminder should be sent.
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
     * Archived medications should not generate reminders.
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

    if (!settings.pushEnabled) {
        return {
            success: true,
            action: "ignored",
            reason:
                "Push notifications are disabled.",
        };
    }

    const now = new Date();

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
     * Record which reminder has already been sent.
     *
     * These flags are also used by the scheduler during
     * recovery so the same reminder is not recreated.
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

async function handleAutoSkipJob(
    medicationLog
) {
    /*
     * Do nothing if the user already acted on the dose.
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
     * This protects against a job being executed before
     * its intended +30 minute time.
     */
    if (now < autoSkipAt) {
        return {
            success: true,
            action: "not_ready",
        };
    }

    medicationLog.status = "skipped";

    medicationLog.skippedAt =
        new Date();

    medicationLog.takenAt = null;
    medicationLog.skipReason =
        "Dose was not marked as taken within 30 minutes of the scheduled time.";

    await medicationLog.save();

    return {
        success: true,
        action: "auto_skipped",
    };
}

async function processMedicationReminderJob(
    job
) {
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

function createMedicationReminderWorker() {
    const worker = new Worker(
        "medication-reminders",
        async (job) => {
            console.log(
                "Job received:",
                {
                    id: job.id,
                    name: job.name,
                    data: job.data,
                }
            );

            return processMedicationReminderJob(
                job
            );
        },
        {
            connection: redis,
        }
    );

    worker.on(
        "completed",
        (job) => {
            console.log(
                `Job ${job.id} completed.`
            );
        }
    );

    worker.on(
        "failed",
        (job, error) => {
            console.error(
                `Job ${job?.id} failed:`,
                error.message
            );
        }
    );

    worker.on(
        "error",
        (error) => {
            console.error(
                "Worker error:",
                error.message
            );
        }
    );

    console.log(
        "Medication reminder worker started."
    );

    return worker;
}

if (require.main === module) {
    createMedicationReminderWorker();
}

module.exports = {
    processMedicationReminderJob,
    createMedicationReminderWorker,
    isWithinQuietHours,
};