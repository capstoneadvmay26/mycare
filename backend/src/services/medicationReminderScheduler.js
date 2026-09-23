const medicationReminderQueue = require("../queues/medicationReminder.queue");

const THIRTY_MINUTES = 30 * 60 * 1000;

function buildJobId(logId, jobType) {
    return `${logId}-reminder_${jobType}`;
}

function buildJobData(log, scheduledFor, type, recovery = false) {
    return {
        medicationLogId: log._id.toString(),
        medicationId: log.medication?.toString
            ? log.medication.toString()
            : log.medication,
        profileId: log.profile?.toString
            ? log.profile.toString()
            : log.profile,
        scheduledFor: new Date(scheduledFor).toISOString(),
        type,
        recovery,
    };
}

// Schedules medication reminder jobs.
// Reminder flags stored on MedicationLog prevent already-sent notifications
// from being scheduled again during recovery.
async function scheduleMedicationReminderJobs(medicationLogs) {
    if (!Array.isArray(medicationLogs)) {
        throw new Error("medicationLogs must be an array.");
    }

    const now = Date.now();
    const jobs = [];

    for (const log of medicationLogs) {
        if (!log?._id || !log?.scheduledFor) {
            continue;
        }

        const scheduledFor = new Date(log.scheduledFor).getTime();

        if (!Number.isFinite(scheduledFor)) {
            continue;
        }

        const logId = log._id.toString();
        const reminder30At = scheduledFor - THIRTY_MINUTES;
        const autoSkipAt = scheduledFor + THIRTY_MINUTES;

        const reminder30AlreadySent = log.reminder30MinSent === true;
        const dueReminderAlreadySent = log.dueReminderSent === true;

        // More than 30 minutes before the dose.
        if (now < reminder30At) {
            if (!reminder30AlreadySent) {
                jobs.push({
                    name: "reminder_30",
                    data: buildJobData(
                        log,
                        scheduledFor,
                        "reminder_30",
                        false
                    ),
                    opts: {
                        jobId: buildJobId(logId, "30"),
                        delay: reminder30At - now,
                        removeOnComplete: true,
                    },
                });
            }

            if (!dueReminderAlreadySent) {
                jobs.push({
                    name: "reminder_due",
                    data: buildJobData(
                        log,
                        scheduledFor,
                        "reminder_due",
                        false
                    ),
                    opts: {
                        jobId: buildJobId(logId, "due"),
                        delay: scheduledFor - now,
                        removeOnComplete: true,
                    },
                });
            }

            jobs.push({
                name: "auto_skip",
                data: buildJobData(
                    log,
                    scheduledFor,
                    "auto_skip",
                    false
                ),
                opts: {
                    jobId: buildJobId(logId, "skip"),
                    delay: autoSkipAt - now,
                    removeOnComplete: true,
                },
            });

            continue;
        }

        // Between the 30-minute reminder point and the actual scheduled time.
        if (now >= reminder30At && now < scheduledFor) {
            if (!reminder30AlreadySent) {
                jobs.push({
                    name: "reminder_30",
                    data: buildJobData(
                        log,
                        scheduledFor,
                        "reminder_30",
                        true
                    ),
                    opts: {
                        jobId: buildJobId(logId, "30"),
                        delay: 0,
                        removeOnComplete: true,
                    },
                });
            }

            if (!dueReminderAlreadySent) {
                jobs.push({
                    name: "reminder_due",
                    data: buildJobData(
                        log,
                        scheduledFor,
                        "reminder_due",
                        false
                    ),
                    opts: {
                        jobId: buildJobId(logId, "due"),
                        delay: scheduledFor - now,
                        removeOnComplete: true,
                    },
                });
            }

            jobs.push({
                name: "auto_skip",
                data: buildJobData(
                    log,
                    scheduledFor,
                    "auto_skip",
                    false
                ),
                opts: {
                    jobId: buildJobId(logId, "skip"),
                    delay: autoSkipAt - now,
                    removeOnComplete: true,
                },
            });

            continue;
        }

        // Dose is currently due but has not reached the automatic skip point.
        if (now >= scheduledFor && now < autoSkipAt) {
            if (!dueReminderAlreadySent) {
                jobs.push({
                    name: "reminder_due",
                    data: buildJobData(
                        log,
                        scheduledFor,
                        "reminder_due",
                        true
                    ),
                    opts: {
                        jobId: buildJobId(logId, "due"),
                        delay: 0,
                        removeOnComplete: true,
                    },
                });
            }

            jobs.push({
                name: "auto_skip",
                data: buildJobData(
                    log,
                    scheduledFor,
                    "auto_skip",
                    false
                ),
                opts: {
                    jobId: buildJobId(logId, "skip"),
                    delay: autoSkipAt - now,
                    removeOnComplete: true,
                },
            });

            continue;
        }

        // More than 30 minutes overdue. Only auto-skip is relevant.
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
                    jobId: buildJobId(logId, "skip"),
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

// Cancels reminder jobs for medication logs.
async function cancelMedicationReminderJobs(medicationLogs) {
    if (!Array.isArray(medicationLogs)) {
        throw new Error("medicationLogs must be an array.");
    }

    const removedJobs = [];

    for (const log of medicationLogs) {
        if (!log?._id) {
            continue;
        }

        const logId = log._id.toString();
        const jobTypes = ["30", "due", "skip"];

        for (const jobType of jobTypes) {
            const jobId = buildJobId(logId, jobType);
            const job = await medicationReminderQueue.getJob(jobId);

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