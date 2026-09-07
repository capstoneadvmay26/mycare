// src/routes/user.route.js

const express = require("express");

const {
    registerUser,
    loginUser,
} = require("../controllers/user.controller");

const requireAuth = require("../middlewares/requireAuth");
const validate = require("../middlewares/validate");

const {
    registerUserSchema,
    loginUserSchema,
} = require("../validations/user.validation");

const router = express.Router();

// ------------------------------------------------------------
// Public authentication endpoints
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
// Protected authentication endpoint
// ------------------------------------------------------------

router.get(
    "/me",
    requireAuth,
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Authorized user access granted.",
            data: {
                user: req.user,
            },
        });
    }
);

module.exports = router;
