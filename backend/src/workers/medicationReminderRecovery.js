const MedicationLog = require("../models/medicationLog.model");
const {scheduleMedicationReminderJobs} = require("../services/medicationReminderScheduler");

const RECOVERY_WINDOW_MINUTES = 30;

const THIRTY_MINUTES = RECOVERY_WINDOW_MINUTES * 60 * 1000;

async function recoverMedicationReminderJobs() {
    const now = new Date();

    const recoveryStart = new Date(now.getTime() - THIRTY_MINUTES);

    const recoveryEnd = new Date(now.getTime() + THIRTY_MINUTES);

    /*
     * Any pending dose whose scheduled time was more than
     * 30 minutes ago has already passed its auto-skip time.
     *
     * We mark these doses as skipped directly in MongoDB
     * instead of creating an auto_skip BullMQ job.
     *
     * This avoids unnecessary Redis requests for old doses.
     */
    const expiredResult =
        await MedicationLog.updateMany(
            {
                status: "pending",
                scheduledFor: {
                    $lte: recoveryStart,
                },
            },
            {
                $set: {
                    status: "skipped",
                    skippedAt: now,
                    takenAt: null,
                    skipReason:
                        "Dose was not marked as taken within 30 minutes of the scheduled time.",
                },
            }
        );

    if (expiredResult.modifiedCount > 0) {
        console.log(`Marked ${expiredResult.modifiedCount} expired medication dose(s) as skipped.`);
    }

    /*
     * Only recover doses that are close enough to the current
     * time that their reminder/due/auto-skip jobs may actually
     * need to be recreated.
     *
     * Older doses were handled directly above.
     *
     * Future doses beyond this window are not recreated because
     * their delayed BullMQ jobs should already exist in Redis.
     */
    const pendingMedicationLogs =
        await MedicationLog.find({
            status: "pending",
            scheduledFor: {
                $gt: recoveryStart,
                $lte: recoveryEnd,
            },
        }).sort({
            scheduledFor: 1,
        });

    if (pendingMedicationLogs.length === 0) {
        console.log(
            "No medication reminder jobs require recovery."
        );

        return [];
    }

    const jobs = await scheduleMedicationReminderJobs(pendingMedicationLogs);

    console.log(`Recovered reminder jobs for ${pendingMedicationLogs.length} pending medication log(s).`);

    return jobs;
}

module.exports = {
    recoverMedicationReminderJobs,
};
