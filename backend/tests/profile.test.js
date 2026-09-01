const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const {
  connectTestDB,
  closeTestDB,
  clearTestDB,
} = require("./setup");
const { createTestUserAndToken } = require("./testHelpers");

beforeAll(async () => await connectTestDB());
afterAll(async () => await closeTestDB());
afterEach(async () => await clearTestDB());

describe("Profile CRUD", () => {
  it("creates a self profile", async () => {
    const { token } = await createTestUserAndToken();

    const res = await request(app)
      .post("/api/v1/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Chibundu Ahamefula",
        isSelf: true,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.fullName || res.body.profile.name).toBe(
      "Chibundu Ahamefula"
    );
    expect(res.body.profile.id).toBeDefined();
  });

  it("creates a dependent profile requiring a relationship", async () => {
    const { token } = await createTestUserAndToken();

    const res = await request(app)
      .post("/api/v1/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Chinadu Ahamefula",
        isSelf: false,
        relationship: "Son",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.fullName || res.body.profile.name).toBe(
      "Chinadu Ahamefula"
    );
    expect(res.body.profile.relationship).toBe("Son");
  });

  it("rejects a dependent profile with no relationship", async () => {
    const { token } = await createTestUserAndToken();

    const res = await request(app)
      .post("/api/v1/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Chinadu Ahamefula",
        isSelf: false,
      });

    expect(res.statusCode).toBe(400);
  });

  it("prevents creating a second self profile", async () => {
    const { token } = await createTestUserAndToken();

    await request(app)
      .post("/api/v1/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Chibundu Ahamefula",
        isSelf: true,
      });

    const res = await request(app)
      .post("/api/v1/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Chibundu Ahamefula",
        isSelf: true,
      });

    expect(res.statusCode).toBe(400);
  });

  it("blocks access to another user's profile", async () => {
    const userA = await createTestUserAndToken("a@example.com");
    const userB = await createTestUserAndToken("b@example.com");

    const createRes = await request(app)
      .post("/api/v1/profiles")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        fullName: "Chibundu Ahamefula",
        isSelf: true,
      });

    expect(createRes.statusCode).toBe(201);

    const profileId = createRes.body.profile.id;

    const res = await request(app)
      .get(`/api/v1/profiles/${profileId}`)
      .set("Authorization", `Bearer ${userB.token}`);

    // Ownership is part of the lookup query, so another user's
    // profile is intentionally indistinguishable from a missing profile.
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for a made-up profile ID", async () => {
    const { token } = await createTestUserAndToken();

    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/v1/profiles/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for a malformed profile ID", async () => {
    const { token } = await createTestUserAndToken();

    const res = await request(app)
      .get("/api/v1/profiles/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  it("archives a profile instead of deleting it", async () => {
    const { token } = await createTestUserAndToken();

    const createRes = await request(app)
      .post("/api/v1/profiles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Chibundu Ahamefula",
        isSelf: true,
      });

    expect(createRes.statusCode).toBe(201);

    const profileId = createRes.body.profile.id;

    const archiveRes = await request(app)
      .delete(`/api/v1/profiles/${profileId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(archiveRes.statusCode).toBe(200);
    expect(archiveRes.body.success).toBe(true);

    const listRes = await request(app)
      .get("/api/v1/profiles")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.profiles).toHaveLength(0);
  });

  it("rejects unauthenticated requests to list profiles", async () => {
    const res = await request(app).get("/api/v1/profiles");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects unauthenticated requests to create a profile", async () => {
    const res = await request(app)
      .post("/api/v1/profiles")
      .send({
        fullName: "Chinadu Ahamefula",
        isSelf: false,
        relationship: "Son",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
