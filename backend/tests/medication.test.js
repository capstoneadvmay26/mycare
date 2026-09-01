const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const { connectTestDB, closeTestDB, clearTestDB } = require("./setup");
const { createTestUserAndToken } = require("./testHelpers");

beforeAll(async () => connectTestDB());
afterAll(async () => closeTestDB());
afterEach(async () => clearTestDB());

async function createProfile(token) {
    const res = await request(app)
        .post("/api/profiles")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Chibundu Ahamefula", isSelf: true });
    return res.body.data._id;
}

describe("Medication CRUD", () => {
    it("add a medication to profile", async () => {
        const { token } = await createTestUserAndToken();
        const profileId = await createProfile(token);

        const res = await request(app)
            .post("/api/medications").set("Authorization", `Bearer ${token}`)
            .send({
                profileId,
                name: "Paracetamol",
                dosage: "500mg",
                frequency: "twice_daily",
                scheduleTime: ["08:00", "20:00"],
                startDate: "2026-01-01",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.name).toBe("Paracetamol");
        expect(res.body.data.scheduleTime).toEqual(["08:00", "20:00"]);
    });

    it("blocks adding a medication to a profile you don't own", async () => {
        const UserA = await createTestUserAndToken("a@example.com");
        const UserB = await createTestUserAndToken("b@example.com");
        const profileId = await createProfile(UserA.token);

        const res = await request(app)
            .post("/api/medications")
            .set("Authorization", `Bearer ${UserB.token}`)
            .send({
                profileId,
                name: "Paracetamol",
                dosage: "500mg",
                frequency: "once_daily",
                startDate: "2026-01-01",
            });

        expect(res.statusCode).toBe(403);
    });

    it("lists medications for a profile", async () => {
        const { token } = await createTestUserAndToken();
        const profileId = await createProfile(token);

        await request(app)
            .post("/api/medications")
            .set("Authorization", `Bearer ${token}`)
            .send({
                profileId,
                name: "Vitamin D",
                dosage: "1 tablet",
                frequency: "once_daily",
                startDate: "2026-01-01",
            });

        const res = await request(app)
            .get(`/api/medications?profileId=${profileId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);
    });

    it("rejects an invalid frequency value", async () => {
        const { token } = await createTestUserAndToken();
        const profileId = await createProfile(token);

        const res = await request(app)
            .post("/api/medications")
            .set("Authorization", `Bearer ${token}`)
            .send({
                profileId,
                name: "Paracetamol",
                dosage: "500mg",
                frequency: "sometimes", // not in the allowed enum
                startDate: "2026-01-01",
            });

        expect(res.statusCode).toBe(400);
    });

    it("updates an existing medication", async () => {
        const { token } = await createTestUserAndToken();
        const profileId = await createProfile(token);

        const createRes = await request(app)
            .post("/api/medications")
            .set("Authorization", `Bearer ${token}`)
            .send({
                profileId,
                name: "Paracetamol",
                dosage: "500mg",
                frequency: "once_daily",
                startDate: "2026-01-01",
            });

        const medicationId = createRes.body.data._id;

        const updateRes = await request(app)
            .put(`/api/medications/${medicationId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                dosage: "1000mg",
                frequency: "twice_daily",
            });

        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.success).toBe(true);
        expect(updateRes.body.data.dosage).toBe("1000mg");
        expect(updateRes.body.data.frequency).toBe("twice_daily");
    });

    it("blocks updating a medication belonging to another user's profile", async () => {
        const userA = await createTestUserAndToken("update-a@example.com");
        const userB = await createTestUserAndToken("update-b@example.com");

        const profileId = await createProfile(userA.token);

        const createRes = await request(app)
            .post("/api/medications")
            .set("Authorization", `Bearer ${userA.token}`)
            .send({
                profileId,
                name: "Paracetamol",
                dosage: "500mg",
                frequency: "once_daily",
                startDate: "2026-01-01",
            });

        const medicationId = createRes.body.data._id;

        const updateRes = await request(app)
            .put(`/api/medications/${medicationId}`)
            .set("Authorization", `Bearer ${userB.token}`)
            .send({
                dosage: "1000mg",
            });

        expect(updateRes.statusCode).toBe(403);
    });

    it("archive a medication", async () => {
        const { token } = await createTestUserAndToken();
        const profileId = await createProfile(token);

        const creatRes = await request(app)
            .post("/api/medications")
            .set("Authorization", `Bearer ${token}`)
            .send({
                profileId,
                name: "Paracetamol",
                dosage: "500mg",
                frequency: "once_daily",
                startDate: "2026-01-01",
            });

        const medicationId = creatRes.body.data._id;

        const archiveRes = await request(app)
            .delete(`/api/medications/${medicationId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(archiveRes.statusCode).toBe(200);
    });

    it("returns 404 for a made-up medication ID", async () => {
        const { token } = await createTestUserAndToken();

        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .get(`/api/medications/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });
});
