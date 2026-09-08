const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyRegistrationOtp, resendRegistrationOtp, } = require('../controllers/user.controller');
const { validateRegister, validateLogin, validateVerifyOtp, validateResendOtp, loginUserSchema, registerUserSchema } = require('../validations/user.validation');
const requireAuth = require('../middlewares/requireAuth');
const { validate } = require('../models/otpVerification.model');

// Public endpoints
router.post(
    "/register",
    validate(registerUserSchema),
    registerUser
);
router.post('/login', validate(loginUserSchema), loginUser);
router.post("/verify-otp", validateVerifyOtp, verifyRegistrationOtp);
router.post("/resend-otp", validateResendOtp, resendRegistrationOtp);

// Protected endpoint sample (verifies auth middleware)
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    message: 'Authorized user access granted.',
    user: req.user,
  });
});

module.exports = router;
