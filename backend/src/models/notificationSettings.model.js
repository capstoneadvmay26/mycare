const mongoose = require("mongoose");

const notificationSettingsSchema = new mongoose.Schema(
    {
        // The user these notification settings belong to
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Controls whether push notifications are enabled
        pushEnabled: {
            type: Boolean,
            default: true
        },

        // Controls the user's quiet hours
        quietHours: {
            enabled: {
                type: Boolean,
                default: true
            },

            start: {
                type: String,
                default: "22:00",
                match: /^([01]\d|2[0-3]):([0-5]\d)$/
            },

            end: {
                type: String,
                default: "07:00",
                match: /^([01]\d|2[0-3]):([0-5]\d)$/
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "NotificationSettings",
    notificationSettingsSchema
);