// src/controllers/user.controller.js

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const OtpVerification = require("../models/otpVerification.model");

const {
    hashPassword,
    comparePassword,
} = require("../utils/bcrypt");

const {
    generateOtp,
    hashOtp,
    verifyOtp,
} = require("../utils/otp");

const { sendOtp } = require("../utils/otpSender");

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;
const REGISTRATION_TOKEN_MINUTES = 15;
const PASSWORD_RESET_TOKEN_MINUTES = 15;

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET is not configured."
        );
    }

    return process.env.JWT_SECRET;
};

const normalizeIdentifier = (
    method,
    identifier
) => {
    const normalized = identifier.trim();

    if (method === "email") {
        return normalized.toLowerCase();
    }

    return normalized;
};

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    ...(user.phone
        ? { phone: user.phone }
        : {}),
});

const generateAccessToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
            type: "access",
        },
        getJwtSecret(),
        {
            expiresIn: "1d",
        }
    );
};

const generateRegistrationToken = ({
    method,
    identifier,
    verificationTokenId,
}) => {
    return jwt.sign(
        {
            type: "registration",
            method,
            identifier,
            verification_token_id:
                verificationTokenId,
        },
        getJwtSecret(),
        {
            expiresIn:
                `${REGISTRATION_TOKEN_MINUTES}m`,
        }
    );
};

const generatePasswordResetToken = (
    userId
) => {
    return jwt.sign(
        {
            type: "password_reset",
            id: userId,
        },
        getJwtSecret(),
        {
            expiresIn:
                `${PASSWORD_RESET_TOKEN_MINUTES}m`,
        }
    );
};

/**
 * POST /api/v1/auth/request-otp
 */
const requestOtp = async (
    req,
    res,
    next
) => {
    try {
        const {
            method,
            email,
            phone,
        } = req.body;

        const identifier = normalizeIdentifier(
            method,
            method === "email"
                ? email
                : phone
        );

        const existingUser =
            method === "email"
                ? await User.findOne({
                    email: identifier,
                })
                : await User.findOne({
                    phone: identifier,
                });

        if (
            existingUser &&
            existingUser.is_verified === true
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this identifier. Please log in.",
                errors: {},
            });
        }

        const existingOtp =
            await OtpVerification.findOne({
                method,
                identifier,
            }).select(
                "+otp_hash"
            );

        if (
            existingOtp &&
            existingOtp.last_sent_at &&
            Date.now() -
                existingOtp.last_sent_at.getTime() <
                OTP_RESEND_COOLDOWN_SECONDS * 1000
        ) {
            return res.status(429).json({
                success: false,
                message:
                    "Please wait before requesting another OTP.",
                errors: {},
            });
        }

        const otp = generateOtp();

        const expiresAt = new Date(
            Date.now() +
                OTP_EXPIRY_MINUTES *
                60 *
                1000
        );

        if (existingOtp) {
            existingOtp.otp_hash = hashOtp(otp);
            existingOtp.expires_at = expiresAt;
            existingOtp.attempts = 0;
            existingOtp.last_sent_at =
                new Date();
            existingOtp.verified = false;
            existingOtp.verification_token_id =
                null;

            await existingOtp.save();
        } else {
            await OtpVerification.create({
                method,
                identifier,
                otp_hash: hashOtp(otp),
                expires_at: expiresAt,
                attempts: 0,
                last_sent_at: new Date(),
                verified: false,
            });
        }

        try {
            await sendOtp({
                method,
                identifier,
                otp,
            });
        } catch (error) {
            await OtpVerification.deleteOne({
                method,
                identifier,
            });

            return next(error);
        }

        if (
            process.env.NODE_ENV !==
            "production"
        ) {
            console.log(
                JSON.stringify({
                    type: "otp_generated",
                    method,
                    identifier,
                    otp,
                    expires_at:
                        expiresAt.toISOString(),
                })
            );
        }

        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * POST /api/v1/auth/verify-otp
 */
