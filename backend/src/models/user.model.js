// src/models/user.model.js

const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => crypto.randomUUID(),
        },

        full_name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports =
    mongoose.models.User ||
    mongoose.model("User", userSchema);
