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

const router = express.Router();

/**
 * OTP
 *
 * Public onboarding endpoints.
 */
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

/**
 * Registration
 *
 * Requires the temporary registration JWT returned
 * by successful OTP verification.
 */
router.post(
  "/register",
  validate(registerUserSchema),
  registerUser
);

/**
 * Standard login.
 */
router.post(
  "/login",
  validate(loginUserSchema),
  loginUser
);

/**
 * Password recovery.
 */
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

module.exports = router;
