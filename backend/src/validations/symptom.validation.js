const Joi = require("joi");

const createSymptomSchema = Joi.object({
    profile_id: Joi.string().required(),

    symptoms: Joi.array()
        .items(Joi.string().trim().min(1))
        .required(),

    otherSymptom: Joi.string()
        .trim()
        .min(1)
        .optional(),

    severity: Joi.string()
        .valid("mild", "moderate", "severe", "very_severe")
        .required(),
})
.custom((value, helpers) => {
    const hasSymptoms = value.symptoms.length > 0;
    const hasOtherSymptom =
        typeof value.otherSymptom === "string" &&
        value.otherSymptom.trim().length > 0;

    // At least one symptom must be provided.
    // "Others" is represented by otherSymptom instead.
    if (!hasSymptoms && !hasOtherSymptom) {
        return helpers.message(
            "Either a symptom must be selected or otherSymptom must be provided."
        );
    }

    return value;
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
