const Joi = require("joi");

const createProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  relationship: Joi.string().trim().required(),
  condition: Joi.string().trim().allow("", null).optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string()
    .valid("male", "female", "other", "prefer_not_to_say")
    .optional(),
}).custom((value, helpers) => {
  const relationship = value.relationship.toLowerCase();

  if (relationship === "self") {
    value.relationship = "Self";
    value.isSelf = true;
    return value;
  }

  if (!value.relationship.trim()) {
    return helpers.error("any.invalid");
  }

  value.isSelf = false;
  return value;
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  relationship: Joi.string().trim().optional(),
  condition: Joi.string().trim().allow("", null).optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string()
    .valid("male", "female", "other", "prefer_not_to_say")
    .optional(),
});

module.exports = {
  createProfileSchema,
  updateProfileSchema,
};
