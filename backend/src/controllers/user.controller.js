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
    hashPassword,
    comparePassword,
} = require("../utils/bcrypt");

const {
    generateOtp,
    hashOtp,
    verifyOtp: verifyOtpCode,
} = require("../utils/otp");

const {
    sendOtp,
} = require("../utils/otpSender");

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
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET is not configured."
        );
    }

    return process.env.JWT_SECRET;
    return process.env.JWT_SECRET;
};

const generateToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
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
            purpose: "registration",
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
            purpose: "password_reset",
            id: userId,
        },
        getJwtSecret(),
        {
            expiresIn:
                `${PASSWORD_RESET_TOKEN_MINUTES}m`,
        }
    );
};

const sanitizeUser = (user) => ({
    id: user._id,
    full_name: user.full_name,
    email: user.email,
});

const normalizeIdentifier = (
    method,
    identifier
) => {
    const value =
        identifier.trim();

    return method === "email"
        ? value.toLowerCase()
        : value;
};

const getBearerToken = (req) => {
    const authorization =
        req.headers.authorization;

    if (
        !authorization ||
        !authorization.startsWith(
            "Bearer "
        )
    ) {
        return null;
    }

    const token =
        authorization
            .slice("Bearer ".length)
            .trim();

    return token || null;
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

        const identifier =
            normalizeIdentifier(
                method,
                method === "email"
                    ? email
                    : phone
            );

        /*
         * Do not allow OTP registration for
         * an already verified account.
         */
        const existingUser =
            method === "email"
                ? await User.findOne({
                    email: identifier,
                })
                : null;

        if (
            existingUser
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this identifier. Please log in.",
                errors: {},
            });
        }

        const existingVerification =
            await OtpVerification
                .findOne({
                    method,
                    identifier,
                })
                .select(
                    "+otp_hash"
                );

        /*
         * Prevent OTP spam.
         */
        if (
            existingVerification &&
            existingVerification.last_sent_at &&
            Date.now() -
                existingVerification
                    .last_sent_at
                    .getTime() <
                OTP_RESEND_COOLDOWN_SECONDS *
                    1000
        ) {
            return res.status(429).json({
                success: false,
                message:
                    "Please wait before requesting another OTP.",
                errors: {},
            });
        }

        const otp =
            generateOtp();

        const expiresAt =
            new Date(
                Date.now() +
                    OTP_EXPIRY_MINUTES *
                    60 *
                    1000
            );

        if (
            existingVerification
        ) {
            existingVerification.otp_hash =
                hashOtp(otp);

            existingVerification.expires_at =
                expiresAt;

            existingVerification.attempts =
                0;

            existingVerification.last_sent_at =
                new Date();

            existingVerification.verified =
                false;

            existingVerification.verification_token_id =
                null;

            await existingVerification.save();
        } else {
            await OtpVerification.create({
                method,
                identifier,
                otp_hash:
                    hashOtp(otp),
                expires_at:
                    expiresAt,
                attempts: 0,
                last_sent_at:
                    new Date(),
                verified: false,
            });
        }

        /*
         * Delivery is part of the request flow.
         * If delivery fails, remove the pending
         * verification record so the user can retry.
         */
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

            throw error;
        }

        /*
         * Never expose the OTP through the HTTP
         * response.
         *
         * Local development logging is useful for
         * testing when an email provider is configured.
         */
        if (
            process.env.NODE_ENV !==
            "production"
        ) {
            console.log(
                JSON.stringify({
                    type:
                        "auth_otp_generated",
                    method,
                    identifier,
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
const verifyOtp = async (
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
            await OtpVerification
                .findOne({
                    method,
                    identifier:
                        normalizedIdentifier,
                })
                .select(
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

        if (
            verification.verified
        ) {
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

        const valid =
            verifyOtpCode(
                otp,
                verification.otp_hash
            );

        if (!valid) {
            verification.attempts += 1;

            await verification.save();

            return res.status(400).json({
                success: false,
                message:
                    "Invalid OTP.",
                errors: {},
            });
        }

        const verificationTokenId =
            crypto.randomUUID();

        verification.verified =
            true;

        verification.attempts = 0;

        verification.verification_token_id =
            verificationTokenId;

        await verification.save();

        /*
         * Existing email account:
         * successful OTP verification produces
         * an access token.
         */
        const existingUser =
            method === "email"
                ? await User.findOne({
                    email:
                        normalizedIdentifier,
                })
                : null;

        if (
            existingUser
        ) {
            return res.status(200).json({
                token:
                    generateToken(
                        existingUser._id
                    ),
                is_new_user: false,
            });
        }

        /*
         * New account:
         * OTP verification produces a temporary
         * registration token.
         */
        return res.status(200).json({
            token:
                generateRegistrationToken({
                    method,
                    identifier:
                        normalizedIdentifier,
                    verificationTokenId,
                }),
            is_new_user: true,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * POST /api/v1/auth/register
 */
const registerUser = async (
    req,
    res,
    next
) => {
    try {
        const {
            full_name,
            password,
        } = req.body;

        const registrationToken =
            getBearerToken(req);

        if (!registrationToken) {
            return res.status(401).json({
                success: false,
                message:
                    "OTP verification is required before registration.",
                errors: {},
            });
        }

        let decoded;

        try {
            decoded =
                jwt.verify(
                    registrationToken,
                    getJwtSecret()
                );
        } catch {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid or expired registration token.",
                errors: {},
            });
        }

        if (
            decoded.purpose !==
                "registration" ||
            !decoded.method ||
            !decoded.identifier ||
            !decoded.verification_token_id
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid registration token.",
                errors: {},
            });
        }

        const identifier =
            normalizeIdentifier(
                decoded.method,
                decoded.identifier
            );

        const verification =
            await OtpVerification.findOne({
                method:
                    decoded.method,

                identifier,

                verified: true,

                verification_token_id:
                    decoded.verification_token_id,
            });

        if (!verification) {
            return res.status(401).json({
                success: false,
                message:
                    "OTP verification is required before registration.",
                errors: {},
            });
        }

        if (
            decoded.method !==
            "email"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Phone registration is not yet supported.",
                errors: {},
            });
        }

        const existingUser =
            await User.findOne({
                email: identifier,
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this identifier.",
                errors: {},
            });
        }
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this identifier.",
                errors: {},
            });
        }

        const user =
            await User.create({
                full_name:
                    full_name.trim(),
                email: identifier,
                password:
                    await hashPassword(
                        password
                    ),
            });

        /*
         * Registration token is one-time use.
         */
        await OtpVerification.deleteOne({
            _id:
                verification._id,
        });

        return res.status(201).json({
            user:
                sanitizeUser(
                    user
                ),
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
                email:
                    normalizedIdentifier,
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
        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials.",
                errors: {},
            });
        }

        const passwordValid =
            await comparePassword(
                password,
                user.password
            );

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials.",
                errors: {},
            });
        }

        return res.status(200).json({
            token:
                generateToken(
                    user._id
                ),
            user:
                sanitizeUser(
                    user
                ),
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
        const {
            identifier,
        } = req.body;

        const normalizedIdentifier =
            identifier
                .trim()
                .toLowerCase();
        const normalizedIdentifier =
            identifier
                .trim()
                .toLowerCase();

        const user =
            await User.findOne({
                email:
                    normalizedIdentifier,
            });

        /*
         * Never disclose whether the account
         * exists.
         */
        if (user) {
            const token =
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
                        token,
                    })
                );
            }
        }

        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
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
        let decoded;

        try {
            decoded =
                jwt.verify(
                    token,
                    getJwtSecret()
                );
        } catch {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid or expired reset token.",
                errors: {},
            });
        }

        if (
            decoded.purpose !==
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
        user.password =
            await hashPassword(
                new_password
            );

        await user.save();
        await user.save();

        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    requestOtp,
    verifyOtp,
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};
