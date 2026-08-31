const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");

const ProfileModel = require("../src/models/profile.model");
const SymptomModel = require("../src/models/symptom.model");
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


describe("History API", () => {

    let userId;
    let profileId;
    let token;


    beforeEach(async () => {

        userId = new mongoose.Types.ObjectId();

        token = jwt.sign(
            { id: userId.toString() },
            process.env.JWT_SECRET || "fallback_secret"
        );

        const profile = await ProfileModel.create({
            owner: userId,
            fullName: "Test User",
            isSelf: true,
        });

        profileId = profile._id;
    });


    describe("GET /api/history/:profileId", () => {

        // BASIC HISTORY
        it("should return all history for the authenticated user", async () => {

            const loggedAt = new Date("2026-08-20T08:00:00.000Z");

            await SymptomModel.create({
                profile: profileId,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt,
            });

            const response = await request(app)
                .get(`/api/history/${profileId}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.type).toBe("all");

            expect(response.body.count).toBe(1);

            expect(response.body.history[0].type)
                .toBe("symptom");

            expect(response.body.history[0].symptom)
                .toBe("Headache");

            expect(response.body.history[0].severity)
                .toBe("moderate");
        });

        // PROFILE NOT FOUND
        it("should return 404 when the profile does not exist", async () => {

            const fakeProfileId =
                new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/api/history/${fakeProfileId}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });

        // PROFILE OWNERSHIP
        it("should return 403 when the user does not own the profile", async () => {

            const anotherUserId =
                new mongoose.Types.ObjectId();

            const anotherProfile = await ProfileModel.create({
                owner: anotherUserId,
                fullName: "Another User",
                isSelf: true,
            });

            const response = await request(app)
                .get(`/api/history/${anotherProfile._id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(403);
        });

        // MISSING DATES

        it("should return 400 when startDate and endDate are missing", async () => {

            const response = await request(app)
                .get(`/api/history/${profileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("startDate and endDate are required.");
        });

        // INVALID DATE
        it("should return 400 when the dates are invalid", async () => {

            const response = await request(app)
                .get(`/api/history/${profileId}`)
                .query({
                    startDate: "invalid-date",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("Invalid startDate or endDate.");
        });

        // START DATE AFTER END DATE
        it("should return 400 when startDate is after endDate", async () => {

            const response = await request(app)
                .get(`/api/history/${profileId}`)
                .query({
                    startDate: "2026-08-30",
                    endDate: "2026-08-01",
                })
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("startDate cannot be after endDate.");
        });

        // SYMPTOM FILTER

        it("should return only symptoms when type is symptoms", async () => {

            await SymptomModel.create({
                profile: profileId,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt: new Date("2026-08-20T08:00:00.000Z"),
            });

            const medication = await MedicationModel.create({
                profile: profileId,
                name: "Amlodipine",
                dosage: "5mg",
                frequency: "once_daily",
                scheduleTime: ["08:00"],
                startDate: new Date("2026-08-01"),
            });

            await MedicationLogModel.create({
                profile: profileId,
                medication: medication._id,
                scheduledFor: new Date("2026-08-20T09:00:00.000Z"),
                status: "taken",
                takenAt: new Date("2026-08-20T09:05:00.000Z"),
            });

            const response = await request(app)
                .get(`/api/history/${profileId}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                    type: "symptoms",
                })
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.type).toBe("symptoms");

            expect(response.body.history).toHaveLength(1);

            expect(response.body.history[0].type)
                .toBe("symptom");
        });

        // CHECK-IN FILTER
        it("should return only check-ins when type is check-ins", async () => {

            await SymptomModel.create({
                profile: profileId,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt: new Date("2026-08-18T08:00:00.000Z"),
                checkIns: [
                    {
                        day: 1,
                        status: "better",
                        checkedInAt: new Date("2026-08-19T08:00:00.000Z"),
                    },
                ],
            });

            const response = await request(app)
                .get(`/api/history/${profileId}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                    type: "check-ins",
                })
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.type).toBe("check-ins");

            expect(response.body.history).toHaveLength(1);

            expect(response.body.history[0].type)
                .toBe("check-in");

            expect(response.body.history[0].status)
                .toBe("better");
        });

        // MEDICATION FILTER
        it("should return only medications when type is medications", async () => {

            const medication = await MedicationModel.create({
                profile: profileId,
                name: "Amlodipine",
                dosage: "5mg",
                frequency: "once_daily",
                scheduleTime: ["08:00"],
                startDate: new Date("2026-08-01"),
            });

            await MedicationLogModel.create({
                profile: profileId,
                medication: medication._id,
                scheduledFor: new Date("2026-08-20T08:00:00.000Z"),
                status: "taken",
                takenAt: new Date("2026-08-20T08:05:00.000Z"),
            });

            await SymptomModel.create({
                profile: profileId,
                symptoms: ["Fatigue"],
                severity: "mild",
                loggedAt: new Date("2026-08-20T10:00:00.000Z"),
            });

            const response = await request(app)
                .get(`/api/history/${profileId}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                    type: "medications",
                })
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.type).toBe("medications");

            expect(response.body.history).toHaveLength(1);

            expect(response.body.history[0].type)
                .toBe("medication");

            expect(response.body.history[0].medication)
                .toBe("Amlodipine");

            expect(response.body.history[0].status)
                .toBe("taken");
        });

        // INVALID TYPE
        it("should return 400 when an invalid type is provided", async () => {

            const response = await request(app)
                .get(`/api/history/${profileId}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                    type: "invalid",
                })
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe(
                    "Invalid type. Use all, symptoms, check-ins, or medications."
                );
        });

        // AUTHENTICATION
        it("should return 401 when no authentication token is provided", async () => {

            const response = await request(app)
                .get(`/api/history/${profileId}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                });

            expect(response.statusCode).toBe(401);
        });

    });

});
