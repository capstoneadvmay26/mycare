const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");

const ProfileModel = require("../src/models/profile.model");
const MedicationModel = require("../src/models/medication.model");
const MedicationLogModel = require("../src/models/medicationLog.model");
const SymptomModel = require("../src/models/symptom.model");

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

describe("Consult Brief API", () => {

    let userId;
    let profile_id;
    let token;


    beforeEach(async () => {

        userId = new mongoose.Types.ObjectId();

        token = jwt.sign(
            { id: userId.toString() },
            process.env.JWT_SECRET || "fallback_secret"
        );

        const profile = await ProfileModel.create({
            owner: userId,
            name: "Test User",
            isSelf: true,
        });

        profile_id = profile._id;
    });


    describe("GET /api/v1/consult-brief/:profile_id", () => {

        // BASIC SUCCESS
        it("should return a consult brief for the authenticated user", async () => {

            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.profile.profile_id)
                .toBe(profile_id.toString());

            expect(response.body.profile.name)
                .toBe("Test User");

            expect(response.body.dateRange.startDate)
                .toBe("2026-08-01T00:00:00.000Z");

            expect(response.body.dateRange.endDate)
                .toBe("2026-08-30T23:59:59.999Z");

            expect(response.body.currentMedications)
                .toEqual(expect.any(Array));

            expect(response.body.adherence)
                .toBeDefined();

            expect(response.body.symptoms)
                .toEqual(expect.any(Array));
        });

        // AUTHENTICATION
        it("should return 401 when no authentication token is provided", async () => {

            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                });


            expect(response.statusCode).toBe(401);
        });

        // INVALID PROFILE ID
        it("should return 400 when profile_id is invalid", async () => {

            const response = await request(app)
                .get("/api/v1/consult-brief/invalid-profile-id")
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("Invalid profile_id.");
        });

        // PROFILE NOT FOUND
        it("should return 404 when the profile does not exist", async () => {

            const fakeprofile_id =
                new mongoose.Types.ObjectId();


            const response = await request(app)
                .get(`/api/v1/consult-brief/${fakeprofile_id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(404);

            expect(response.body.message)
                .toBe("Profile not found.");
        });

        // PROFILE OWNERSHIP
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
                .get(`/api/v1/consult-brief/${anotherProfile._id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(403);

            expect(response.body.message)
                .toBe("You don't have access to this profile.");
        });

        // DATE VALIDATION
        it("should return 400 when startDate and endDate are missing", async () => {

            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("startDate and endDate are required.");
        });


        it("should return 400 when the dates are invalid", async () => {

            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "invalid-date",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("Invalid startDate or endDate.");
        });


        it("should return 400 when startDate is after endDate", async () => {

            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-30",
                    endDate: "2026-08-01",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("startDate cannot be after endDate.");
        });

        // CURRENT MEDICATIONS
        it("should include current medications", async () => {

            await MedicationModel.create({
                profile: profile_id,
                name: "Amlodipine",
                dosage: "5mg",
                frequency: "once_daily",
                scheduleTime: ["08:00"],
                startDate: new Date("2026-08-01"),
                endDate: new Date("2026-12-31"),
                status: "active",
            });


            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.currentMedications)
                .toHaveLength(1);

            expect(response.body.currentMedications[0].name)
                .toBe("Amlodipine");

            expect(response.body.currentMedications[0].dosage)
                .toBe("5mg");

            expect(response.body.currentMedications[0].frequency)
                .toBe("once_daily");

            expect(response.body.currentMedications[0].scheduleTime)
                .toEqual(["08:00"]);
        });

        // EXPIRED MEDICATIONS
        it("should not include medications whose endDate has passed", async () => {

            await MedicationModel.create({
                profile: profile_id,
                name: "Old Medication",
                dosage: "10mg",
                frequency: "once_daily",
                scheduleTime: ["08:00"],
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-07-01"),
                status: "active",
            });


            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.currentMedications)
                .toHaveLength(0);
        });

        // SYMPTOMS
        it("should include symptoms within the selected date range", async () => {

            await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt: new Date("2026-08-20T08:00:00.000Z"),
            });


            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.symptoms)
                .toHaveLength(1);

            expect(response.body.symptoms[0].symptom)
                .toBe("Headache");

            expect(response.body.symptoms[0].severity)
                .toBe("moderate");
        });

        // SYMPTOM CHECK-INS
        it("should include symptom check-ins", async () => {

            await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt: new Date("2026-08-18T08:00:00.000Z"),
                checkIns: [
                    {
                        day: 1,
                        status: "better",
                        checkedInAt:
                            new Date("2026-08-19T08:00:00.000Z"),
                    },
                    {
                        day: 2,
                        status: "same",
                        checkedInAt:
                            new Date("2026-08-20T08:00:00.000Z"),
                    },
                ],
            });


            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-30",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.symptoms)
                .toHaveLength(1);

            expect(response.body.symptoms[0].checkIns)
                .toHaveLength(2);

            expect(response.body.symptoms[0].checkIns[0].day)
                .toBe(1);

            expect(response.body.symptoms[0].checkIns[0].status)
                .toBe("better");

            expect(response.body.symptoms[0].checkIns[1].day)
                .toBe(2);

            expect(response.body.symptoms[0].checkIns[1].status)
                .toBe("same");
        });

        // ADHERENCE CALCULATION
        it("should calculate medication adherence correctly", async () => {

            const medication = await MedicationModel.create({
                profile: profile_id,
                name: "Amlodipine",
                dosage: "5mg",
                frequency: "three_times_daily",
                scheduleTime: ["08:00", "20:00", "22:00"],
                startDate: new Date("2026-08-20"),
                endDate: new Date("2026-08-20"),
                status: "active",
            });


            // These are UTC timestamps, matching the ISO-8601 Z values used by the app.
            await MedicationLogModel.create([
                {
                    profile: profile_id,
                    medication: medication._id,
                    scheduledFor:
                        new Date("2026-08-20T08:00:00.000Z"),
                    status: "taken",
                    takenAt:
                        new Date("2026-08-20T08:05:00.000Z"),
                },
                {
                    profile: profile_id,
                    medication: medication._id,
                    scheduledFor:
                        new Date("2026-08-20T20:00:00.000Z"),
                    status: "skipped",
                    skippedAt:
                        new Date("2026-08-20T20:05:00.000Z"),
                },
                {
                    profile: profile_id,
                    medication: medication._id,
                    scheduledFor:
                        new Date("2026-08-20T22:00:00.000Z"),
                    status: "pending",
                },
            ]);


            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-20",
                    endDate: "2026-08-20",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.adherence.totalScheduledDoses)
                .toBe(3);

            expect(response.body.adherence.takenDoses)
                .toBe(1);

            expect(response.body.adherence.skippedDoses)
                .toBe(1);

            expect(response.body.adherence.pendingDoses)
                .toBe(1);

            expect(response.body.adherence.adherenceRate)
                .toBe(33.33);
        });

        // PENDING LOG GENERATION
        it("should generate pending medication logs for missing scheduled doses", async () => {

            await MedicationModel.create({
                profile: profile_id,
                name: "Amlodipine",
                dosage: "5mg",
                frequency: "once_daily",
                scheduleTime: ["08:00"],
                startDate: new Date("2026-08-20"),
                endDate: new Date("2026-08-22"),
                status: "active",
            });


            const beforeCount =
                await MedicationLogModel.countDocuments({
                    profile: profile_id,
                });


            expect(beforeCount).toBe(0);


            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-20",
                    endDate: "2026-08-22",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);


            const afterCount =
                await MedicationLogModel.countDocuments({
                    profile: profile_id,
                });


            expect(afterCount).toBe(3);


            expect(response.body.adherence.totalScheduledDoses)
                .toBe(3);

            expect(response.body.adherence.pendingDoses)
                .toBe(3);
        });

        // EMPTY HISTORY
        it("should return empty medications and symptoms when no data exists", async () => {

            const response = await request(app)
                .get(`/api/v1/consult-brief/${profile_id}`)
                .query({
                    startDate: "2026-08-01",
                    endDate: "2026-08-02",
                })
                .set("Authorization", `Bearer ${token}`);


            expect(response.statusCode).toBe(200);

            expect(response.body.currentMedications)
                .toEqual([]);

            expect(response.body.symptoms)
                .toEqual([]);

            expect(response.body.adherence.totalScheduledDoses)
                .toBe(0);

            expect(response.body.adherence.takenDoses)
                .toBe(0);

            expect(response.body.adherence.skippedDoses)
                .toBe(0);

            expect(response.body.adherence.pendingDoses)
                .toBe(0);

            expect(response.body.adherence.adherenceRate)
                .toBe(0);
        });

    });

});
