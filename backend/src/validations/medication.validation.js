const Joi = require("joi");

const createMedicationSchema = Joi.object({
    profileId: Joi.string().required(),
    name: Joi.string().min(1).max(150).required(),
    dosage: Joi.string().min(1).max(50).required(),
    frequency: Joi.string()
    .valid("once_daily", "twice_daily", "three_times_daily", "weekly", "as_needed")
    .required(),
    scheduleTime: Joi.array().items(Joi.string()).optional(),
    startDate:Joi.date().required(),
    endDate: Joi.date().optional().allow(null),
});

const updateMedicationSchema = Joi.object({
    name: Joi.string().min(1).max(150).optional(),
    dosage: Joi.string().min(1).max(50).optional(),
    frequency: Joi.string()
    .valid("once_daily", "twice_daily", "three_times_daily", "weekly", "as_needed")
    .optional(),
    scheduleTime: Joi.array().items(Joi.string()).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional().allow(null),
});

module.exports = { createMedicationSchema, updateMedicationSchema };