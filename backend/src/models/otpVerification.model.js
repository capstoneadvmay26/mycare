// src/models/otpVerification.model.js

const mongoose = require("mongoose");
const crypto = require("crypto");

const otpVerificationSchema =
  new mongoose.Schema(
    {
      _id: {
        type: String,
        default: () => crypto.randomUUID(),
      },

      method: {
        type: String,
        enum: ["email", "phone"],
        required: true,
        index: true,
      },

      identifier: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      otp_hash: {
        type: String,
        required: true,
        select: false,
      },

      expires_at: {
        type: Date,
        required: true,
        index: true,
      },

      attempts: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },

      last_sent_at: {
        type: Date,
        required: true,
      },

      verified: {
        type: Boolean,
        required: true,
        default: false,
      },

      verification_token_id: {
        type: String,
        default: null,
        index: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

otpVerificationSchema.index(
  {
    method: 1,
    identifier: 1,
  },
  {
    unique: true,
  }
);

otpVerificationSchema.index(
  {
    expires_at: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

module.exports =
  mongoose.models.OtpVerification ||
  mongoose.model(
    "OtpVerification",
    otpVerificationSchema
  );
