const medicationReminderQueue = require("../queues/medicationReminder.queue");

const THIRTY_MINUTES = 30 * 60 * 1000;

/**
 * Builds stable BullMQ job IDs for a medication log.
 */
function buildJobId(logId, jobType) {
    return `${logId}-reminder_${jobType}`;
}

/**
 * Builds the common data shared by all reminder jobs.
 */
function buildJobData(log, scheduledFor, type, recovery = false) {
    return {
        medicationLogId: log._id.toString(),

        medicationId: log.medication?.toString
            ? log.medication.toString()
            : log.medication,

        profileId: log.profile?.toString
            ? log.profile.toString()
            : log.profile,

        scheduledFor: new Date(
            scheduledFor
        ).toISOString(),

        type,
        recovery,
    };
}

/**
 * Schedules reminder/auto-skip jobs for medication logs.
 *
 * For each scheduled dose:
 *
 * 30 minutes before:
 *   reminder_30
 *
 * At scheduled time:
 *   reminder_due
 *
 * 30 minutes after:
 *   auto_skip
 *
 * Recovery behavior:
 *
 * If the worker/backend comes back late but before the scheduled time:
 *   - send the missed 30-minute reminder immediately
 *   - keep the normal due reminder
 *   - keep the normal auto-skip
 *
 * If the worker/backend comes back after the scheduled time but
 * before the auto-skip time:
 *   - send the due reminder immediately
 *   - mark it as a recovery reminder
 *   - keep the normal auto-skip
 *
 * If the worker/backend comes back after the auto-skip time:
 *   - schedule auto-skip immediately
 *   - the worker will re-check the MedicationLog and skip it only
 *     if it is still pending
 */
