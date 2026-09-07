const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        contactMethod: {
            type: String,
            enum: ["email", "phone"],
            required: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        otpHash: {
            type: String,
            select: false,
        },

        otpExpiresAt: {
            type: Date,
            select: false,
        },

        otpAttempts: {
            type: Number,
            default: 0,
            select: false,
        },

        otpLastSentAt: {
            type: Date,
            select: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);