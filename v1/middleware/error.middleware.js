import mongoose from "mongoose";

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Joi validation error
  if (err.isJoi) {
    statusCode = 400;

    message = err.details.map((detail) => detail.message).join(", ");
  }

  // MongoDB / Mongoose invalid ObjectId
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyValue || {})[0];

    message = field ? `${field} already exists` : "Duplicate resource";
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
