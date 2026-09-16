const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
    {
        // Which profile (self or dependent) this medication belongs to.
        // Ownership is checked THROUGH the profile's owner, not stored
        // redundantly here , one source of truth.
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },
        // e.g. "500mg", "2 tablets" kept as free text since units vary widely.
        dosage: {
            type: String,
            required: true,
            trim: true,
        },

        frequency: {
            type: String,
            enum: ["once_daily", "twice_daily", "three_times_daily", "weekly", "as_needed"],
            required: true,
        },

        // Specific clock times this medication should taken, e.g. ["08:00", "20:00"].
        // An array becuase some medication are taken multiple times a day.
        scheduleTime: {
            type: [String],
            default: [],
        },

        startDate: {
            type: Date,
            required: true,
        },

        //null/omitted = onging medication with no planned and date.
        endDate: {
            type: Date,
            default: null,
        },

        status: {
            type: String,
            enum: ["active", "archived"],
            default: "active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);