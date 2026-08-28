const Joi = require("joi");

const createSymptomSchema = Joi.object({
    profileId: Joi.string().required(),

    symptoms: Joi.array()
        .items(Joi.string().trim().min(1))
        .min(1)
        .required(),

    otherSymptom: Joi.string()
        .trim()
        .min(1)
        .optional(),

    severity: Joi.string()
        .valid("mild", "moderate", "severe", "very_severe")
        .required(),
});

const checkInSchema = Joi.object({
    status: Joi.string()
        .valid("better", "same", "worse")
        .required(),
});

module.exports = {
    createSymptomSchema,
    checkInSchema
};