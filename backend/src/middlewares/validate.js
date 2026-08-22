// A reuseable middleware factory for JOI validation - one file validates
// any schema you pass in, for any route (profile, medications, etc.).

function validate(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.dtails.map((detail) => ({
                field: detail.path.join(""),
                message: detail.message.replace(/"/g, ""),
            }));

            return res.status(400).json ({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        next();
    };
}

module.exports = validate;