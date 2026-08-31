const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const NotificationSettingsModel = require("../src/models/notificationSettings.model");

const {
    connectTestDB,
    closeTestDB,
    clearTestDB,
} = require("./setup");


beforeAll(async () => {
    await connectTestDB();
});

afterEach(async () => {
    await clearTestDB();
});

afterAll(async () => {
    await closeTestDB();
});


describe("Notification Settings API", () => {

    let userId;
    let token;


    // Create a fake authenticated user before every test
    beforeEach(async () => {

        userId = new mongoose.Types.ObjectId();

        // Create JWT that matches requireAuth.js
        token = jwt.sign(
            { id: userId.toString() },
            process.env.JWT_SECRET || "fallback_secret"
        );
    });


    // ==========================================
    // GET NOTIFICATION SETTINGS
    // ==========================================

    describe("GET /api/settings/notifications", () => {

        it("should return default notification settings for an authenticated user", async () => {

            const response = await request(app)
                .get("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.settings).toBeDefined();

            expect(response.body.settings.user)
                .toBe(userId.toString());

            expect(response.body.settings.pushEnabled)
                .toBe(true);

            expect(response.body.settings.quietHours.enabled)
                .toBe(true);

            expect(response.body.settings.quietHours.start)
                .toBe("22:00");

            expect(response.body.settings.quietHours.end)
                .toBe("07:00");
        });


        it("should return existing notification settings", async () => {

            await NotificationSettingsModel.create({
                user: userId,
                pushEnabled: false,
                quietHours: {
                    enabled: true,
                    start: "23:00",
                    end: "06:00",
                },
            });

            const response = await request(app)
                .get("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.settings.pushEnabled)
                .toBe(false);

            expect(response.body.settings.quietHours.start)
                .toBe("23:00");

            expect(response.body.settings.quietHours.end)
                .toBe("06:00");
        });


        it("should return 401 when no authentication token is provided", async () => {

            const response = await request(app)
                .get("/api/settings/notifications");

            expect(response.statusCode).toBe(401);
        });

    });


    // ==========================================
    // UPDATE NOTIFICATION SETTINGS
    // ==========================================

    describe("PUT /api/settings/notifications", () => {

        it("should update push notification preference", async () => {

            const response = await request(app)
                .put("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    pushEnabled: false,
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.settings.pushEnabled)
                .toBe(false);
        });


        it("should update quiet hours", async () => {

            const response = await request(app)
                .put("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    quietHours: {
                        enabled: true,
                        start: "23:00",
                        end: "06:00",
                    },
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.settings.quietHours.enabled)
                .toBe(true);

            expect(response.body.settings.quietHours.start)
                .toBe("23:00");

            expect(response.body.settings.quietHours.end)
                .toBe("06:00");
        });


        it("should allow quiet hours to be disabled", async () => {

            const response = await request(app)
                .put("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    quietHours: {
                        enabled: false,
                    },
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.settings.quietHours.enabled)
                .toBe(false);
        });


        it("should update only the provided settings", async () => {

            await NotificationSettingsModel.create({
                user: userId,
                pushEnabled: true,
                quietHours: {
                    enabled: true,
                    start: "22:00",
                    end: "07:00",
                },
            });

            const response = await request(app)
                .put("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    pushEnabled: false,
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.settings.pushEnabled)
                .toBe(false);

            // Quiet hours should remain unchanged
            expect(response.body.settings.quietHours.enabled)
                .toBe(true);

            expect(response.body.settings.quietHours.start)
                .toBe("22:00");

            expect(response.body.settings.quietHours.end)
                .toBe("07:00");
        });


        it("should return 401 when updating without authentication", async () => {

            const response = await request(app)
                .put("/api/settings/notifications")
                .send({
                    pushEnabled: false,
                });

            expect(response.statusCode).toBe(401);
        });


        it("should return 400 when pushEnabled is not a boolean", async () => {

            const response = await request(app)
                .put("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    pushEnabled: "false",
                });

            expect(response.statusCode).toBe(400);
        });


        it("should return 400 when quietHours is not an object", async () => {

            const response = await request(app)
                .put("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    quietHours: "disabled",
                });

            expect(response.statusCode).toBe(400);
        });


        it("should return 400 when quietHours.enabled is not a boolean", async () => {

            const response = await request(app)
                .put("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    quietHours: {
                        enabled: "true",
                    },
                });

            expect(response.statusCode).toBe(400);
        });


        it("should return 400 when quietHours.start has an invalid time", async () => {

            const response = await request(app)
                .put("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    quietHours: {
                        start: "25:00",
                    },
                });

            expect(response.statusCode).toBe(400);
        });


        it("should return 400 when quietHours.end has an invalid time", async () => {

            const response = await request(app)
                .put("/api/settings/notifications")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    quietHours: {
                        end: "08:70",
                    },
                });

            expect(response.statusCode).toBe(400);
        });

    });

});