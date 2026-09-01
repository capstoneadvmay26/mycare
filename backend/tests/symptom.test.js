const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const ProfileModel = require("../src/models/profile.model");
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


describe("Symptom API", () => {
    let userId;
    let profile_id;
    let token;

    // Create a fresh user, profile and JWT before every test
    beforeEach(async () => {
        // Fake authenticated user ID
        userId = new mongoose.Types.ObjectId();

        // Create JWT that matches requireAuth.js
        token = jwt.sign(
            { id: userId.toString() },
            process.env.JWT_SECRET || "fallback_secret"
        );

        // Create profile owned by the fake user
        const profile = await ProfileModel.create({
            owner: userId,
            name: "Test User",
            isSelf: true,
        });

        profile_id = profile._id;
    });

    // CREATE SYMPTOM
    describe("POST /api/v1/symptoms/log", () => {

        it("should create a symptom successfully", async () => {
            const response = await request(app)
                .post("/api/v1/symptoms/log")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profile_id: profile_id.toString(),
                    symptoms: ["Headache"],
                    severity: "moderate",
                });

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.symptom).toBeDefined();

            expect(response.body.symptom.symptoms)
                .toEqual(["Headache"]);

            expect(response.body.symptom.severity)
                .toBe("moderate");

            expect(response.body.symptom.profile)
                .toBe(profile_id.toString());
        });


        it("should return 404 when the profile does not exist", async () => {
            const fakeprofile_id =
                new mongoose.Types.ObjectId();

            const response = await request(app)
                .post("/api/v1/symptoms/log")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profile_id: fakeprofile_id.toString(),
                    symptoms: ["Headache"],
                    severity: "moderate",
                });

            expect(response.statusCode).toBe(404);
        });


        it("should return 403 when the user does not own the profile", async () => {
            const anotherUserId =
                new mongoose.Types.ObjectId();

            const anotherProfile = await ProfileModel.create({
                owner: anotherUserId,
                name: "Another User",
                isSelf: true,
            });

            const response = await request(app)
                .post("/api/v1/symptoms/log")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profile_id: anotherProfile._id.toString(),
                    symptoms: ["Headache"],
                    severity: "moderate",
                });

            expect(response.statusCode).toBe(403);
        });


        it("should reject an invalid severity", async () => {
            const response = await request(app)
                .post("/api/v1/symptoms/log")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    profile_id: profile_id.toString(),
                    symptoms: ["Headache"],
                    severity: "invalid",
                });

            expect(response.statusCode).toBe(400);
        });
    });

    // SYMPTOM OPTIONS
    describe("GET /api/v1/symptoms/options", () => {

        it("should return the available symptom options", async () => {
            const response = await request(app)
                .get("/api/v1/symptoms/options")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.symptoms).toBeDefined();

            expect(Array.isArray(response.body.symptoms))
                .toBe(true);

            expect(response.body.symptoms)
                .toContain("Headache");

            expect(response.body.symptoms)
                .toContain("Fever");

            expect(response.body.symptoms)
                .toContain("Cough");

            expect(response.body.symptoms)
                .toContain("Others");
        });
    });

    // SYMPTOM HISTORY
    describe("GET /api/v1/symptoms/history", () => {

        it("should return symptoms belonging to the authenticated user", async () => {

            await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
            });

            const response = await request(app)
                .get("/api/v1/symptoms/history")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.count).toBe(1);

            expect(response.body.symptoms).toHaveLength(1);

            expect(response.body.symptoms[0].symptoms)
                .toEqual(["Headache"]);
        });


        it("should not return symptoms belonging to another user", async () => {

            const anotherUserId =
                new mongoose.Types.ObjectId();

            const anotherProfile = await ProfileModel.create({
                owner: anotherUserId,
                name: "Another User",
                isSelf: true,
            });

            await SymptomModel.create({
                profile: anotherProfile._id,
                symptoms: ["Fever"],
                severity: "severe",
            });

            const response = await request(app)
                .get("/api/v1/symptoms/history")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.count).toBe(0);

            expect(response.body.symptoms).toHaveLength(0);
        });

        it("should filter symptom history by symptom name", async () => {

            await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
            });

            await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Fever"],
                severity: "severe",
            });

            const response = await request(app)
                .get("/api/v1/symptoms/history?symptom=headache")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.count).toBe(1);

            expect(response.body.symptoms[0].symptoms)
                .toEqual(["Headache"]);
        });
    });

    // UPDATE SYMPTOM
    describe("PATCH /api/v1/symptoms/:id", () => {

        it("should update a symptom successfully", async () => {

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "mild",
            });

            const response = await request(app)
                .patch(`/api/v1/symptoms/${symptom._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    symptoms: ["Fever"],
                    severity: "severe",
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.symptom.symptoms)
                .toEqual(["Fever"]);

            expect(response.body.symptom.severity)
                .toBe("severe");
        });


        it("should return 404 when updating a symptom that does not exist", async () => {

            const fakeSymptomId =
                new mongoose.Types.ObjectId();

            const response = await request(app)
                .patch(`/api/v1/symptoms/${fakeSymptomId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    severity: "severe",
                });

            expect(response.statusCode).toBe(404);
        });
    });

    // DELETE SYMPTOM
    describe("DELETE /api/v1/symptoms/:id", () => {

        it("should delete a symptom successfully", async () => {

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
            });

            const response = await request(app)
                .delete(`/api/v1/symptoms/${symptom._id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            const deletedSymptom =
                await SymptomModel.findById(symptom._id);

            expect(deletedSymptom).toBeNull();
        });


        it("should return 404 when deleting a symptom that does not exist", async () => {

            const fakeSymptomId =
                new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/v1/symptoms/${fakeSymptomId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
    });

    // SYMPTOM CHECK-IN
    describe("POST /api/v1/symptoms/:id/check-in", () => {

        it("should return 400 when Day 1 check-in is attempted too early", async () => {

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt: new Date(),
            });

            const response = await request(app)
                .post(`/api/v1/symptoms/${symptom._id}/check-in`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "better",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("Day 1 check-in will be available tomorrow.");
        });


        it("should record Day 1 check-in when it is due", async () => {

            // Make the symptom old enough for Day 1
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt: yesterday,
            });

            const response = await request(app)
                .post(`/api/v1/symptoms/${symptom._id}/check-in`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "better",
                });

            expect(response.statusCode).toBe(201);

            expect(response.body.success).toBe(true);

            expect(response.body.checkIn.day).toBe(1);

            expect(response.body.checkIn.status)
                .toBe("better");
        });


        it("should reject an invalid check-in status", async () => {

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt: yesterday,
            });

            const response = await request(app)
                .post(`/api/v1/symptoms/${symptom._id}/check-in`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "invalid",
                });

            expect(response.statusCode).toBe(400);
        });


        it("should return 403 when the user does not own the symptom", async () => {

            const anotherUserId =
                new mongoose.Types.ObjectId();

            const anotherProfile = await ProfileModel.create({
                owner: anotherUserId,
                name: "Another User",
                isSelf: true,
            });

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const symptom = await SymptomModel.create({
                profile: anotherProfile._id,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt: yesterday,
            });

            const response = await request(app)
                .post(`/api/v1/symptoms/${symptom._id}/check-in`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "better",
                });

            expect(response.statusCode).toBe(403);
        });


        it("should return 404 when the symptom does not exist", async () => {

            const fakeSymptomId =
                new mongoose.Types.ObjectId();

            const response = await request(app)
                .post(`/api/v1/symptoms/${fakeSymptomId}/check-in`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "better",
                });

            expect(response.statusCode).toBe(404);
        });
    });

    // SYMPTOM STATUS
    describe("GET /api/v1/symptoms/:id/status", () => {

        it("should return status for a new symptom", async () => {

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
            });

            const response = await request(app)
                .get(`/api/v1/symptoms/${symptom._id}/status`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.current_day).toBe(1);

            expect(response.body.is_improving).toBeNull();

            expect(response.body.needs_doctor_nudge)
                .toBe(false);

            expect(response.body.doctor_follow_up_due)
                .toBe(false);
        });


        it("should show improving after a better check-in", async () => {

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",

                checkIns: [
                    {
                        day: 1,
                        status: "better",
                        checkedInAt: new Date(),
                    }
                ],
            });

            const response = await request(app)
                .get(`/api/v1/symptoms/${symptom._id}/status`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.current_day).toBe(2);

            expect(response.body.is_improving)
                .toBe(true);

            expect(response.body.needs_doctor_nudge)
                .toBe(false);

            expect(response.body.doctor_follow_up_due)
                .toBe(false);
        });


        it("should return 404 when the symptom does not exist", async () => {

            const fakeSymptomId =
                new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/api/v1/symptoms/${fakeSymptomId}/status`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
        });
    });

    // PROFESSIONAL-CARE NUDGE
    describe("Professional-care nudge", () => {

        it("should show a doctor nudge when the user reports worse on Day 3", async () => {

            const day1 = new Date();
            day1.setDate(day1.getDate() - 3);

            const day2 = new Date();
            day2.setDate(day2.getDate() - 2);

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
                loggedAt: new Date(day1.getTime() - 24 * 60 * 60 * 1000),

                checkIns: [
                    {
                        day: 1,
                        status: "better",
                        checkedInAt: day1,
                    },
                    {
                        day: 2,
                        status: "better",
                        checkedInAt: day2,
                    },
                ],
            });

            const response = await request(app)
                .post(`/api/v1/symptoms/${symptom._id}/check-in`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "worse",
                });

            expect(response.statusCode).toBe(201);

            expect(response.body.checkIn.day).toBe(3);

            expect(response.body.checkIn.status).toBe("worse");

            expect(response.body.professionalCareNudge.shown)
                .toBe(true);

            expect(response.body.professionalCareNudge.message)
                .toBe(
                    "Hasn't been improving, it's worth seeing a doctor."
                );
        });


        it("should show a doctor nudge when same/worse occurs on at least two check-ins", async () => {

            const day1 = new Date();
            day1.setDate(day1.getDate() - 3);

            const day2 = new Date();
            day2.setDate(day2.getDate() - 2);

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Fatigue"],
                severity: "moderate",
                loggedAt: new Date(day1.getTime() - 24 * 60 * 60 * 1000),

                checkIns: [
                    {
                        day: 1,
                        status: "same",
                        checkedInAt: day1,
                    },
                    {
                        day: 2,
                        status: "same",
                        checkedInAt: day2,
                    },
                ],
            });

            const response = await request(app)
                .post(`/api/v1/symptoms/${symptom._id}/check-in`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "better",
                });

            expect(response.statusCode).toBe(201);

            expect(response.body.checkIn.day).toBe(3);

            expect(response.body.professionalCareNudge.shown)
                .toBe(true);
        });


        it("should not show a doctor nudge when all three check-ins are better", async () => {

            const day1 = new Date();
            day1.setDate(day1.getDate() - 3);

            const day2 = new Date();
            day2.setDate(day2.getDate() - 2);

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Cough"],
                severity: "mild",
                loggedAt: new Date(day1.getTime() - 24 * 60 * 60 * 1000),

                checkIns: [
                    {
                        day: 1,
                        status: "better",
                        checkedInAt: day1,
                    },
                    {
                        day: 2,
                        status: "better",
                        checkedInAt: day2,
                    },
                ],
            });

            const response = await request(app)
                .post(`/api/v1/symptoms/${symptom._id}/check-in`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "better",
                });

            expect(response.statusCode).toBe(201);

            expect(response.body.checkIn.day).toBe(3);

            expect(response.body.professionalCareNudge.shown)
                .toBe(false);
        });
    });

    // DOCTOR FOLLOW-UP
    describe("POST /api/v1/notifications/doctor-follow-up", () => {

        it("should return 400 when professional-care nudge has not been shown", async () => {

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",
            });

            const response = await request(app)
                .post("/api/v1/notifications/doctor-follow-up")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    symptomId: symptom._id.toString(),
                    response: "yes",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe(
                    "Professional-care follow-up is not available for this symptom."
                );
        });


        it("should return 400 when doctor follow-up is attempted before 8 hours", async () => {

            const twoHoursAgo = new Date(
                Date.now() - 2 * 60 * 60 * 1000
            );

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",

                professionalCareNudge: {
                    shown: true,
                    shownAt: twoHoursAgo,
                },
            });

            const response = await request(app)
                .post("/api/v1/notifications/doctor-follow-up")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    symptomId: symptom._id.toString(),
                    response: "yes",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.message)
                .toBe("Doctor follow-up is not available yet.");
        });


        it("should record a yes response after 8 hours", async () => {

            const nineHoursAgo = new Date(
                Date.now() - 9 * 60 * 60 * 1000
            );

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Headache"],
                severity: "moderate",

                professionalCareNudge: {
                    shown: true,
                    shownAt: nineHoursAgo,
                },
            });

            const response = await request(app)
                .post("/api/v1/notifications/doctor-follow-up")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    symptomId: symptom._id.toString(),
                    response: "yes",
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.doctorFollowUp.response)
                .toBe("yes");

            expect(response.body.doctorFollowUp.respondedAt)
                .toBeDefined();

            expect(response.body.doctorFollowUp.nextReminderAt)
                .toBeNull();
        });


        it("should record a no response after 8 hours", async () => {

            const nineHoursAgo = new Date(
                Date.now() - 9 * 60 * 60 * 1000
            );

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Fever"],
                severity: "severe",

                professionalCareNudge: {
                    shown: true,
                    shownAt: nineHoursAgo,
                },
            });

            const response = await request(app)
                .post("/api/v1/notifications/doctor-follow-up")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    symptomId: symptom._id.toString(),
                    response: "no",
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.doctorFollowUp.response)
                .toBe("no");

            expect(response.body.doctorFollowUp.respondedAt)
                .toBeDefined();

            expect(response.body.doctorFollowUp.nextReminderAt)
                .toBeNull();
        });


        it("should create another reminder when remind_later is selected", async () => {

            const nineHoursAgo = new Date(
                Date.now() - 9 * 60 * 60 * 1000
            );

            const symptom = await SymptomModel.create({
                profile: profile_id,
                symptoms: ["Fatigue"],
                severity: "moderate",

                professionalCareNudge: {
                    shown: true,
                    shownAt: nineHoursAgo,
                },
            });

            const response = await request(app)
                .post("/api/v1/notifications/doctor-follow-up")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    symptomId: symptom._id.toString(),
                    response: "remind_later",
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.doctorFollowUp.response)
                .toBe("remind_later");

            expect(response.body.doctorFollowUp.respondedAt)
                .toBeDefined();

            expect(response.body.doctorFollowUp.nextReminderAt)
                .toBeDefined();
        });


        it("should reject an invalid doctor follow-up response", async () => {

            const response = await request(app)
                .post("/api/v1/notifications/doctor-follow-up")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    symptomId: new mongoose.Types.ObjectId().toString(),
                    response: "maybe",
                });

            expect(response.statusCode).toBe(400);
        });


        it("should return 404 when the symptom does not exist", async () => {

            const fakeSymptomId =
                new mongoose.Types.ObjectId();

            const response = await request(app)
                .post("/api/v1/notifications/doctor-follow-up")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    symptomId: fakeSymptomId.toString(),
                    response: "yes",
                });

            expect(response.statusCode).toBe(404);
        });


        it("should return 403 when the user does not own the symptom", async () => {

            const anotherUserId =
                new mongoose.Types.ObjectId();

            const anotherProfile = await ProfileModel.create({
                owner: anotherUserId,
                name: "Another User",
                isSelf: true,
            });

            const nineHoursAgo = new Date(
                Date.now() - 9 * 60 * 60 * 1000
            );

            const symptom = await SymptomModel.create({
                profile: anotherProfile._id,
                symptoms: ["Headache"],
                severity: "moderate",

                professionalCareNudge: {
                    shown: true,
                    shownAt: nineHoursAgo,
                },
            });

            const response = await request(app)
                .post("/api/v1/notifications/doctor-follow-up")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    symptomId: symptom._id.toString(),
                    response: "yes",
                });

            expect(response.statusCode).toBe(403);
        });
    });
});
