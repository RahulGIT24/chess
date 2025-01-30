import jwt from "jsonwebtoken";
import { asyncHandler } from "../lib/asyncHandler.js";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../lib/ApiResponse.js";
import { DecodedToken } from "../types/types.js";

const prisma = new PrismaClient();

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accesstoken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiResponse(403, null, "Unauthorized Access");
      }

      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as DecodedToken;

      const user = await prisma.user.findUnique({
        where: { id: decodedToken.user_id },
        select: {
          id: true,
          name: true,
          profilePicture: true,
          createdAt: true,
          email: true,
        },
      });

      if (!user) {
        throw new ApiResponse(403, null, "User not found");
      }

      // Attach the user to the request object for further use in other routes
      (req as any).user = user;
      next();
    } catch (error) {
      if (error instanceof ApiResponse) {
        return res.status(error.statuscode).json(error);
      }
      // Fallback for unhandled errors
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error"));
    }
  }
);
