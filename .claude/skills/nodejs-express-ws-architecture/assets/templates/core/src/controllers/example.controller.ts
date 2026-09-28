import { asyncHandler } from "../lib/asyncHandler";
import { ApiResponse } from "../lib/ApiResponse";

// Rename this file and the exports below to match the real resource (e.g. order.controller.ts).
// Controllers only: validate/parse input, call a domain/lib function, return an ApiResponse.
// They do NOT contain their own try/catch — a thrown ApiResponse (or any error) is caught by
// the centralized errorHandler middleware because the handler is wrapped in asyncHandler.

export const listExamples = asyncHandler(async (req, res) => {
  const items: unknown[] = [];
  return res.status(200).json(new ApiResponse(200, items, "Fetched"));
});

export const getExample = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = null; // replace with a real lookup

  if (!item) {
    throw new ApiResponse(404, null, "Not found");
  }

  return res.status(200).json(new ApiResponse(200, item, "Fetched"));
});
