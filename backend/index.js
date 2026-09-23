require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/connectDB");
const {recoverMedicationReminderJobs} = require("./src/workers/medicationReminderRecovery");
const {createMedicationReminderWorker,} = require("./src/workers/medicationReminder.worker");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    await recoverMedicationReminderJobs();

    createMedicationReminderWorker();

    app.listen(PORT, () => {
        console.log(
            `Server running on port ${PORT}`
        );
    });
};

startServer();