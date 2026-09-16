const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const { connectTestDB, closeTestDB, clearTestDB } = require("./setup");
const { createTestUserAndToken } = require("./testHelpers");

beforeAll(async () => await connectTestDB());
afterAll(async () => await closeTestDB());
afterEach(async () => await clearTestDB());

describe("Profile CRUD", () => {
  it("create a self profile", async () => {
    const { token } = await createTestUserAndToken();

    const res = await request(app)
      .post("/api/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Chibundu Ahamefula", isSelf: true });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.isSelf).toBe(true);
  });

  it("create a dependent profile requiring a relationship", async () => {
    const { token } = await createTestUserAndToken();

    const res = await request(app)
      .post("/api/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Chinadu Ahamefula", isSelf: false, relationship: "Son" });

    expect(res.statusCode).toBe(201);
  });

  it("rejects a dependent profile with no relationship", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .post("/api/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Chinadu Ahamefula", isSelf: false });

    expect(res.statusCode).toBe(400);
  });

  it("prevents creating a second self profile", async () => {
    const { token } = await createTestUserAndToken();

    await request(app)
      .post("/api/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Chibundu Ahamefula", isSelf: true });

    const res = await request(app)
      .post("/api/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Chibundu Ahamefula", isSelf: true });

    expect(res.statusCode).toBe(400);
  });

  it("blocks access to another user's profile", async () => {
    const UserA = await createTestUserAndToken("a@example.com");
    const UserB = await createTestUserAndToken("b@example.com");

    const createRes = await request(app)
      .post("/api/profiles")
      .set("Authorization", `Bearer ${UserA.token}`)
      .send({ fullName: "User A Self", isSelf: true });

    const profileId = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/profiles/${profileId}`)
      .set("Authorization", `Bearer ${UserB.token}`);

    expect(res.statusCode).toBe(403);
  });

  it("returns 404 for a made-up profile ID", async () => {
    const { token } = await createTestUserAndToken();

    // Generate a real, correctly-formatted ObjectId that simply doesn't
    // exist in the database — avoids manually counting characters,
    // which is error-prone and was the cause of the earlier 500 error.
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/profiles/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for a malformed profile ID", async () => {
    const { token } = await createTestUserAndToken();

    const res = await request(app)
      .get("/api/profiles/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  it("archives a profile instead of deleting it", async () => {
    const { token } = await createTestUserAndToken();

    const createRes = await request(app)
      .post("/api/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Chibundu Ahamefula", isSelf: true });

    const profileId = createRes.body.data._id;

    const archiveRes = await request(app)
      .delete(`/api/profiles/${profileId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(archiveRes.statusCode).toBe(200);

    const listRes = await request(app)
      .get("/api/profiles")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.body.data.length).toBe(0); // archived profiles excluded from active list
  });

  it("rejects unauthenticated requests to list profiles", async () => {
    const res = await request(app)
      .get("/api/profiles");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects unauthenticated requests to create a profile", async () => {
    const res = await request(app)
      .post("/api/profiles")
      .send({
        fullName: "Unauthenticated User",
        isSelf: true,
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
