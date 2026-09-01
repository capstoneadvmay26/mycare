const request = require("supertest");
const app = require("../src/app");

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

describe("Authentication Endpoints", () => {
    const testUser = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
    };

    let token = "";

    // Test successful user registration
    it("should register a new user successfully", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toHaveProperty("email", testUser.email);
    });

    // Test registration with missing fields
    it("should return 400 for incomplete registration data", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .send({
                email: "incomplete@example.com",
            });

        expect(res.statusCode).toEqual(400);
    });

    // Test successful login
    it("should authenticate user and return JWT token", async () => {
        // Register the user first because the test database is cleared
        // after every test.
        await request(app)
            .post("/api/v1/users/register")
            .send(testUser);

        const res = await request(app)
            .post("/api/v1/users/login")
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");

        token = res.body.token;
    });

    // Test login with invalid credentials
    it("should reject login with wrong password", async () => {
        // Register the user first because each test gets a clean database.
        await request(app)
            .post("/api/v1/users/register")
            .send(testUser);

        const res = await request(app)
            .post("/api/v1/users/login")
            .send({
                email: testUser.email,
                password: "WrongPassword",
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toMatch(/invalid credentials/i);
    });

    // Test protected route with valid JWT
    it("should allow access to protected route with valid token", async () => {
        // Register and login inside this test so it does not depend
        // on another test running before it.
        await request(app)
            .post("/api/v1/users/register")
            .send(testUser);

        const loginRes = await request(app)
            .post("/api/v1/users/login")
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        token = loginRes.body.token;

        const res = await request(app)
            .get("/api/v1/users/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("user");
    });

    // Test protected route without token
    it("should deny access to protected route without token", async () => {
        const res = await request(app)
            .get("/api/v1/users/me");

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toMatch(/no token provided/i);
    });

    // Test protected route with invalid JWT
    it("should deny access to protected route with invalid token", async () => {
        const res = await request(app)
            .get("/api/v1/users/me")
            .set("Authorization", "Bearer this-is-not-a-valid-jwt");

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toMatch(/invalid or expired token/i);
    });
});
