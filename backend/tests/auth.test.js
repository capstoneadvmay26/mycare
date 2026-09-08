// tests/auth.test.js

// tests/auth.test.js

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../src/app");

const User = require("../src/models/user.model");
const OtpVerification =
    require("../src/models/otpVerification.model");

const {
    generateOtp,
    hashOtp,
} = require("../src/utils/otp");

jest.mock(
    "../src/utils/otpSender",
    () => ({
        sendOtp: jest
            .fn()
            .mockResolvedValue(
                undefined
            ),
    })
);

const {
    sendOtp,
} = require("../src/utils/otpSender");

const {
    connectTestDB,
    closeTestDB,
    clearTestDB,
} = require("./setup");

beforeAll(async () => {
    process.env.JWT_SECRET =
        "test-jwt-secret";

    process.env.NODE_ENV =
        "test";

    await connectTestDB();
});

afterEach(async () => {
    jest.clearAllMocks();

    await clearTestDB();
});

afterAll(async () => {
    await closeTestDB();
});

describe(
    "Authentication API",
    () => {
        const email =
            "otp-test@example.com";

        describe(
            "POST /api/v1/auth/request-otp",
            () => {
                it(
                    "creates and sends an OTP",
                    async () => {
                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/request-otp"
                                )
                                .send({
                                    method:
                                        "email",
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

                        expect(
                            sendOtp
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            sendOtp
                        ).toHaveBeenCalledWith(
                            expect.objectContaining(
                                {
                                    method:
                                        "email",
                                    identifier:
                                        email,
                                    otp:
                                        expect.stringMatching(
                                            /^\d{6}$/
                                        ),
                                }
                            )
                        );

                        const record =
                            await OtpVerification
                                .findOne({
                                    method:
                                        "email",
                                    identifier:
                                        email,
                                })
                                .select(
                                    "+otp_hash"
                                );

                        expect(
                            record
                        ).not.toBeNull();

                        expect(
                            record.otp_hash
                        ).toHaveLength(
                            64
                        );

                        expect(
                            record.expires_at
                        ).toBeInstanceOf(
                            Date
                        );

                        expect(
                            record.verified
                        ).toBe(false);
                    }
                );

                it(
                    "rejects an invalid OTP method",
                    async () => {
                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/request-otp"
                                )
                                .send({
                                    method:
                                        "sms",
                                    email,
                                });

                        expect(
                            response.statusCode
                        ).toBe(400);

                        expect(
                            response.body
                                .success
                        ).toBe(false);

                        expect(
                            sendOtp
                        ).not.toHaveBeenCalled();
                    }
                );

                it(
                    "rejects a missing email",
                    async () => {
                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/request-otp"
                                )
                                .send({
                                    method:
                                        "email",
                                });

                        expect(
                            response.statusCode
                        ).toBe(400);

                        expect(
                            response.body
                                .success
                        ).toBe(false);
                    }
                );

                it(
                    "enforces the resend cooldown",
                    async () => {
                        const first =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/request-otp"
                                )
                                .send({
                                    method:
                                        "email",
                                    email,
                                });

                        expect(
                            first.statusCode
                        ).toBe(200);

                        const second =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/request-otp"
                                )
                                .send({
                                    method:
                                        "email",
                                    email,
                                });

                        expect(
                            second.statusCode
                        ).toBe(429);

                        expect(
                            second.body
                                .success
                        ).toBe(false);
                    }
                );
            }
        );

        describe(
            "POST /api/v1/auth/verify-otp",
            () => {
                it(
                    "verifies a valid OTP for a new user",
                    async () => {
                        const otp =
                            generateOtp();

                        await OtpVerification.create(
                            {
                                method:
                                    "email",

                                identifier:
                                    email,

                                otp_hash:
                                    hashOtp(
                                        otp
                                    ),

                                expires_at:
                                    new Date(
                                        Date.now() +
                                            10 *
                                                60 *
                                                1000
                                    ),

                                attempts: 0,

                                last_sent_at:
                                    new Date(),

                                verified:
                                    false,
                            }
                        );

                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/verify-otp"
                                )
                                .send({
                                    method:
                                        "email",
                                    identifier:
                                        email,
                                    otp,
                                });

                        expect(
                            response.statusCode
                        ).toBe(200);

                        expect(
                            response.body
                                .token
                        ).toEqual(
                            expect.any(
                                String
                            )
                        );

                        expect(
                            response.body
                                .is_new_user
                        ).toBe(true);

                        const record =
                            await OtpVerification
                                .findOne({
                                    method:
                                        "email",
                                    identifier:
                                        email,
                                });

                        expect(
                            record.verified
                        ).toBe(true);

                        expect(
                            record
                                .verification_token_id
                        ).toEqual(
                            expect.any(
                                String
                            )
                        );
                    }
                );

                it(
                    "rejects an invalid OTP",
                    async () => {
                        await OtpVerification.create(
                            {
                                method:
                                    "email",

                                identifier:
                                    email,

                                otp_hash:
                                    hashOtp(
                                        "123456"
                                    ),

                                expires_at:
                                    new Date(
                                        Date.now() +
                                            10 *
                                                60 *
                                                1000
                                    ),

                                attempts: 0,

                                last_sent_at:
                                    new Date(),

                                verified:
                                    false,
                            }
                        );

                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/verify-otp"
                                )
                                .send({
                                    method:
                                        "email",
                                    identifier:
                                        email,
                                    otp:
                                        "654321",
                                });

                        expect(
                            response.statusCode
                        ).toBe(400);

                        expect(
                            response.body
                                .message
                        ).toMatch(
                            /invalid otp/i
                        );

                        const record =
                            await OtpVerification
                                .findOne({
                                    method:
                                        "email",
                                    identifier:
                                        email,
                                });

                        expect(
                            record.attempts
                        ).toBe(1);
                    }
                );

                it(
                    "rejects an expired OTP",
                    async () => {
                        await OtpVerification.create(
                            {
                                method:
                                    "email",

                                identifier:
                                    email,

                                otp_hash:
                                    hashOtp(
                                        "123456"
                                    ),

                                expires_at:
                                    new Date(
                                        Date.now() -
                                            1000
                                    ),

                                attempts: 0,

                                last_sent_at:
                                    new Date(),

                                verified:
                                    false,
                            }
                        );

                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/verify-otp"
                                )
                                .send({
                                    method:
                                        "email",
                                    identifier:
                                        email,
                                    otp:
                                        "123456",
                                });

                        expect(
                            response.statusCode
                        ).toBe(400);

                        expect(
                            response.body
                                .message
                        ).toMatch(
                            /expired/i
                        );
                    }
                );

                it(
                    "rejects an OTP after too many failed attempts",
                    async () => {
                        await OtpVerification.create(
                            {
                                method:
                                    "email",

                                identifier:
                                    email,

                                otp_hash:
                                    hashOtp(
                                        "123456"
                                    ),

                                expires_at:
                                    new Date(
                                        Date.now() +
                                            10 *
                                                60 *
                                                1000
                                    ),

                                attempts: 5,

                                last_sent_at:
                                    new Date(),

                                verified:
                                    false,
                            }
                        );

                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/verify-otp"
                                )
                                .send({
                                    method:
                                        "email",
                                    identifier:
                                        email,
                                    otp:
                                        "123456",
                                });

                        expect(
                            response.statusCode
                        ).toBe(429);
                    }
                );
            }
        );

        describe(
            "POST /api/v1/auth/register",
            () => {
                it(
                    "rejects registration without OTP verification",
                    async () => {
                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/register"
                                )
                                .send({
                                    full_name:
                                        "Test User",
                                    date_of_birth:
                                        "1995-05-15",
                                    gender:
                                        "Male",
                                    password:
                                        "Password123",
                                });

                        expect(
                            response.statusCode
                        ).toBe(401);

                        expect(
                            response.body
                                .message
                        ).toMatch(
                            /OTP verification is required/i
                        );
                    }
                );

                it(
                    "rejects registration with a normal access token",
                    async () => {
                        const user =
                            await User.create(
                                {
                                    full_name:
                                        "Existing User",
                                    email:
                                        "existing@example.com",
                                    password:
                                        "hashed-password",
                                }
                            );

                        const jwt =
                            require(
                                "jsonwebtoken"
                            );

                        const token =
                            jwt.sign(
                                {
                                    id:
                                        user._id,
                                },
                                process.env
                                    .JWT_SECRET
                            );

                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/auth/register"
                                )
                                .set(
                                    "Authorization",
                                    `Bearer ${token}`
                                )
                                .send({
                                    full_name:
                                        "Test User",
                                    password:
                                        "Password123",
                                });

                        expect(
                            response.statusCode
                        ).toBe(401);
                    }
                );
            }
        );

        describe(
            "Authentication namespace",
            () => {
                it(
                    "does not use the old users namespace",
                    async () => {
                        const response =
                            await request(
                                app
                            )
                                .post(
                                    "/api/v1/users/register"
                                )
                                .send({
                                    full_name:
                                        "Test User",
                                    password:
                                        "Password123",
                                });

                        expect(
                            response.statusCode
                        ).toBe(404);
                    }
                );
            }
        );
    }
);
