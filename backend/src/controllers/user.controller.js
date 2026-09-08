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


/**
 * Get JWT secret.
 */
const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET is not configured."
        );
    }

    return process.env.JWT_SECRET;
};


/**
 * Generate normal login JWT.
 */
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


/**
 * Generate temporary registration JWT.
 *
 * This token proves that the user successfully
 * verified the OTP before completing registration.
 */
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


/**
 * Generate password reset JWT.
 */
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


/**
 * Return only safe user information.
 */
const sanitizeUser = (user) => ({
    id: user._id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    contactMethod: user.contactMethod,
    date_of_birth: user.date_of_birth,
    gender: user.gender,
    isVerified: user.isVerified,
});


/**
 * Normalize email or phone identifier.
 */
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


/**
 * Extract Bearer token from request headers.
 */
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
 *
 * Sends an OTP to email or phone.
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


        /**
         * Check whether an account already exists
         * with the requested email or phone.
         */
        const existingUser =
            method === "email"
                ? await User.findOne({
                    email: identifier,
                })
                : await User.findOne({
                    phone: identifier,
                });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this identifier. Please log in.",
                errors: {},
            });
        }


        /**
         * Check for an existing OTP record.
         */
        const existingVerification =
            await OtpVerification
                .findOne({
                    method,
                    identifier,
                })
                .select(
                    "+otp_hash"
                );


        /**
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


        /**
         * Generate a new OTP.
         */
        const otp =
            generateOtp();

        const expiresAt =
            new Date(
                Date.now() +
                    OTP_EXPIRY_MINUTES *
                    60 *
                    1000
            );


        /**
         * Create or update the OTP record.
         */
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

                verification_token_id:
                    null,
            });
        }


        /**
         * Send OTP using Brevo HTTP API.
         */
        try {
            await sendOtp({
                method,
                identifier,
                otp,
            });

        } catch (error) {

            /**
             * If delivery fails, remove the OTP
             * so the user can request another one.
             */
            await OtpVerification.deleteOne({
                method,
                identifier,
            });

            throw error;
        }


        /**
         * Never expose the OTP in the API response.
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
            message:
                "OTP sent successfully.",
        });

    } catch (error) {
        return next(error);
    }
};


/**
 * POST /api/v1/auth/verify-otp
 *
 * Verifies the OTP.
 *
 * New user:
 *     returns temporary registration token.
 *
 * Existing user:
 *     returns normal login token.
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


        /**
         * Check expiration.
         */
        if (
            verification.expires_at <=
            new Date()
        ) {
            await OtpVerification.deleteOne({
                _id:
                    verification._id,
            });

            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please request a new OTP.",
                errors: {},
            });
        }


        /**
         * Limit incorrect attempts.
         */
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


        /**
         * Compare submitted OTP with
         * stored hashed OTP.
         */
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


        /**
         * OTP is valid.
         */
        const verificationTokenId =
            crypto.randomUUID();

        verification.verified =
            true;

        verification.attempts =
            0;

        verification.verification_token_id =
            verificationTokenId;

        await verification.save();


        /**
         * Check whether an account already exists.
         */
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


        /**
         * Existing user:
         * return normal login token.
         */
        if (
            existingUser
        ) {
            return res.status(200).json({
                token:
                    generateToken(
                        existingUser._id
                    ),

                is_new_user: false,

                user:
                    sanitizeUser(
                        existingUser
                    ),
            });
        }


        /**
         * New user:
         * return temporary registration token.
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
 *
 * Completes registration after successful OTP verification.
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


        /**
         * Registration requires the temporary
         * token returned by verify-otp.
         */
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


        /**
         * Confirm that this is actually
         * a registration token.
         */
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


        /**
         * Confirm that the OTP verification
         * still exists and belongs to this token.
         */
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


        /**
         * Check whether an account was created
         * with this email or phone in the meantime.
         */
        const existingUser =
            decoded.method === "email"
                ? await User.findOne({
                    email: identifier,
                })
                : await User.findOne({
                    phone: identifier,
                });


        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this identifier.",
                errors: {},
            });
        }


        /**
         * Create the verified user.
         */
        const user =
            await User.create({
                full_name:
                    full_name.trim(),

                email:
                    decoded.method === "email"
                        ? identifier
                        : undefined,

                phone:
                    decoded.method === "phone"
                        ? identifier
                        : undefined,

                password:
                    await hashPassword(
                        password
                    ),

                contactMethod:
                    decoded.method,

                isVerified: true,

                date_of_birth:
                    date_of_birth ||
                    undefined,

                gender:
                    gender ||
                    undefined,
            });


        /**
         * Make the registration token
         * one-time use.
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
 *
 * Login using email or phone through
 * the frontend's "identifier" field.
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


        /**
         * identifier can be either
         * email or phone.
         */
        const query =
            normalizedIdentifier.includes("@")
                ? {
                    email:
                        normalizedIdentifier,
                }
                : {
                    phone:
                        normalizedIdentifier,
                };


        const user =
            await User.findOne(
                query
            ).select(
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


        /**
         * Make sure the account completed
         * OTP verification.
         */
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message:
                    "Please verify your account with OTP first.",
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
 *
 * Current implementation keeps the existing
 * reset-token behavior.
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


        const user =
            await User.findOne({
                email:
                    normalizedIdentifier,
            });


        /**
         * Never disclose whether
         * an account exists.
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
    verifyOtp,
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};