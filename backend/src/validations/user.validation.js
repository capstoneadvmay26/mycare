// Validates registration payload fields.
const validateRegister = (req, res, next) => {
    const { name, email, phone, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({
            message: "Name and password are required.",
        });
    }

    if (!email && !phone) {
        return res.status(400).json({
            message: "Either email or phone number is required.",
        });
    }

    if (email && phone) {
        return res.status(400).json({
            message: "Provide either email or phone number, not both.",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters long.",
        });
    }

    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
        return res.status(400).json({
            message: "Phone number must be in international format, e.g. +2348012345678.",
        });
    }

    next();
};

// Validates login payload fields.
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required.",
        });
    }

    next();
};

// Validates OTP verification.
const validateVerifyOtp = (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            message: "Email and OTP are required.",
        });
    }

    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
            message: "OTP must be a 6-digit number.",
        });
    }

    next();
};

// Validates OTP resend.
const validateResendOtp = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email or phone number is required.",
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateVerifyOtp,
    validateResendOtp,
};