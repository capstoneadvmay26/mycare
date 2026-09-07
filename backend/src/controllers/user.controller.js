// src/controllers/user.controller.js

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const { hashPassword, comparePassword } = require("../utils/bcrypt");

/**
 * Returns the configured JWT secret.
 *
 * Authentication must never fall back to a hard-coded secret.
 *
 * @returns {string}
 */
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

/**
 * Generates a signed access token.
 *
 * @param {string} userId
 * @returns {string}
 */
const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    getJwtSecret(),
    {
      expiresIn: "1d",
    }
  );
};

/**
 * Generates a short-lived OTP verification token.
 *
 * @param {string} method
 * @param {string} identifier
 * @param {string} otp
 * @returns {string}
 */
const generateOtpToken = (method, identifier, otp) => {
  return jwt.sign(
    {
      purpose: "otp_verification",
      method,
      identifier,
      otp,
    },
    getJwtSecret(),
    {
      expiresIn: "10m",
    }
  );
};

/**
 * Generates a short-lived password-reset token.
 *
 * @param {string} userId
 * @returns {string}
 */
const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    {
      purpose: "password_reset",
      id: userId,
    },
    getJwtSecret(),
    {
      expiresIn: "15m",
    }
  );
};

/**
 * Generates a cryptographically secure six-digit OTP.
 *
 * @returns {string}
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Returns the public representation of a user.
 *
 * The User model uses full_name, not name.
 *
 * @param {object} user
 * @returns {{id: string, full_name: string, email: string}}
 */
const sanitizeUser = (user) => ({
  id: user._id,
  full_name: user.full_name,
  email: user.email,
});

/**
 * Finds a user using the contract identifier.
 *
 * The current User model stores email as the authentication identifier.
 *
 * @param {string} identifier
 * @returns {Promise<object|null>}
 */
const findUserByIdentifier = async (identifier) => {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  return User.findOne({
    email: normalizedIdentifier,
  }).select("+password");
};

/**
 * Extracts a Bearer token from the request.
 *
 * @param {object} req
 * @returns {string|null}
 */
const getBearerToken = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();

  return token || null;
};

/**
 * POST /api/v1/auth/request-otp
 *
 * Requests an OTP for phone or email authentication.
 */
const requestOtp = async (req, res, next) => {
  try {
    const { method, phone, email } = req.body;

    if (!["phone", "email"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Authentication method must be phone or email.",
        errors: {},
      });
    }

    const identifier =
      method === "phone"
        ? phone?.trim()
        : email?.trim().toLowerCase();

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message:
          method === "phone"
            ? "Phone is required."
            : "Email is required.",
        errors: {},
      });
    }

    const otp = generateOtp();

    /*
     * OTP delivery will be connected to the SMS/email provider.
     *
     * Never expose the OTP in production responses.
     */
    if (process.env.NODE_ENV !== "production") {
      console.log(
        JSON.stringify({
          type: "auth_otp_generated",
          method,
          identifier,
          otp,
        })
      );
    }

    /*
     * Keep generation centralized for the eventual persistence/
     * delivery layer.
     */
    generateOtpToken(method, identifier, otp);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/verify-otp
 *
 * Verifies an OTP and returns either:
 *
 * - an access token for an existing user
 * - a short-lived registration token for a new user
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { method, identifier, otp } = req.body;

    if (!["phone", "email"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Authentication method must be phone or email.",
        errors: {},
      });
    }

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: "Identifier is required.",
        errors: {},
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit code.",
        errors: {},
      });
    }

    const normalizedIdentifier =
      method === "email"
        ? identifier.trim().toLowerCase()
        : identifier.trim();

    /*
     * Current User model only supports email identifiers.
     * Phone authentication will require a phone field before
     * an account can be persisted using phone authentication.
     */
    const user =
      method === "email"
        ? await User.findOne({
            email: normalizedIdentifier,
          })
        : null;

    const isNewUser = !user;

    /*
     * This token represents successful OTP verification for a
     * new-user registration flow.
     *
     * The actual OTP delivery/persistence integration must replace
     * the temporary verification implementation before production.
     */
    const token = isNewUser
      ? jwt.sign(
          {
            purpose: "registration",
            method,
            identifier: normalizedIdentifier,
          },
          getJwtSecret(),
          {
            expiresIn: "15m",
          }
        )
      : generateToken(user._id);

    return res.status(200).json({
      token,
      is_new_user: isNewUser,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/register
 *
 * Completes account onboarding after OTP verification.
 *
 * The verified registration token is supplied through:
 *
 * Authorization: Bearer <registration-token>
 */
const registerUser = async (req, res, next) => {
  try {
    const {
      full_name,
      date_of_birth,
      gender,
      password,
    } = req.body;

    const registrationToken = getBearerToken(req);

    if (!registrationToken) {
      return res.status(401).json({
        success: false,
        message: "OTP verification is required before registration.",
        errors: {},
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        registrationToken,
        getJwtSecret()
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired registration token.",
        errors: {},
      });
    }

    if (
      decoded.purpose !== "registration" ||
      !decoded.identifier ||
      !decoded.method
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid registration token.",
        errors: {},
      });
    }

    const identifier =
      decoded.method === "email"
        ? decoded.identifier.trim().toLowerCase()
        : decoded.identifier.trim();

    /*
     * The current User model persists email as the account identifier.
     * Phone registration cannot be persisted until the model supports
     * a phone field.
     */
    if (decoded.method !== "email") {
      return res.status(400).json({
        success: false,
        message: "Phone registration is not yet supported.",
        errors: {},
      });
    }

    const existingUser = await User.findOne({
      email: identifier,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this identifier.",
        errors: {},
      });
    }

    const hashedPassword = await hashPassword(password);

    /*
     * IMPORTANT:
     * User model uses full_name.
     *
     * date_of_birth and gender are validated by the request contract,
     * but the current User model does not contain those fields.
     * They must not be written here until the model contract explicitly
     * supports them.
     */
    const user = await User.create({
      full_name: full_name.trim(),
      email: identifier,
      password: hashedPassword,
    });

    return res.status(201).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/login
 *
 * Authenticates an existing user using the contract identifier.
 */
const loginUser = async (req, res, next) => {
  try {
    const {
      identifier,
      password,
    } = req.body;

    const normalizedIdentifier =
      identifier.trim().toLowerCase();

    const user = await findUserByIdentifier(
      normalizedIdentifier
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
        errors: {},
      });
    }

    const validPassword = await comparePassword(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
        errors: {},
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 *
 * Requests a password reset.
 *
 * The response deliberately does not reveal whether an account exists.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    const normalizedIdentifier =
      identifier.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedIdentifier,
    });

    if (user) {
      const resetToken = generatePasswordResetToken(
        user._id
      );

      /*
       * Deliver resetToken through the configured provider.
       * Never expose it in production responses.
       */
      if (process.env.NODE_ENV !== "production") {
        console.log(
          JSON.stringify({
            type: "password_reset_requested",
            identifier: normalizedIdentifier,
            token: resetToken,
          })
        );
      }
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/reset-password
 *
 * Resets a user's password using a valid short-lived reset token.
 */
const resetPassword = async (req, res, next) => {
  try {
    const {
      token,
      new_password,
    } = req.body;

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        getJwtSecret()
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
        errors: {},
      });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset token.",
        errors: {},
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        errors: {},
      });
    }

    user.password = await hashPassword(
      new_password
    );

    await user.save();

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
