// src/utils/otpSender.js

const nodemailer = require("nodemailer");

const getEmailTransporter = () => {
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
        throw new Error(
            "Email OTP delivery is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER and EMAIL_PASSWORD."
        );
    }

    return nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT || 587),
        secure: Number(EMAIL_PORT || 587) === 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD,
        },
    });
};

/**
 * Send an OTP through the configured channel.
 *
 * Phone delivery is intentionally rejected until an SMS provider
 * is configured. We must not claim an OTP was sent when no
 * delivery mechanism exists.
 *
 * @param {{
 *   method: string,
 *   identifier: string,
 *   otp: string
 * }} params
 */
const sendOtp = async ({
    method,
    identifier,
    otp,
}) => {
    if (method === "phone") {
        throw new Error(
            "Phone OTP delivery is not configured."
        );
    }

    if (method !== "email") {
        throw new Error(
            "Unsupported OTP delivery method."
        );
    }

    const transporter = getEmailTransporter();

    await transporter.sendMail({
        from:
            process.env.EMAIL_FROM ||
            process.env.EMAIL_USER,
        to: identifier,
        subject: "MYCARE verification code",
        text: [
            "Your MYCARE verification code is:",
            "",
            otp,
            "",
            "This code expires in 10 minutes.",
            "If you did not request this code, ignore this email.",
        ].join("\n"),
        html: `
            <p>Your MYCARE verification code is:</p>
            <h2>${otp}</h2>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this code, ignore this email.</p>
        `,
    });
};

module.exports = {
    sendOtp,
};
