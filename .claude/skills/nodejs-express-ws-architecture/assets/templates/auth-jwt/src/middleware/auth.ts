import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiResponse } from "../lib/ApiResponse";
import { prisma } from "../lib/prisma";
import { DecodedToken } from "../lib/jwt";

// Errors here are thrown as ApiResponse and handled by the centralized errorHandler —
// no try/catch needed in this file itself.
export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiResponse(403, null, "Unauthorized Access");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.user_id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      throw new ApiResponse(403, null, "User not found");
    }

    (req as any).user = user;
    next();
  }
);
