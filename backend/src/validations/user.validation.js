// src/validations/user.validation.js

const Joi = require("joi");

const registerUserSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .min(8)
        .max(128)
        .required(),
}).required();

const loginUserSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .min(8)
        .max(128)
        .required(),
}).required();

module.exports = {
    registerUserSchema,
    loginUserSchema,
};
