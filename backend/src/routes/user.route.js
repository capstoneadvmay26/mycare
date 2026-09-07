const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyRegistrationOtp, resendRegistrationOtp, } = require('../controllers/user.controller');
const { validateRegister, validateLogin, validateVerifyOtp, validateResendOtp } = require('../validations/user.validation');
const requireAuth = require('../middlewares/requireAuth');

// Public endpoints
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
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