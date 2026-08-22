// Each USER can own multiple profiles.
// Every profile has an owner files linking back to the user.

const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        // the account that manage this profile. One user can own several
        // profiles: their own, plus any dependents they're tracking.
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            minilength: 2,
        },

        // true = this profile is the account holder themselves
        // false = this is a dependent (child, parent, etc. ) they manage
        isSelf: {
            type: Boolean,
            default: false,
        },

        // Required for dependents so it's clear who are to the owner
        // Not required when isSelf is true ( you don't need to say your
        // "relationship" to yourself).
        relationship: {
            type: String,
            trim: true,
            required: function () {
                return this.isSelf === false;
            },
        },

        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other","prefer_not_to_say"],
        },

        // Soft delete - "deleting" a profile set this to "archived" instead
        // of actually removing it, preserving medication history uderneath.
        status: {
            type: String,
            enum: ["active", "archived"],
            default: "active",
        },
    },
    { timestamps: true}
);

module.exports = mongoose.model("Profile", profileSchema);