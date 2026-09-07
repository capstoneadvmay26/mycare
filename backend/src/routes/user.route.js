// src/routes/user.route.js

const express = require("express");

const {
    requestOtp,
    verifyOtp,
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
} = require("../controllers/user.controller");

const validate = require("../middlewares/validate");

const {
    requestOtpSchema,
    verifyOtpSchema,
    registerUserSchema,
    loginUserSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} = require("../validations/user.validation");

const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

// ------------------------------------------------------------
// OTP
// ------------------------------------------------------------

router.post(
    "/request-otp",
    validate(requestOtpSchema),
    requestOtp
);

router.post(
    "/verify-otp",
    validate(verifyOtpSchema),
    verifyOtp
);

// ------------------------------------------------------------
// Registration / Login
// ------------------------------------------------------------

router.post(
    "/register",
    validate(registerUserSchema),
    registerUser
);

router.post(
    "/login",
    validate(loginUserSchema),
    loginUser
);

// ------------------------------------------------------------
// Password recovery
// ------------------------------------------------------------

router.post(
    "/forgot-password",
    validate(forgotPasswordSchema),
    forgotPassword
);

router.post(
    "/reset-password",
    validate(resetPasswordSchema),
    resetPassword
);

// ------------------------------------------------------------
// Authenticated user
// ------------------------------------------------------------

router.get(
    "/me",
    requireAuth,
    (req, res) => {
        return res.status(200).json({
            success: true,
            message:
                "Authorized user access granted.",
            data: {
                user: req.user,
            },
        });
    }
);

module.exports = router;
