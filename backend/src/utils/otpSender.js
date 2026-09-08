// src/utils/otpSender.js

// src/utils/otpSender.js

const nodemailer = require("nodemailer");

const createEmailTransporter = () => {
    const {
        EMAIL_HOST,
        EMAIL_PORT,
        EMAIL_USER,
        EMAIL_PASSWORD,
    } = process.env;

    if (
        !EMAIL_HOST ||
        !EMAIL_USER ||
        !EMAIL_PASSWORD
    ) {
        const error = new Error(
            "Email OTP service is not configured."
        );

        error.statusCode = 503;
        error.code = "OTP_DELIVERY_NOT_CONFIGURED";

        throw error;
    }

    return nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT || 587),
        secure:
            Number(EMAIL_PORT || 587) === 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD,
        },
    });
};

const sendEmailOtp = async (
    email,
    otp
) => {
    const transporter =
        createEmailTransporter();

    await transporter.sendMail({
        from:
            process.env.EMAIL_FROM ||
            process.env.EMAIL_USER,

        to: email,

        subject:
            "MY CARE - Verification Code",

        text: [
            "Your MY CARE verification code is:",
            "",
            otp,
            "",
            "This code expires in 10 minutes.",
            "",
            "If you did not request this code, ignore this email.",
        ].join("\n"),
    });
};

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
        const error = new Error(
            "SMS OTP service is not configured."
        );

        error.statusCode = 503;
        error.code =
            "OTP_DELIVERY_NOT_CONFIGURED";

        throw error;
    }

    const credentials = Buffer
        .from(
            `${accountSid}:${authToken}`
        )
        .toString("base64");

    const body = new URLSearchParams({
        From: fromNumber,
        To: phone,
        Body:
            `Your MY CARE verification code is ${otp}. ` +
            "It expires in 10 minutes.",
    });

    const response = await fetch(
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
        }
    );

    if (!response.ok) {
        const responseText =
            await response.text();

        const error = new Error(
            `SMS OTP delivery failed: ${responseText}`
        );

        error.statusCode = 503;
        error.code =
            "OTP_DELIVERY_FAILED";

        throw error;
    }
};

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

    const error = new Error(
        "Invalid OTP delivery method."
    );

    error.statusCode = 400;
    error.code = "INVALID_OTP_METHOD";

    throw error;
};

module.exports = {
    sendOtp,
};

