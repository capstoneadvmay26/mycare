// src/middlewares/errorHandler.js
//
// Centralized error handler — catches errors from anywhere in the app
// so responses stay consistent, and specifically converts Mongoose's
// CastError (malformed/invalid ID format) into a clean 400 instead of
// a raw 500 crash page.

function errorHandler(err, req, res, next) {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred!";

  // Happens when an ID in the URL isn't a valid MongoDB ObjectId format.
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Happens if something marked unique (like email) already exists.
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;