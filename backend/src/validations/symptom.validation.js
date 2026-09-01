const Joi = require("joi");

const createSymptomSchema = Joi.object({
    profile_id: Joi.string().required(),

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

const doctorFollowUpSchema = Joi.object({
    symptomId: Joi.string().required(),

    response: Joi.string()
        .valid("yes", "no", "remind_later")
        .required(),
});

const updateSymptomSchema = Joi.object({
    symptoms: Joi.array()
        .items(Joi.string().trim().min(1))
        .min(1)
        .optional(),

    otherSymptom: Joi.string()
        .trim()
        .min(1)
        .optional(),

    severity: Joi.string()
        .valid("mild", "moderate", "severe", "very_severe")
        .optional(),
}).min(1);

module.exports = {
    createSymptomSchema,
    checkInSchema,
    doctorFollowUpSchema,
    updateSymptomSchema
};
