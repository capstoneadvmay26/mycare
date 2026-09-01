// src/middlewares/errorHandler.js
//
// Centralized application error handler.
//
// Responsibilities:
// - Normalize known application/Mongoose/Express errors.
// - Return a consistent JSON error response.
// - Never expose stack traces to API clients.
// - Log unexpected server errors with structured JSON.
// - Return the requestId so production errors can be traced.

function errorHandler(err, req, res, next) {
  const requestId =
    req.requestId ||
    req.get?.("X-Request-ID") ||
    "unknown";

  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected error occurred.";

  // ------------------------------------------------------------
  // Mongoose: invalid ObjectId
  // ------------------------------------------------------------
  if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid ID format";
  }

  // ------------------------------------------------------------
  // Mongoose: schema validation failure
  // ------------------------------------------------------------
  else if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";

    const errors = Object.values(err.errors || {}).map(
      (validationError) => ({
        field: validationError.path,
        message: validationError.message,
      })
    );

    logError({
      err,
      req,
      requestId,
      statusCode,
      code,
    });

    return res.status(statusCode).json({
      success: false,
      message: "Validation failed",
      code,
      requestId,
      errors,
    });
  }

  // ------------------------------------------------------------
  // Mongoose: duplicate key
  // ------------------------------------------------------------
  else if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_RESOURCE";

    const duplicateFields = Object.keys(
      err.keyValue || {}
    );

    const field = duplicateFields[0];

    if (field) {
      message = `A resource with this ${field} already exists.`;
    } else {
      message = "A resource with these values already exists.";
    }
  }

  // ------------------------------------------------------------
  // Express JSON parser error
  // ------------------------------------------------------------
  else if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Request body contains invalid JSON.";
  }

  // ------------------------------------------------------------
  // Normalize common explicit application errors
  // ------------------------------------------------------------
  else if (statusCode === 401) {
    code = "UNAUTHORIZED";
  } else if (statusCode === 403) {
    code = "FORBIDDEN";
  } else if (statusCode === 404) {
    code = "NOT_FOUND";
  } else if (statusCode >= 500) {
    statusCode = 500;
    code = "INTERNAL_SERVER_ERROR";
    message = "An unexpected error occurred.";
  }

  // ------------------------------------------------------------
  // Logging
  //
  // Expected client errors are informational.
  // Unexpected 5xx errors are logged as errors with the stack.
  // ------------------------------------------------------------
  logError({
    err,
    req,
    requestId,
    statusCode,
    code,
  });

  return res.status(statusCode).json({
    success: false,
    message,
    code,
    requestId,
  });
}

function logError({
  err,
  req,
  requestId,
  statusCode,
  code,
}) {
  const isServerError = statusCode >= 500;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: isServerError ? "error" : "warn",
    type: "http_error",
    requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    userId: req.user?.id || null,
    message: err.message || "Unknown error",
  };

  if (isServerError && err.stack) {
    logEntry.stack = err.stack;
  }

  const output = JSON.stringify(logEntry);

  if (isServerError) {
    console.error(output);
  } else {
    console.warn(output);
  }
}

module.exports = errorHandler;
