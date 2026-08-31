const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },

    medication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true
    },

    scheduledFor: { // when the medication should be taken
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "taken", "skipped"],
        default: "pending",
        required: true
    },

    takenAt: {
        type: Date
    },

     skippedAt: {
        type: Date
    },

    skipReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

medicationLogSchema.index(  // Ensures the user doesn't have same medication with same time twice in same day
    { medication: 1, scheduledFor: 1 },
    { unique: true }
);

const MedicationLog = mongoose.model('MedicationLog', medicationLogSchema);

module.exports = MedicationLog;