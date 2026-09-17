const express = require("express");

const {
    registerFcmToken,
    unregisterFcmToken,
} = require("../controllers/notification.controller");

const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.post(
    "/register-token",
    registerFcmToken
);

router.delete(
    "/register-token",
    unregisterFcmToken
);

module.exports = router;
