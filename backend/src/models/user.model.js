// MINIMAl bootstrap User model - only what's needed for Profiles/Medicatiions
// to reference an owner and for tests to create real accounts. The
// feature/auth branch may build this out further (e.g. phone, roles);
// reconcile fiels names with that branch before merging to main.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true, // stored as a bcrypt hash, never a plain text
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
