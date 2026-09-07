const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const { hashPassword, comparePassword } = require("../utils/bcrypt");
const {
    generateOtp,
    hashOtp,
    verifyOtp,
} = require("../utils/otp");

const { sendOtp } = require("../utils/otpSender");

// OTP validity period
const OTP_EXPIRY_MINUTES = 10;

// Minimum time between OTP requests
const OTP_RESEND_COOLDOWN_SECONDS = 60;

// Maximum OTP verification attempts
const MAX_OTP_ATTEMPTS = 5;

// Generates a signed JWT token valid for 1 day
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET || "fallback_secret",
        {
            expiresIn: "1d",
        }
    );
};

/**
 * Sends an OTP for a user.
 */
const createAndSendOtp = async (user) => {
    const otp = generateOtp();

    user.otpHash = hashOtp(otp);

    user.otpExpiresAt = new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();

    await user.save();

    await sendOtp({
        email: user.email,
        phone: user.phone,
        contactMethod: user.contactMethod,
        otp,
    });
};

/**
 * Handles user registration.
 *
 * Registration creates an unverified account and sends an OTP.
 *
 * If OTP delivery fails, the newly created user is deleted
 * so they can safely try registration again.
 */
const registerUser = async (req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            password,
        } = req.body;

        const contactMethod = email ? "email" : "phone";

        // Check whether email or phone already exists
        const existingUser = await User.findOne({
            $or: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : []),
            ],
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "A user already exists with this email or phone number.",
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email: email || undefined,
            phone: phone || undefined,
            password: hashedPassword,
            contactMethod,
            isVerified: false,
        });

        // Try to generate and send OTP.
        // If sending fails, remove the newly created user.
        try {
          await createAndSendOtp(user);
        } catch (error) {
          await User.findByIdAndDelete(user._id);
          
          console.error("OTP sending failed:", error);
          throw error;
        }

        return res.status(201).json({
            success: true,
            message: `Verification OTP sent to your ${contactMethod}.`,
            requiresVerification: true,
            userId: user._id,
            contactMethod,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verifies the OTP sent during registration.
 */
const verifyRegistrationOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const query = email.includes("@")
            ? { email: email.toLowerCase() }
            : { phone: email };

        const user = await User.findOne(query).select(
            "+otpHash +otpExpiresAt +otpAttempts"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User is already verified.",
            });
        }

        if (!user.otpHash || !user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: "No active OTP found. Please request a new OTP.",
            });
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP.",
            });
        }

        if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                message:
                    "Too many incorrect OTP attempts. Please request a new OTP.",
            });
        }

        const isValid = verifyOtp(otp, user.otpHash);

        if (!isValid) {
            user.otpAttempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        user.isVerified = true;
        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
        user.otpAttempts = 0;
        user.otpLastSentAt = undefined;

        await user.save();

        const token = generateToken(user._id, user.role);

        return res.status(200).json({
            success: true,
            message: "Account verified successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resends a registration OTP.
 */
const resendRegistrationOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        const query = email.includes("@")
            ? { email: email.toLowerCase() }
            : { phone: email };

        const user = await User.findOne(query).select(
            "+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User is already verified.",
            });
        }

        if (
            user.otpLastSentAt &&
            Date.now() - user.otpLastSentAt.getTime() <
                OTP_RESEND_COOLDOWN_SECONDS * 1000
        ) {
            return res.status(429).json({
                success: false,
                message: "Please wait before requesting another OTP.",
            });
        }

        await createAndSendOtp(user);

        return res.status(200).json({
            success: true,
            message: `A new verification OTP has been sent to your ${user.contactMethod}.`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles user login.
 *
 * Login accepts either email or phone number.
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const query = email.includes("@")
            ? { email: email.toLowerCase() }
            : { phone: email };

        const user = await User.findOne(query).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials.",
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your account with the OTP first.",
                requiresVerification: true,
            });
        }

        const isMatch = await comparePassword(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials.",
            });
        }

        const token = generateToken(user._id, user.role);

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    loginUser,
};