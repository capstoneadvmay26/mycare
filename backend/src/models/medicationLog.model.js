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

    scheduledAt: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ['taken', 'skipped'],
        required: true
    },

    takenAt: {
        type: Date
    },

    skipReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const MedicationLog = mongoose.model('MedicationLog', medicationLogSchema);

module.exports = MedicationLog;