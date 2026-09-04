const nodemailer = require("nodemailer");

/**
 * Creates the email transporter.
 */
const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Sends OTP by email.
 */
const sendEmailOtp = async (email, otp) => {
    await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: "MY CARE - Verification Code",
        text: `Your MY CARE verification code is ${otp}. It expires in 10 minutes.`,
    });
};

/**
 * Sends OTP by SMS using Twilio.
 */
const sendSmsOtp = async (phone, otp) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        throw new Error("SMS service is not configured.");
    }

    const credentials = Buffer
        .from(`${accountSid}:${authToken}`)
        .toString("base64");

    const body = new URLSearchParams({
        From: fromNumber,
        To: phone,
        Body: `Your MY CARE verification code is ${otp}. It expires in 10 minutes.`,
    });

    const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SMS service failed: ${errorText}`);
    }
};

/**
 * Sends OTP using the user's selected contact method.
 */
const sendOtp = async ({ email, phone, contactMethod, otp }) => {
    if (contactMethod === "email") {
        await sendEmailOtp(email, otp);
        return;
    }

    if (contactMethod === "phone") {
        await sendSmsOtp(phone, otp);
        return;
    }

    throw new Error("Invalid OTP delivery method.");
};

module.exports = {
    sendEmailOtp,
    sendSmsOtp,
    sendOtp,
};