const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/bcrypt');

// In-memory OTP storage (or integrate your SMS/Email provider here)
const otpStore = new Map();

// Generates a signed JWT token valid for 1 day
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1d',
  });
};

// Generates and sends a 6-digit OTP //
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required to send OTP.' });
    }

    // Generate 6-digit code and store temporarily
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, otp);

    // Simulated SMS/Email sending step
    console.log(`[OTP Sent] Code for ${email} is ${otp}`);

    res.status(200).json({
      message: 'OTP sent successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Handles user registration with OTP verification//
 
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, otp } = req.body;

    // Verify OTP
    const validOtp = otpStore.get(email);
    if (!validOtp || validOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash password and store user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Clear OTP after successful registration
    otpStore.delete(email);

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Handles user login 
 
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtp,
  registerUser,
  loginUser,
};
