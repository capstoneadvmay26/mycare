const errorHandler = require("../src/middlewares/errorHandler");

describe("Global Error Handler", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

        // errorHandler currently logs errors.
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return 500 for a generic error", () => {
        const error = new Error("Something went wrong");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Something went wrong",
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
        });
    });

    it("should return 400 for a duplicate key error", () => {
        const error = new Error("Duplicate key");
        error.code = 11000;
        error.keyValue = {
            email: "test@example.com",
        };

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "An account with this email already exists.",
        });
    });

    it("should use a custom statusCode when provided", () => {
        const error = new Error("Forbidden");
        error.statusCode = 403;

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Forbidden",
        });
    });
});
