import jwt from "jsonwebtoken";
import { asyncHandler } from "../lib/asyncHandler.js";
import User from "../models/user.model.js";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../lib/ApiResponse.js";
import { DecodedToken } from "../types/types.js";

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
          throw new ApiResponse(401,null,"Unauthorized Access");
        }
        
        const decodedToken = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as DecodedToken;
        

      const user = await User.findById(decodedToken.user_id).select(
        "_id  name profilePicture createdAt email"
      );

      if (!user) {
        throw new ApiResponse(401,null,"User not found");
      }

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