// src/models/user.model.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        full_name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
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

        date_of_birth: {
            type: Date,
        },

        gender: {
            type: String,
            enum: [
                "Male",
                "Female",
                "Other",
                "Prefer not to say",
                "male",
                "female",
                "other",
                "prefer_not_to_say",
            ],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);