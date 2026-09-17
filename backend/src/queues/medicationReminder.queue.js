const { Queue } = require("bullmq");
const redis = require("../config/redis");

const medicationReminderQueue = new Queue("medication-reminders", {
    connection: redis,
});

module.exports = medicationReminderQueue;