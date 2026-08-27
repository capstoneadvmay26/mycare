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

        followUpStartDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Symptom", symptomSchema);