// src/models/otpVerification.model.js

const mongoose = require("mongoose");
const crypto = require("crypto");

const otpVerificationSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => crypto.randomUUID(),
        },

        method: {
            type: String,
            enum: ["email", "phone"],
            required: true,
        },

        identifier: {
            type: String,
            required: true,
            trim: true,
        },

        otp_hash: {
            type: String,
            required: true,
            select: false,
        },

        expires_at: {
            type: Date,
            required: true,
        },

        attempts: {
            type: Number,
            default: 0,
            min: 0,
        },

        last_sent_at: {
            type: Date,
            required: true,
        },

        verified: {
            type: Boolean,
            default: false,
        },

        verification_token_id: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

otpVerificationSchema.index(
    { expires_at: 1 },
    { expireAfterSeconds: 0 }
);

otpVerificationSchema.index(
    { method: 1, identifier: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "OtpVerification",
    otpVerificationSchema
);
