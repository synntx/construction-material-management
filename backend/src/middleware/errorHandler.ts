import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import AppError from "../utils/appError";
import { ZodError } from "zod";
import logger from "../utils/logger";

const handleZodError = (res: Response, error: ZodError) => {
  logger.warn("Zod Validation Error", { errors: error.errors });
  res.status(BAD_REQUEST).json({
    success: false,
    statusCode: BAD_REQUEST,
    message: "Validation failed",
    errors: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  });
};

const handleAppError = (res: Response, error: AppError) => {
  logger.warn("Application Error", {
    message: error.message,
    statusCode: error.statusCode,
  });
  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ZodError) {
    return handleZodError(res, error);
  }

  if (error instanceof AppError) {
    return handleAppError(res, error);
  }

  logger.error("Unhandled Error", { error, stack: error.stack });
  res.status(INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: INTERNAL_SERVER_ERROR,
    message: "Internal Server Error",
  });
};

export default errorHandler;
