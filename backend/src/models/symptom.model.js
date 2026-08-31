const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema(
    {
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },

        symptoms: [
            {
                type: String,
                trim: true,
                required: true,
            }
        ],

        otherSymptom: {
            type: String,
            trim: true,
        },

        severity: {
            type: String,
            enum: ["mild", "moderate", "severe", "very_severe"],
            required: true,
        },

        loggedAt: {
            type: Date,
            default: Date.now,
        },

        checkIns: [
            {
                day: {
                    type: Number,
                    enum: [1, 2, 3],
                    required: true,
                },

                status: {
                    type: String,
                    enum: ["better", "same", "worse"],
                    required: true,
                },

                checkedInAt: {
                    type: Date,
                    default: Date.now,
                },
            }
        ],

        professionalCareNudge: {
            shown: {
                type: Boolean,
                default: false,
            },

            shownAt: {
                type: Date,
            },
        },

        doctorFollowUp: {
            response: {
                type: String,
                enum: ["yes", "no", "remind_later"],
            },

            respondedAt: {
                type: Date,
            },

            nextReminderAt: {
                type: Date,
            },
        },
    },{ timestamps: true });

module.exports = mongoose.model("Symptom", symptomSchema);