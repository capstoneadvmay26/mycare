// src/validations/user.validation.js

const Joi = require("joi");

// Email or phone identifier.
const identifierSchema = Joi.string()
    .trim()
    .min(3)
    .max(254)
    .required();

// Registration validation.
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

// Login validation.
const loginUserSchema = Joi.object({

    identifier:
        identifierSchema,

    password: Joi.string()
        .min(8)
        .max(128)
        .required(),
}).required();

// Request OTP validation.
const requestOtpSchema = Joi.object({
    method: Joi.string()
        .valid(
            "email",
            "phone"
        )
        .required(),

    email: Joi.when("method", {
        is: "email",
        then: Joi.string()
            .trim()
            .lowercase()
            .email()
            .required(),
        otherwise:
            Joi.forbidden(),

    }),

    phone: Joi.when("method", {
        is: "phone",
        then: Joi.string()
            .trim()
            .pattern(
                /^\+[1-9]\d{7,14}$/
            )
            .required(),

        otherwise:
            Joi.forbidden(),

    }),
}).required();

// Verify OTP validation.
const verifyOtpSchema = Joi.object({

    method: Joi.string()
        .valid(
            "email",
            "phone"
        )
        .required(),

    identifier:
        identifierSchema,

    otp: Joi.string()
        .pattern(
            /^\d{6}$/
        )
        .required(),

}).required();

// Forgot password validation.
const forgotPasswordSchema = Joi.object({

    identifier:
        identifierSchema,

}).required();

// Reset password validation.
const resetPasswordSchema = Joi.object({

    token: Joi.string()
        .trim()
        .required(),

  new_password: Joi.string()
    .min(8)
    .max(128)
    .required(),
})
  .required()
  .unknown(false);

module.exports = {
    registerUserSchema,
    loginUserSchema,
    requestOtpSchema,
    verifyOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};
