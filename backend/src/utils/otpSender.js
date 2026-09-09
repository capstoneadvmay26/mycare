// src/utils/otpSender.js

/**
 * OTP delivery utilities.
 *
 * Email delivery uses Brevo's HTTP API.
 * SMS delivery uses Brevo's HTTP API.
 *
 * Required email environment variables:
 * - BREVO_API_KEY
 * - BREVO_FROM_EMAIL
 * - BREVO_FROM_NAME
 *
 * Required SMS environment variable:
 * - BREVO_SMS_SENDER
 */

const BREVO_EMAIL_API_URL =
    "https://api.brevo.com/v3/smtp/email";

const BREVO_SMS_API_URL =
    "https://api.brevo.com/v3/transactionalSMS/send";


/**
 * Creates a standard application error.
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
 * Sends OTP by email using Brevo's HTTP API.
 */
const sendEmailOtp = async (
    email,
    otp
) => {
    const apiKey =
        process.env.BREVO_API_KEY;

    const fromEmail =
        process.env.BREVO_FROM_EMAIL;

    const fromName =
        process.env.BREVO_FROM_NAME;

    if (
        !apiKey ||
        !fromEmail ||
        !fromName
    ) {
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
                BREVO_EMAIL_API_URL,
                {
                    method: "POST",

                    headers: {
                        accept:
                            "application/json",

                        "api-key":
                            apiKey,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        sender: {
                            name:
                                fromName,

                            email:
                                fromEmail,
                        },

                        to: [
                            {
                                email,
                            },
                        ],

                        subject:
                            "MY CARE - Verification Code",

                        textContent:
                            `Your MY CARE verification code is ${otp}. ` +
                            "It expires in 10 minutes.",

                        htmlContent: `
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
                responseBody?.code ||
                responseText ||
                "Unknown email provider error.";

            throw createOtpError(
                `Email OTP delivery failed: ${providerMessage}`,
                503,
                "OTP_DELIVERY_FAILED"
            );
        }

        if (!responseBody?.messageId) {
            throw createOtpError(
                "Brevo accepted the request without returning a message ID.",
                503,
                "OTP_DELIVERY_FAILED"
            );
        }

        console.log(
            "OTP email accepted by Brevo:",
            responseBody.messageId
        );

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
 * Sends OTP by SMS using Brevo's HTTP API.
 */
const sendSmsOtp = async (
    phone,
    otp
) => {
    const apiKey =
        process.env.BREVO_API_KEY;

    const sender =
        process.env.BREVO_SMS_SENDER;

    if (
        !apiKey ||
        !sender
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

    const controller =
        new AbortController();

    const timeout =
        setTimeout(() => {
            controller.abort();
        }, 10000);

    try {
        const response =
            await fetch(
                BREVO_SMS_API_URL,
                {
                    method: "POST",

                    headers: {
                        accept:
                            "application/json",

                        "api-key":
                            apiKey,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        sender,

                        recipient:
                            phone,

                        content:
                            `Your MY CARE verification code is ${otp}. ` +
                            "It expires in 10 minutes.",

                        type:
                            "transactional",
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
                responseBody?.code ||
                responseText ||
                "Unknown SMS provider error.";

            throw createOtpError(
                `SMS OTP delivery failed: ${providerMessage}`,
                503,
                "OTP_DELIVERY_FAILED"
            );
        }

        if (!responseBody?.messageId) {
            throw createOtpError(
                "Brevo accepted the SMS request without returning a message ID.",
                503,
                "OTP_DELIVERY_FAILED"
            );
        }

        console.log(
            "OTP SMS accepted by Brevo:",
            responseBody.messageId
        );

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
 * Sends OTP using the method and identifier
 * supplied by the authentication controller.
 *
 * Email:
 * method = "email"
 * identifier = email address
 *
 * Phone:
 * method = "phone"
 * identifier = phone number
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

/**
 * Sends password reset link by email using Brevo's HTTP API.
 */
const sendPasswordResetEmail = async (
    email,
    resetUrl
) => {
    const apiKey =
        process.env.BREVO_API_KEY;

    const fromEmail =
        process.env.BREVO_FROM_EMAIL;

    const fromName =
        process.env.BREVO_FROM_NAME;

    if (
        !apiKey ||
        !fromEmail ||
        !fromName
    ) {
        throw createOtpError(
            "Password reset email service is not configured.",
            503,
            "RESET_EMAIL_NOT_CONFIGURED"
        );
    }

    if (!email || !resetUrl) {
        throw createOtpError(
            "Password reset email recipient and reset link are required.",
            400,
            "INVALID_RESET_EMAIL_REQUEST"
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
                BREVO_EMAIL_API_URL,
                {
                    method: "POST",

                    headers: {
                        accept:
                            "application/json",

                        "api-key":
                            apiKey,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        sender: {
                            name:
                                fromName,

                            email:
                                fromEmail,
                        },

                        to: [
                            {
                                email,
                            },
                        ],

                        subject:
                            "MY CARE - Password Reset",

                        textContent:
                            "You requested to reset your MY CARE password. " +
                            `Use this link to create a new password: ${resetUrl} ` +
                            "This link expires in 15 minutes. " +
                            "If you did not request a password reset, you can safely ignore this email.",

                        htmlContent: `
                            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                                <h2>MY CARE Password Reset</h2>

                                <p>
                                    You requested to reset your MY CARE password.
                                </p>

                                <p>
                                    Click the button below to create a new password:
                                </p>

                                <p>
                                    <a
                                        href="${resetUrl}"
                                        style="
                                            display: inline-block;
                                            padding: 12px 20px;
                                            background-color: #2563eb;
                                            color: white;
                                            text-decoration: none;
                                            border-radius: 6px;
                                        "
                                    >
                                        Reset Password
                                    </a>
                                </p>

                                <p>
                                    This link expires in 15 minutes.
                                </p>

                                <p>
                                    If you did not request a password reset,
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
                responseBody?.code ||
                responseText ||
                "Unknown email provider error.";

            throw createOtpError(
                `Password reset email delivery failed: ${providerMessage}`,
                503,
                "RESET_EMAIL_DELIVERY_FAILED"
            );
        }

        if (!responseBody?.messageId) {
            throw createOtpError(
                "Brevo accepted the request without returning a message ID.",
                503,
                "RESET_EMAIL_DELIVERY_FAILED"
            );
        }

        console.log(
            "Password reset email accepted by Brevo:",
            responseBody.messageId
        );

    } catch (error) {
        if (
            error?.name ===
            "AbortError"
        ) {
            throw createOtpError(
                "Password reset email provider request timed out.",
                503,
                "RESET_EMAIL_DELIVERY_TIMEOUT"
            );
        }

        if (
            error?.code &&
            error.code.startsWith("RESET_")
        ) {
            throw error;
        }

        throw createOtpError(
            `Password reset email delivery failed: ${error.message}`,
            503,
            "RESET_EMAIL_DELIVERY_FAILED"
        );

    } finally {
        clearTimeout(timeout);
    }
};

module.exports = {
    sendEmailOtp,
    sendSmsOtp,
    sendOtp,
    sendPasswordResetEmail
};