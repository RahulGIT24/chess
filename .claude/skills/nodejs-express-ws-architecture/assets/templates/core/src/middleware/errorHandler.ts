import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../lib/ApiResponse";

/**
 * Centralized error handler. Mount this LAST, after all routes.
 * Combined with asyncHandler, this is the ONLY place that converts a thrown/rejected
 * error into a response — controllers should not also try/catch and format errors themselves.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiResponse) {
    return res.status(err.statuscode).json(err);
  }

  console.error(err);
  return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
};
