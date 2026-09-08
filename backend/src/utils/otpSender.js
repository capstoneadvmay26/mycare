// src/utils/otpSender.js

/**
 * OTP delivery utilities.
 *
 * Email delivery uses Resend's HTTP API instead of SMTP.
 * This avoids SMTP connection timeouts on Render Free.
 *
 * Required email environment variables:
 * - RESEND_API_KEY
 * - EMAIL_FROM
 *
 * Required SMS environment variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Creates a standard application error.
 *
 * @param {string} message
 * @param {number} statusCode
 * @param {string} code
 * @returns {Error}
 */
const createOtpError = (
    message,
    statusCode,
    code
) => {
    const error = new Error(message);

    error.statusCode = statusCode;
    error.code = code;

    return error;
};

/**
 * Sends an OTP email through the Resend HTTP API.
 *
 * @param {string} email - Recipient email address.
 * @param {string} otp - Six-digit OTP.
 * @returns {Promise<void>}
 */
const sendEmailOtp = async (
    email,
    otp
) => {
    const apiKey =
        process.env.RESEND_API_KEY;

    const from =
        process.env.EMAIL_FROM;

    if (!apiKey || !from) {
        throw createOtpError(
            "Email OTP service is not configured.",
            503,
            "OTP_DELIVERY_NOT_CONFIGURED"
        );
    }

    if (!email || !otp) {
        throw createOtpError(
            "Email OTP recipient and code are required.",
            400,
            "INVALID_OTP_DELIVERY_REQUEST"
        );
    }

    const controller =
        new AbortController();

    const timeout =
        setTimeout(() => {
            controller.abort();
        }, 10000);

    try {
        const response =
            await fetch(
                RESEND_API_URL,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${apiKey}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        from,
                        to: [email],
                        subject:
                            "Your MY CARE verification code",
                        text:
                            `Your MY CARE verification code is ${otp}. ` +
                            "It expires in 10 minutes.",
                        html: `
                            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                                <h2>MY CARE Verification Code</h2>

                                <p>
                                    Your verification code is:
                                </p>

                                <p
                                    style="
                                        font-size: 32px;
                                        font-weight: bold;
                                        letter-spacing: 8px;
                                    "
                                >
                                    ${otp}
                                </p>

                                <p>
                                    This code expires in 10 minutes.
                                </p>

                                <p>
                                    If you did not request this code,
                                    you can safely ignore this email.
                                </p>
                            </div>
                        `,
                    }),
                    signal:
                        controller.signal,
                }
            );

        const responseText =
            await response.text();

        let responseBody = null;

        try {
            responseBody =
                responseText
                    ? JSON.parse(responseText)
                    : null;
        } catch {
            responseBody = null;
        }

        if (!response.ok) {
            const providerMessage =
                responseBody?.message ||
                responseBody?.error ||
                responseText ||
                "Unknown email provider error.";

            throw createOtpError(
                `Email OTP delivery failed: ${providerMessage}`,
                503,
                "OTP_DELIVERY_FAILED"
            );
        }

        if (!responseBody?.id) {
            throw createOtpError(
                "Email provider accepted the request without returning a message ID.",
                503,
                "OTP_DELIVERY_FAILED"
            );
        }
    } catch (error) {
        if (
            error?.name ===
            "AbortError"
        ) {
            throw createOtpError(
                "Email OTP provider request timed out.",
                503,
                "OTP_DELIVERY_TIMEOUT"
            );
        }

        if (
            error?.code &&
            error.code.startsWith("OTP_")
        ) {
            throw error;
        }

        throw createOtpError(
            `Email OTP delivery failed: ${error.message}`,
            503,
            "OTP_DELIVERY_FAILED"
        );
    } finally {
        clearTimeout(timeout);
    }
};

/**
 * Sends an OTP SMS through Twilio's HTTP API.
 *
 * @param {string} phone - Recipient phone number.
 * @param {string} otp - Six-digit OTP.
 * @returns {Promise<void>}
 */
const sendSmsOtp = async (
    phone,
    otp
) => {
    const accountSid =
        process.env.TWILIO_ACCOUNT_SID;

    const authToken =
        process.env.TWILIO_AUTH_TOKEN;

    const fromNumber =
        process.env.TWILIO_PHONE_NUMBER;

    if (
        !accountSid ||
        !authToken ||
        !fromNumber
    ) {
        throw createOtpError(
            "SMS OTP service is not configured.",
            503,
            "OTP_DELIVERY_NOT_CONFIGURED"
        );
    }

    if (!phone || !otp) {
        throw createOtpError(
            "SMS OTP recipient and code are required.",
            400,
            "INVALID_OTP_DELIVERY_REQUEST"
        );
    }

    const credentials =
        Buffer
            .from(
                `${accountSid}:${authToken}`
            )
            .toString("base64");

    const body =
        new URLSearchParams({
            From: fromNumber,
            To: phone,
            Body:
                `Your MY CARE verification code is ${otp}. ` +
                "It expires in 10 minutes.",
        });

    const controller =
        new AbortController();

    const timeout =
        setTimeout(() => {
            controller.abort();
        }, 10000);

    try {
        const response =
            await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Basic ${credentials}`,
                        "Content-Type":
                            "application/x-www-form-urlencoded",
                    },
                    body,
                    signal:
                        controller.signal,
                }
            );

        const responseText =
            await response.text();

        if (!response.ok) {
            throw createOtpError(
                `SMS OTP delivery failed: ${responseText}`,
                503,
                "OTP_DELIVERY_FAILED"
            );
        }
    } catch (error) {
        if (
            error?.name ===
            "AbortError"
        ) {
            throw createOtpError(
                "SMS OTP provider request timed out.",
                503,
                "OTP_DELIVERY_TIMEOUT"
            );
        }

        if (
            error?.code &&
            error.code.startsWith("OTP_")
        ) {
            throw error;
        }

        throw createOtpError(
            `SMS OTP delivery failed: ${error.message}`,
            503,
            "OTP_DELIVERY_FAILED"
        );
    } finally {
        clearTimeout(timeout);
    }
};

/**
 * Sends an OTP using the requested delivery method.
 *
 * @param {Object} params
 * @param {"email"|"phone"} params.method
 * @param {string} params.identifier
 * @param {string} params.otp
 * @returns {Promise<void>}
 */
const sendOtp = async ({
    method,
    identifier,
    otp,
}) => {
    if (method === "email") {
        await sendEmailOtp(
            identifier,
            otp
        );

        return;
    }

    if (method === "phone") {
        await sendSmsOtp(
            identifier,
            otp
        );

        return;
    }

    throw createOtpError(
        "Invalid OTP delivery method.",
        400,
        "INVALID_OTP_METHOD"
    );
};

module.exports = {
    sendEmailOtp,
    sendSmsOtp,
    sendOtp,
};
