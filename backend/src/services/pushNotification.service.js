const { messaging } = require("../config/firebaseAdmin");
const FcmToken = require("../models/fcmToken.model");

const MAX_MULTICAST_SIZE = 500;

const INVALID_TOKEN_ERROR_CODES = new Set([
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
]);

function normalizeData(data = {}) {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
            key,
            value === null || value === undefined
                ? ""
                : String(value),
        ])
    );
}

async function removeInvalidTokens(tokens) {
    if (tokens.length === 0) {
        return 0;
    }

    const result = await FcmToken.deleteMany({
        fcmToken: {
            $in: tokens,
        },
    });

    return result.deletedCount || 0;
}

async function sendPushNotification({
    userId,
    payload,
}) {
    if (!userId) {
        throw new Error(
            "userId is required to send a push notification."
        );
    }

    if (!payload || typeof payload !== "object") {
        throw new Error(
            "Notification payload is required."
        );
    }

    const notificationPayload =
        payload.notification || payload;

    const tokenRecords =
        await FcmToken.find({
            user: userId,
        })
            .select("fcmToken")
            .lean();

    if (tokenRecords.length === 0) {
        return {
            success: true,
            sentCount: 0,
            failureCount: 0,
            removedTokenCount: 0,
            message:
                "No registered FCM tokens found for this user.",
        };
    }

    const tokens = tokenRecords.map(
        (tokenRecord) =>
            tokenRecord.fcmToken
    );

    const notification = {};

    if (notificationPayload.title) {
        notification.title =
            String(notificationPayload.title);
    }

    if (notificationPayload.body) {
        notification.body =
            String(notificationPayload.body);
    }

    const data = normalizeData(
        payload.data
    );

    let sentCount = 0;
    let failureCount = 0;
    let removedTokenCount = 0;

    for (
        let index = 0;
        index < tokens.length;
        index += MAX_MULTICAST_SIZE
    ) {
        const tokenBatch = tokens.slice(
            index,
            index + MAX_MULTICAST_SIZE
        );

        const message = {
            tokens: tokenBatch,
            data,
        };

        if (
            Object.keys(notification).length > 0
        ) {
            message.notification =
                notification;
        }

        const batchResponse =
            await messaging.sendEachForMulticast(
                message
            );

        sentCount +=
            batchResponse.successCount;

        failureCount +=
            batchResponse.failureCount;

        const invalidTokens = [];

        batchResponse.responses.forEach(
            (response, responseIndex) => {
                if (response.success) {
                    return;
                }

                const errorCode =
                    response.error?.code;

                if (
                    INVALID_TOKEN_ERROR_CODES.has(
                        errorCode
                    )
                ) {
                    invalidTokens.push(
                        tokenBatch[responseIndex]
                    );
                }
            }
        );

        removedTokenCount +=
            await removeInvalidTokens(
                invalidTokens
            );
    }

    return {
        success:
            sentCount > 0 ||
            failureCount === 0,
        sentCount,
        failureCount,
        removedTokenCount,
    };
}

module.exports = {
    sendPushNotification,
};