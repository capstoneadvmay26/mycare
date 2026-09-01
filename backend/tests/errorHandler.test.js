const errorHandler = require("../src/middlewares/errorHandler");

describe("Global Error Handler", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      method: "GET",
      originalUrl: "/api/v1/test",
      requestId: "test-request-id",
      user: {
        id: "test-user-id",
      },
      get: jest.fn((header) => {
        if (header === "X-Request-ID") {
          return "test-request-id";
        }

        return undefined;
      }),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 500 for a generic error", () => {
    const error = new Error("Database exploded");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "An unexpected error occurred.",
      code: "INTERNAL_SERVER_ERROR",
      requestId: "test-request-id",
    });

    expect(console.error).toHaveBeenCalled();
  });

  it("should not expose the internal error message for a 500 error", () => {
    const error = new Error(
      "MongoDB connection string/password leaked"
    );

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "An unexpected error occurred.",
      code: "INTERNAL_SERVER_ERROR",
      requestId: "test-request-id",
    });
  });

  it("should return 400 for a Mongoose CastError", () => {
    const error = new Error("Cast to ObjectId failed");

    error.name = "CastError";

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid ID format",
      code: "INVALID_ID",
      requestId: "test-request-id",
    });

    expect(console.warn).toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should return 409 for a duplicate key error", () => {
    const error = new Error("Duplicate key");

    error.code = 11000;
    error.keyValue = {
      email: "test@example.com",
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "A resource with this email already exists.",
      code: "DUPLICATE_RESOURCE",
      requestId: "test-request-id",
    });
  });

  it("should return 400 for a Mongoose validation error", () => {
    const error = new Error("Validation failed");

    error.name = "ValidationError";
    error.errors = {
      email: {
        path: "email",
        message: "Email is required",
      },
      fullName: {
        path: "fullName",
        message: "Full name is required",
      },
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      requestId: "test-request-id",
      errors: [
        {
          field: "email",
          message: "Email is required",
        },
        {
          field: "fullName",
          message: "Full name is required",
        },
      ],
    });
  });

  it("should preserve a custom 403 error", () => {
    const error = new Error("Forbidden");

    error.statusCode = 403;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden",
      code: "FORBIDDEN",
      requestId: "test-request-id",
    });
  });

  it("should return 401 for an unauthorized error", () => {
    const error = new Error("Authentication required");

    error.statusCode = 401;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication required",
      code: "UNAUTHORIZED",
      requestId: "test-request-id",
    });
  });

  it("should return 404 for a not-found error", () => {
    const error = new Error("Profile not found");

    error.statusCode = 404;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Profile not found",
      code: "NOT_FOUND",
      requestId: "test-request-id",
    });
  });

  it("should handle invalid JSON bodies", () => {
    const error = new SyntaxError("Unexpected token");

    error.status = 400;
    error.body = "{invalid json}";

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Request body contains invalid JSON.",
      code: "INVALID_JSON",
      requestId: "test-request-id",
    });
  });

  it("should fall back safely when requestId is unavailable", () => {
    req.requestId = undefined;
    req.get = jest.fn(() => undefined);

    const error = new Error("Something went wrong");

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "An unexpected error occurred.",
      code: "INTERNAL_SERVER_ERROR",
      requestId: "unknown",
    });
  });
});
