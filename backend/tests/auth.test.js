// tests/auth.test.js

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");

const User = require("../src/models/user.model");
const OtpVerification = require("../src/models/otpVerification.model");

const {
    connectTestDB,
    closeTestDB,
    clearTestDB,
} = require("./setup");

beforeAll(async () => {
    process.env.JWT_SECRET =
        "test-jwt-secret";

    await connectTestDB();
});

afterEach(async () => {
    await clearTestDB();
});

afterAll(async () => {
    await closeTestDB();
});

describe("MYCARE Authentication", () => {
    const email =
        "otp-test@example.com";

    describe("POST /api/v1/auth/request-otp", () => {
        it("creates an OTP verification record", async () => {
            const response =
                await request(app)
                    .post(
                        "/api/v1/auth/request-otp"
                    )
                    .send({
                        method: "email",
                        email,
                    });

            expect(
                response.statusCode
            ).toBe(200);

            expect(
                response.body
            ).toEqual({
                success: true,
            });

            const record =
                await OtpVerification.findOne({
                    method: "email",
                    identifier: email,
                }).select(
                    "+otp_hash"
                );

            expect(record).not.toBeNull();
            expect(
                record.otp_hash
            ).toHaveLength(64);

            expect(
                record.expires_at
            ).toBeInstanceOf(Date);
        });

        it("rejects invalid method", async () => {
            const response =
                await request(app)
                    .post(
                        "/api/v1/auth/request-otp"
                    )
                    .send({
                        method: "sms",
                        email,
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.success
            ).toBe(false);
        });
    });

    describe("POST /api/v1/auth/verify-otp", () => {
        it("rejects an invalid OTP", async () => {
            await request(app)
                .post(
                    "/api/v1/auth/request-otp"
                )
                .send({
                    method: "email",
                    email,
                });

            const response =
                await request(app)
                    .post(
                        "/api/v1/auth/verify-otp"
                    )
                    .send({
                        method: "email",
                        identifier: email,
                        otp: "000000",
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.success
            ).toBe(false);
        });

        it("rejects malformed OTP", async () => {
            const response =
                await request(app)
                    .post(
                        "/api/v1/auth/verify-otp"
                    )
                    .send({
                        method: "email",
                        identifier: email,
                        otp: "123",
                    });

            expect(
                response.statusCode
            ).toBe(400);
        });
    });

    describe("Registration protection", () => {
        it("rejects registration without OTP verification", async () => {
            const response =
                await request(app)
                    .post(
                        "/api/v1/auth/register"
                    )
                    .send({
                        full_name:
                            "Test User",
                        date_of_birth:
                            "1995-05-15",
                        gender: "Male",
                        password:
                            "Password123",
                    });

            expect(
                response.statusCode
            ).toBe(401);

            expect(
                response.body.message
            ).toMatch(
                /OTP verification is required/i
            );
        });
    });

    describe("Authentication namespace", () => {
        it("does not expose the old users registration endpoint", async () => {
            const response =
                await request(app)
                    .post(
                        "/api/v1/users/register"
                    )
                    .send({
                        name: "Test User",
                        email:
                            "old@example.com",
                        password:
                            "Password123",
                    });

            expect(
                response.statusCode
            ).toBe(404);
        });
    });
});
