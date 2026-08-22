const Joi = require("joi");

const createProfileSchema = Joi.object({
    fullNamr: Joi.string().min(2).max(100).required(),
    isSelf: Joi.boolean().optional(),
    relationship: Joi.string().when("isSelf", {
        is: false,
        then: Joi.required(),
        otherwise: Joi.optional().allow(null, ""),
    }),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string()
    .valid("male","female", "other", "prefer_not_to_say")
    .optional(),
});

const updateProfileSchema = Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    relationship: Jpi.string().optional().allow(null, ""),
    gender: Joi.string()
    .valid("male", "female", "other", "prefer_not_to_say")
    .optional(),
});

module.exports = { createProfileSchema, updateProfileSchema };