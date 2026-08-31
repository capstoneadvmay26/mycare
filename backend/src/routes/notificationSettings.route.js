const express = require("express");

const {getNotificationSettings, updateNotificationSettings} = require("../controllers/notificationSettings.controller");

const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/settings/notifications", getNotificationSettings);

router.put("/settings/notifications", updateNotificationSettings);

module.exports = router;