require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/connectDB");
const MedicationLog = require("./src/models/medicationLog.model");
const {scheduleMedicationReminderJobs,} = require("./src/services/medicationReminderScheduler");
const {createMedicationReminderWorker,} = require("./src/workers/medicationReminder.worker");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  /*
   * Recover reminder jobs for pending medication logs.
   *
   * This allows the scheduler to handle reminders that may
   * have been missed while the backend was unavailable.
   */
  const pendingMedicationLogs = await MedicationLog.find({
    status: "pending",
  });

  if (pendingMedicationLogs.length > 0) {
    await scheduleMedicationReminderJobs(
      pendingMedicationLogs
    );

    console.log(
      `Recovered reminder jobs for ${pendingMedicationLogs.length} pending medication log(s).`
    );
  }

  // Start the BullMQ medication reminder worker.
  createMedicationReminderWorker();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
