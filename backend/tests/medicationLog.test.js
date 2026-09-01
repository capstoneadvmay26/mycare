const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");

const ProfileModel = require("../src/models/profile.model");
const MedicationModel = require("../src/models/medication.model");
const MedicationLogModel = require("../src/models/medicationLog.model");

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


describe("Medication Log API", () => {

    let userId;
    let profile_id;
    let token;
    let medicationId;
    let medicationLogId;


    beforeEach(async () => {

        // Create test user ID
        userId = new mongoose.Types.ObjectId();

        // Create authentication token
        token = jwt.sign(
            { id: userId.toString() },
            process.env.JWT_SECRET || "fallback_secret"
        );

        // Create profile owned by test user
        const profile = await ProfileModel.create({
            owner: userId,
            name: "Test User",
            isSelf: true,
        });

        profile_id = profile._id;

        // Create medication
        const medication = await MedicationModel.create({
            profile: profile_id,
            name: "Amlodipine",
            dosage: "5mg",
            frequency: "once_daily",
            scheduleTime: ["08:00"],
            startDate: new Date("2026-08-20"),
            endDate: new Date("2026-12-31"),
            status: "active",
        });

        medicationId = medication._id;

        // Create medication log
        const medicationLog = await MedicationLogModel.create({
            profile: profile_id,
            medication: medicationId,
            scheduledFor: new Date("2026-08-20T08:00:00.000Z"),
            status: "pending",
        });

        medicationLogId = medicationLog._id;
    });

    // GET MEDICATION HISTORY
    describe("GET /api/v1/medication-history/:profile_id", () => {

        it("should return medication history for the authenticated owner", async () => {

            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "week",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.period).toBe("week");

            expect(response.body.history)
                .toEqual(expect.any(Array));

            expect(response.body.pagination)
                .toBeDefined();

            expect(response.body.pagination.currentPage)
                .toBe(1);

            expect(response.body.pagination.limit)
                .toBe(10);
        });


        it("should return 401 when no authentication token is provided", async () => {

            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "week",
                });


            expect(response.statusCode).toBe(401);
        });


        it("should return 403 when the user does not own the profile", async () => {

            const anotherUserId =
                new mongoose.Types.ObjectId();

            const anotherProfile =
                await ProfileModel.create({
                    owner: anotherUserId,
                    name: "Another User",
                    isSelf: true,
                });


            const response = await request(app)
                .get(`/api/v1/medication-history/${anotherProfile._id}`)
                .query({
                    period: "week",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(403);

            expect(response.body.message)
                .toBe("You don't have access to this profile.");
        });


        it("should return 404 when the profile does not exist", async () => {

            const fakeprofile_id =
                new mongoose.Types.ObjectId();


            const response = await request(app)
                .get(`/api/v1/medication-history/${fakeprofile_id}`)
                .query({
                    period: "week",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(404);

            expect(response.body.message)
                .toBe("Profile not found.");
        });


        it("should return 400 for an invalid period", async () => {

            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "year",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe(
                    "Invalid period. Use week, month, or 2months."
                );
        });


        it("should return 400 when period is missing", async () => {

            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe(
                    "Invalid period. Use week, month, or 2months."
                );
        });


        it("should filter history by status", async () => {

            await MedicationLogModel.create({
                profile: profile_id,
                medication: medicationId,
                scheduledFor:
                    new Date("2026-08-21T08:00:00.000Z"),
                status: "taken",
                takenAt:
                    new Date("2026-08-21T08:05:00.000Z"),
            });


            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "2months",
                    status: "taken",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.history)
                .toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            status: "taken",
                        }),
                    ])
                );

            expect(
                response.body.history.every(
                    log => log.status === "taken"
                )
            ).toBe(true);
        });


        it("should filter history by medicationId", async () => {

            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "2months",
                    medicationId: medicationId.toString(),
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(
                response.body.history.every(
                    log =>
                        log.medication._id.toString() ===
                        medicationId.toString()
                )
            ).toBe(true);
        });


        it("should return 400 for an invalid medicationId", async () => {

            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "week",
                    medicationId: "invalid-id",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("Invalid medicationId.");
        });


        it("should return 400 for an invalid status", async () => {

            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "week",
                    status: "completed",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe(
                    "Invalid status. Use pending, taken, or skipped."
                );
        });


        it("should support pagination", async () => {

            await MedicationLogModel.create([
                {
                    profile: profile_id,
                    medication: medicationId,
                    scheduledFor:
                        new Date("2026-08-21T08:00:00.000Z"),
                    status: "taken",
                    takenAt:
                        new Date("2026-08-21T08:05:00.000Z"),
                },
                {
                    profile: profile_id,
                    medication: medicationId,
                    scheduledFor:
                        new Date("2026-08-22T08:00:00.000Z"),
                    status: "skipped",
                    skippedAt:
                        new Date("2026-08-22T08:05:00.000Z"),
                },
            ]);


            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "2months",
                    page: 1,
                    limit: 2,
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.pagination.currentPage)
                .toBe(1);

            expect(response.body.pagination.limit)
                .toBe(2);

            expect(response.body.history.length)
                .toBeLessThanOrEqual(2);
        });


        it("should return 400 when page is invalid", async () => {

            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "week",
                    page: 0,
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("page must be a positive integer.");
        });


        it("should return 400 when limit is greater than 50", async () => {

            const response = await request(app)
                .get(`/api/v1/medication-history/${profile_id}`)
                .query({
                    period: "week",
                    limit: 51,
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("limit cannot be greater than 50.");
        });

    });

    // MARK DOSE AS TAKEN
    describe("PATCH /api/v1/medication-logs/:id/taken", () => {

        it("should mark a medication as taken for the owner", async () => {

            const response = await request(app)
                .patch(
                    `/api/v1/medication-logs/${medicationLogId}/taken`
                )
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.message)
                .toBe("Medication marked as taken");

            expect(response.body.medicationLog.status)
                .toBe("taken");

            expect(response.body.medicationLog.takenAt)
                .toBeDefined();

            expect(response.body.medicationLog.skippedAt)
                .toBeNull();
        });


        it("should return 401 when marking a dose as taken without authentication", async () => {

            const response = await request(app)
                .patch(
                    `/api/v1/medication-logs/${medicationLogId}/taken`
                );


            expect(response.statusCode).toBe(401);
        });


        it("should return 403 when another user tries to mark the dose as taken", async () => {

            const anotherUserId =
                new mongoose.Types.ObjectId();

            const anotherToken = jwt.sign(
                { id: anotherUserId.toString() },
                process.env.JWT_SECRET || "fallback_secret"
            );


            const response = await request(app)
                .patch(
                    `/api/v1/medication-logs/${medicationLogId}/taken`
                )
                .set(
                    "Authorization",
                    `Bearer ${anotherToken}`
                );


            expect(response.statusCode).toBe(403);

            expect(response.body.message)
                .toBe(
                    "You don't have access to this medication log."
                );
        });


        it("should return 404 when the medication log does not exist", async () => {

            const fakeLogId =
                new mongoose.Types.ObjectId();


            const response = await request(app)
                .patch(
                    `/api/v1/medication-logs/${fakeLogId}/taken`
                )
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(404);

            expect(response.body.message)
                .toBe("Medication Log not found");
        });

    });

    // MARK DOSE AS SKIPPED
    describe("PATCH /api/v1/medication-logs/:id/skipped", () => {

        it("should mark a medication as skipped for the owner", async () => {

            const response = await request(app)
                .patch(
                    `/api/v1/medication-logs/${medicationLogId}/skipped`
                )
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.message)
                .toBe("Medication marked as skipped");

            expect(response.body.medicationLog.status)
                .toBe("skipped");

            expect(response.body.medicationLog.skippedAt)
                .toBeDefined();

            expect(response.body.medicationLog.takenAt)
                .toBeNull();
        });


        it("should return 401 when marking a dose as skipped without authentication", async () => {

            const response = await request(app)
                .patch(
                    `/api/v1/medication-logs/${medicationLogId}/skipped`
                );


            expect(response.statusCode).toBe(401);
        });


        it("should return 403 when another user tries to mark the dose as skipped", async () => {

            const anotherUserId =
                new mongoose.Types.ObjectId();

            const anotherToken = jwt.sign(
                { id: anotherUserId.toString() },
                process.env.JWT_SECRET || "fallback_secret"
            );


            const response = await request(app)
                .patch(
                    `/api/v1/medication-logs/${medicationLogId}/skipped`
                )
                .set(
                    "Authorization",
                    `Bearer ${anotherToken}`
                );


            expect(response.statusCode).toBe(403);

            expect(response.body.message)
                .toBe(
                    "You don't have access to this medication log."
                );
        });


        it("should return 404 when the medication log does not exist", async () => {

            const fakeLogId =
                new mongoose.Types.ObjectId();


            const response = await request(app)
                .patch(
                    `/api/v1/medication-logs/${fakeLogId}/skipped`
                )
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(404);

            expect(response.body.message)
                .toBe("Medication Log not found");
        });

    });

});
