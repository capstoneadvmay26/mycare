// src/validations/user.validation.js

const Joi = require("joi");

/**
 * OTP request validation.
 *
 * The API accepts either:
 * - email + method=email
 * - phone + method=phone
 */
const requestOtpSchema = Joi.object({
    method: Joi.string()
        .valid("email", "phone")
        .required(),

    email: Joi.when("method", {
        is: "email",
        then: Joi.string()
            .trim()
            .lowercase()
            .email()
            .required(),
        otherwise: Joi.forbidden(),
    }),

    phone: Joi.when("method", {
        is: "phone",
        then: Joi.string()
            .trim()
            .pattern(/^\+[1-9]\d{7,14}$/)
            .required(),
        otherwise: Joi.forbidden(),
    }),
}).required();

/**
 * OTP verification validation.
 */
const verifyOtpSchema = Joi.object({
    method: Joi.string()
        .valid("email", "phone")
        .required(),

    identifier: Joi.string()
        .trim()
        .min(3)
        .max(254)
        .required(),

    otp: Joi.string()
        .pattern(/^\d{6}$/)
        .required(),
}).required();

/**
 * Registration happens AFTER OTP verification.
 *
 * The verified identifier is deliberately NOT accepted
 * from the request body. It comes from the OTP-issued
 * registration token.
 */
const registerUserSchema = Joi.object({
    full_name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    date_of_birth: Joi.date()
        .iso()
        .optional(),

    gender: Joi.string()
        .valid(
            "Male",
            "Female",
            "Other",
            "Prefer not to say",
            "male",
            "female",
            "other",
            "prefer_not_to_say"
        )
        .optional(),

    password: Joi.string()
        .min(8)
        .max(128)
        .required(),
}).required();

/**
 * Login accepts an email or phone identifier.
 */
const loginUserSchema = Joi.object({
    identifier: Joi.string()
        .trim()
        .min(3)
        .max(254)
        .required(),

    password: Joi.string()
        .min(8)
        .max(128)
        .required(),
}).required();

/**
 * Password recovery.
 */
const forgotPasswordSchema = Joi.object({
    identifier: Joi.string()
        .trim()
        .min(3)
        .max(254)
        .required(),
}).required();

/**
 * Password reset.
 */
const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .trim()
        .required(),

    new_password: Joi.string()
        .min(8)
        .max(128)
        .required(),
}).required();

module.exports = {
    requestOtpSchema,
    verifyOtpSchema,
    registerUserSchema,
    loginUserSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};
