const mongoose = require("mongoose");

const fcmTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        fcmToken: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        /*
         * Updated whenever the frontend registers this token.
         *
         * This helps us know when a browser/device last
         * synchronized its notification registration.
         */
        lastSeenAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "FcmToken",
    fcmTokenSchema
);
