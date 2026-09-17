const FcmToken = require("../models/fcmToken.model");


/**
 * Register or refresh an FCM token for the authenticated user.
 *
 * POST /api/v1/notifications/register-token
 *
 * Body:
 * {
 *     "fcmToken": "..."
 * }
 */
async function registerFcmToken(
    req,
    res,
    next
) {
    try {
        const { fcmToken } = req.body;

        if (
            typeof fcmToken !== "string" ||
            !fcmToken.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "fcmToken is required.",
            });
        }

        const userId = req.user.id;

        /*
         * The FCM token identifies the browser/device
         * registration, while the authenticated user identifies
         * who owns that registration.
         *
         * If the token already exists, associate it with the
         * current authenticated user and refresh lastSeenAt.
         */
        const tokenRecord =
            await FcmToken.findOneAndUpdate(
                {
                    fcmToken: fcmToken.trim(),
                },
                {
                    $set: {
                        user: userId,
                        lastSeenAt: new Date(),
                    },
                },
                {
                    returnDocument: "after",
                    upsert: true,
                    setDefaultsOnInsert: true,
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "FCM token registered successfully.",
            data: {
                id: tokenRecord._id,
                lastSeenAt:
                    tokenRecord.lastSeenAt,
            },
        });
    } catch (error) {
        next(error);
    }
}


/**
 * Remove an FCM token for the authenticated user.
 *
 * DELETE /api/v1/notifications/register-token
 *
 * Body:
 * {
 *     "fcmToken": "..."
 * }
 */
async function unregisterFcmToken(
    req,
    res,
    next
) {
    try {
        const { fcmToken } = req.body;

        if (
            typeof fcmToken !== "string" ||
            !fcmToken.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "fcmToken is required.",
            });
        }

        const deletedToken =
            await FcmToken.findOneAndDelete({
                fcmToken: fcmToken.trim(),
                user: req.user.id,
            });

        if (!deletedToken) {
            return res.status(404).json({
                success: false,
                message:
                    "FCM token not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "FCM token removed successfully.",
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    registerFcmToken,
    unregisterFcmToken,
};
