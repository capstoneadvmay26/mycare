const NotificationSettingsModel = require("../models/notificationSettings.model");


/**
 * Get the authenticated user's notification settings.
 * 
 * If the user does not have settings yet,
 * default settings will be created automatically.
 */
const getNotificationSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Find the user's notification settings
        let settings = await NotificationSettingsModel.findOne({
            user: userId
        });

        // Create default settings if none exist
        if (!settings) {
            settings = await NotificationSettingsModel.create({
                user: userId
            });
        }

        return res.status(200).json({
            success: true,
            settings
        });

    } catch (error) {
        next(error);
    }
};


/**
 * Update the authenticated user's notification settings.
 */
const updateNotificationSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const {
            pushEnabled,
            quietHours
        } = req.body;

        // Validate pushEnabled if it was provided
        if (
            pushEnabled !== undefined &&
            typeof pushEnabled !== "boolean"
        ) {
            return res.status(400).json({
                message: "pushEnabled must be a boolean."
            });
        }

        // Validate quietHours if it was provided
        if (
            quietHours !== undefined &&
            (typeof quietHours !== "object" || quietHours === null)
        ) {
            return res.status(400).json({
                message: "quietHours must be an object."
            });
        }

        // Validate quietHours.enabled
        if (
            quietHours?.enabled !== undefined &&
            typeof quietHours.enabled !== "boolean"
        ) {
            return res.status(400).json({
                message: "quietHours.enabled must be a boolean."
            });
        }

        // Validate quietHours.start
        if (
            quietHours?.start !== undefined &&
            !/^([01]\d|2[0-3]):([0-5]\d)$/.test(quietHours.start)
        ) {
            return res.status(400).json({
                message: "quietHours.start must be in HH:MM format."
            });
        }

        // Validate quietHours.end
        if (
            quietHours?.end !== undefined &&
            !/^([01]\d|2[0-3]):([0-5]\d)$/.test(quietHours.end)
        ) {
            return res.status(400).json({
                message: "quietHours.end must be in HH:MM format."
            });
        }

        // Find the user's existing settings
        let settings = await NotificationSettingsModel.findOne({
            user: userId
        });

        // Create settings if they don't exist
        if (!settings) {
            settings = new NotificationSettingsModel({
                user: userId
            });
        }

        // Update push notification preference
        if (pushEnabled !== undefined) {
            settings.pushEnabled = pushEnabled;
        }

        // Update quiet hours
        if (quietHours !== undefined) {

            if (quietHours.enabled !== undefined) {
                settings.quietHours.enabled = quietHours.enabled;
            }

            if (quietHours.start !== undefined) {
                settings.quietHours.start = quietHours.start;
            }

            if (quietHours.end !== undefined) {
                settings.quietHours.end = quietHours.end;
            }
        }

        await settings.save();

        return res.status(200).json({
            success: true,
            settings
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getNotificationSettings,
    updateNotificationSettings
};