async function scheduleMedicationReminderJobs(
    medicationLogs
) {
    if (!Array.isArray(medicationLogs)) {
        throw new Error("medicationLogs must be an array.");
    }

    const now = Date.now();
    const jobs = [];

    for (const log of medicationLogs) {
        if (!log?._id || !log?.scheduledFor) {
            continue;
        }

        const scheduledFor = new Date(
            log.scheduledFor
        ).getTime();

        if (!Number.isFinite(scheduledFor)) {
            continue;
        }

        const logId = log._id.toString();

        const reminder30At =
            scheduledFor - THIRTY_MINUTES;

        const autoSkipAt =
            scheduledFor + THIRTY_MINUTES;

        /*
         * CASE 1:
         * We are before the 30-minute reminder time.
         *
         * Normal scheduling:
         *
         * reminder30 → delayed
         * due         → delayed
         * auto-skip   → delayed
         */
        if (now < reminder30At) {
            jobs.push({
                name: "reminder_30",

                data: buildJobData(
                    log,
                    scheduledFor,
                    "reminder_30",
                    false
                ),

                opts: {
                    jobId: buildJobId(
                        logId,
                        "30"
                    ),

                    delay: reminder30At - now,

                    removeOnComplete: true,
                },
            });

            jobs.push({
                name: "reminder_due",

                data: buildJobData(
                    log,
                    scheduledFor,
                    "reminder_due",
                    false
                ),

                opts: {
                    jobId: buildJobId(
                        logId,
                        "due"
                    ),

                    delay: scheduledFor - now,

                    removeOnComplete: true,
                },
            });

            jobs.push({
                name: "auto_skip",

                data: buildJobData(
                    log,
                    scheduledFor,
                    "auto_skip",
                    false
                ),

                opts: {
                    jobId: buildJobId(
                        logId,
                        "skip"
                    ),

                    delay: autoSkipAt - now,

                    removeOnComplete: true,
                },
            });

            continue;
        }

        /*
         * CASE 2:
         * The 30-minute reminder time has passed,
         * but the scheduled time has not arrived yet.
         *
         * Example:
         * Dose = 8:00
         * Worker comes back at any time between 7:30 and 7:59...
         *
         * We send the missed 30-minute reminder immediately.
         *
         * The due reminder and auto-skip remain normally delayed.
         */
        if (
            now >= reminder30At &&
            now < scheduledFor
        ) {
            jobs.push({
                name: "reminder_30",

                data: buildJobData(
                    log,
                    scheduledFor,
                    "reminder_30",
                    true
                ),

                opts: {
                    jobId: buildJobId(
                        logId,
                        "30"
                    ),

                    delay: 0,

                    removeOnComplete: true,
                },
            });

            jobs.push({
                name: "reminder_due",

                data: buildJobData(
                    log,
                    scheduledFor,
                    "reminder_due",
                    false
                ),

                opts: {
                    jobId: buildJobId(
                        logId,
                        "due"
                    ),

                    delay: scheduledFor - now,

                    removeOnComplete: true,
                },
            });

            jobs.push({
                name: "auto_skip",

                data: buildJobData(
                    log,
                    scheduledFor,
                    "auto_skip",
                    false
                ),

                opts: {
                    jobId: buildJobId(
                        logId,
                        "skip"
                    ),

                    delay: autoSkipAt - now,

                    removeOnComplete: true,
                },
            });

            continue;
        }

        /*
         * CASE 3:
         * The scheduled time has passed, but the 30-minute
         * window has not expired.
         *
         * We do not send the old 30-minute reminder.
         *
         * Instead, send the due reminder immediately and mark
         * it as a recovery reminder.
         *
         * Auto-skip remains normally delayed.
         */
        if (
            now >= scheduledFor &&
            now < autoSkipAt
        ) {
            jobs.push({
                name: "reminder_due",

                data: buildJobData(
                    log,
                    scheduledFor,
                    "reminder_due",
                    true
                ),

                opts: {
                    jobId: buildJobId(
                        logId,
                        "due"
                    ),

                    delay: 0,

                    removeOnComplete: true,
                },
            });

            jobs.push({
                name: "auto_skip",

                data: buildJobData(
                    log,
                    scheduledFor,
                    "auto_skip",
                    false
                ),

                opts: {
                    jobId: buildJobId(
                        logId,
                        "skip"
                    ),

                    delay: autoSkipAt - now,

                    removeOnComplete: true,
                },
            });

            continue;
        }

        /*
         * CASE 4:
         * The dose's 30-minute window has already expired.
         *
         * The worker can no longer send either reminder.
         *
         * We still schedule auto-skip immediately so the worker
         * can re-check the current MedicationLog and mark it
         * skipped if it is still pending.
         */
        if (now >= autoSkipAt) {
            jobs.push({
                name: "auto_skip",

                data: buildJobData(
                    log,
                    scheduledFor,
                    "auto_skip",
                    true
                ),

                opts: {
                    jobId: buildJobId(
                        logId,
                        "skip"
                    ),

                    delay: 0,

                    removeOnComplete: true,
                },
            });
        }
    }

    if (jobs.length === 0) {
        return [];
    }

    return medicationReminderQueue.addBulk(jobs);
}


/**
 * Cancels all reminder jobs belonging to the supplied logs.
 *
 * Used when:
 * - medication schedule changes
 * - medication is archived
 */
async function cancelMedicationReminderJobs(
    medicationLogs
) {
    if (!Array.isArray(medicationLogs)) {
        throw new Error("medicationLogs must be an array.");
    }

    const removedJobs = [];

    for (const log of medicationLogs) {
        if (!log?._id) {
            continue;
        }

        const logId = log._id.toString();

        const jobTypes = [
            "30",
            "due",
            "skip",
        ];

        for (const jobType of jobTypes) {
            const jobId = buildJobId(
                logId,
                jobType
            );

            const job =
                await medicationReminderQueue.getJob(
                    jobId
                );

            if (job) {
                await job.remove();
                removedJobs.push(jobId);
            }
        }
    }

    return removedJobs;
}


module.exports = {
    scheduleMedicationReminderJobs,
    cancelMedicationReminderJobs,
    buildJobId,
};