const verifyOtpCode = async (
    req,
    res,
    next
) => {
    try {
        const {
            method,
            identifier,
            otp,
        } = req.body;

        const normalizedIdentifier =
            normalizeIdentifier(
                method,
                identifier
            );

        const verification =
            await OtpVerification.findOne({
                method,
                identifier:
                    normalizedIdentifier,
            }).select(
                "+otp_hash"
            );

        if (!verification) {
            return res.status(400).json({
                success: false,
                message:
                    "No active OTP found. Please request a new OTP.",
                errors: {},
            });
        }

        if (verification.verified) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP has already been used.",
                errors: {},
            });
        }

        if (
            verification.expires_at <=
            new Date()
        ) {
            await OtpVerification.deleteOne({
                _id: verification._id,
            });

            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please request a new OTP.",
                errors: {},
            });
        }

        if (
            verification.attempts >=
            MAX_OTP_ATTEMPTS
        ) {
            return res.status(429).json({
                success: false,
                message:
                    "Too many incorrect OTP attempts. Please request a new OTP.",
                errors: {},
            });
        }

        const valid = verifyOtp(
            otp,
            verification.otp_hash
        );

        if (!valid) {
            verification.attempts += 1;
            await verification.save();

            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
                errors: {},
            });
        }

        const verificationTokenId =
            crypto.randomUUID();

        verification.verified = true;
        verification.attempts = 0;
        verification.verification_token_id =
            verificationTokenId;

        await verification.save();

        const existingUser =
            method === "email"
                ? await User.findOne({
                    email:
                        normalizedIdentifier,
                })
                : await User.findOne({
                    phone:
                        normalizedIdentifier,
                });

        if (existingUser) {
            const token =
                generateAccessToken(
                    existingUser._id
                );

            return res.status(200).json({
                token,
                is_new_user: false,
            });
        }

        const token =
            generateRegistrationToken({
                method,
                identifier:
                    normalizedIdentifier,
                verificationTokenId,
            });

        return res.status(200).json({
            token,
            is_new_user: true,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * POST /api/v1/auth/register
 *
 * Registration requires the temporary
 * registration JWT returned by verify-otp.
 */
const registerUser = async (
    req,
    res,
    next
) => {
    try {
        const {
            full_name,
            date_of_birth,
            gender,
            password,
        } = req.body;

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith(
                "Bearer "
            )
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "OTP verification is required before registration.",
                errors: {},
            });
        }

        const registrationToken =
            authHeader
                .slice("Bearer ".length)
                .trim();

        let decoded;

        try {
            decoded = jwt.verify(
                registrationToken,
                getJwtSecret()
            );
        } catch (error) {
            return res.status(401).json({
                success: false,
                message:
                    "OTP verification is required before registration.",
                errors: {},
            });
        }

        if (
            decoded.type !==
            "registration"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid registration token.",
                errors: {},
            });
        }

        const verification =
            await OtpVerification.findOne({
                method: decoded.method,
                identifier:
                    decoded.identifier,
                verification_token_id:
                    decoded.verification_token_id,
                verified: true,
            });

        if (!verification) {
            return res.status(401).json({
                success: false,
                message:
                    "OTP verification is required before registration.",
                errors: {},
            });
        }

        const existingUser =
            decoded.method === "email"
                ? await User.findOne({
                    email:
                        decoded.identifier,
                })
                : await User.findOne({
                    phone:
                        decoded.identifier,
                });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this identifier.",
                errors: {},
            });
        }

        const hashedPassword =
            await hashPassword(password);

        const userData = {
            name: full_name.trim(),
            password: hashedPassword,
        };

        if (
            decoded.method ===
            "email"
        ) {
            userData.email =
                decoded.identifier;
        } else {
            userData.phone =
                decoded.identifier;
        }

        const user =
            await User.create(userData);

        await OtpVerification.deleteOne({
            _id: verification._id,
        });

        return res.status(201).json({
            user: sanitizeUser(user),
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * POST /api/v1/auth/login
 */
const loginUser = async (
    req,
    res,
    next
) => {
    try {
        const {
            identifier,
            password,
        } = req.body;

        const normalizedIdentifier =
            identifier
                .trim()
                .toLowerCase();

        const user =
            await User.findOne({
                $or: [
                    {
                        email:
                            normalizedIdentifier,
                    },
                    {
                        phone:
                            identifier.trim(),
                    },
                ],
            }).select(
                "+password"
            );

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials.",
                errors: {},
            });
        }

        const passwordMatches =
            await comparePassword(
                password,
                user.password
            );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials.",
                errors: {},
            });
        }

        const token =
            generateAccessToken(
                user._id
            );

        return res.status(200).json({
            token,
            user: sanitizeUser(user),
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (
    req,
    res,
    next
) => {
    try {
        const { identifier } =
            req.body;

        const normalizedIdentifier =
            identifier
                .trim()
                .toLowerCase();

        const user =
            await User.findOne({
                $or: [
                    {
                        email:
                            normalizedIdentifier,
                    },
                    {
                        phone:
                            identifier.trim(),
                    },
                ],
            });

        /*
         * Do not reveal whether an account
         * exists.
         */
        if (user) {
            const resetToken =
                generatePasswordResetToken(
                    user._id
                );

            if (
                process.env.NODE_ENV !==
                "production"
            ) {
                console.log(
                    JSON.stringify({
                        type:
                            "password_reset_requested",
                        identifier:
                            normalizedIdentifier,
                        token:
                            resetToken,
                    })
                );
            }

            /*
             * Delivery of the password-reset
             * token belongs to the email/SMS
             * provider integration.
             */
        }

        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * POST /api/v1/auth/reset-password
 */
const resetPassword = async (
    req,
    res,
    next
) => {
    try {
        const {
            token,
            new_password,
        } = req.body;

        let decoded;

        try {
            decoded = jwt.verify(
                token,
                getJwtSecret()
            );
        } catch (error) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid or expired reset token.",
                errors: {},
            });
        }

        if (
            decoded.type !==
            "password_reset"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid password reset token.",
                errors: {},
            });
        }

        const user =
            await User.findById(
                decoded.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
                errors: {},
            });
        }

        user.password =
            await hashPassword(
                new_password
            );

        await user.save();

        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    requestOtp,
    verifyOtp: verifyOtpCode,
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};
