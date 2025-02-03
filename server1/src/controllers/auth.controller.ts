import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { client } from "../lib/googleclient";
import jwt from "jsonwebtoken"
import { DecodedToken } from "../types/types";
import { prisma } from "../lib/prisma";

const generateAccessandRefreshTokens = ({ email, user_id }: { email: string, user_id: string }) => {
    const accessToken = jwt.sign({
        email, user_id
    }, process.env.JWT_SECRET!, { expiresIn: "2h" })

    const refreshToken = jwt.sign({
        user_id
    }, process.env.JWT_SECRET_REFRESH!, { expiresIn: "12h" })

    return { accessToken, refreshToken }
}

export const googleAuth = asyncHandler(async (req, res) => {
    const { credential, client_id } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: client_id,
        });

        const payload = ticket.getPayload();

        if (payload) {
            const email = payload.email;

            let user = await prisma.user.findUnique({
                where: { email: email },
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        name: payload.name as string,
                        email: payload.email as string,
                        profilePicture: payload.picture,
                    },
                });
                await prisma.rating.create({
                    data:{
                        player:user.id
                    }
                })
            }

            const { accessToken, refreshToken } = generateAccessandRefreshTokens({
                user_id: user.id,
                email: user.email,
            });

            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: refreshToken },
            });
            
            return res.status(200)
                .cookie("accesstoken", accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                })
                .cookie("refreshtoken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                })
                .json(new ApiResponse(200, {user,accessToken,refreshToken}, "Signed In"));
        } else {
            throw new ApiResponse(400, null, "Error while getting user id from Google");
        }
    } catch (error) {
        console.log(error);
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error);
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingToken = req.cookies.refreshtoken;
        if (!incomingToken) {
            return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        }

        const decodedToken = jwt.verify(incomingToken, process.env.JWT_SECRET_REFRESH!) as DecodedToken;
        const userId = decodedToken.user_id;

        // Fetch user from Prisma
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiResponse(401, null, "Token Expired");
        }

        if (incomingToken !== user.refreshToken) {
            throw new ApiResponse(404, null, "Invalid Refresh Token");
        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "strict",  // Added security
        };

        const { accessToken, refreshToken } = generateAccessandRefreshTokens({
            user_id: user.id,
            email: user.email,
        });

        return res.status(200)
            .cookie("accesstoken", accessToken, options)
            .cookie("refreshtoken", refreshToken, options)
            .json(new ApiResponse(200, null, "Access token refreshed"));

    } catch (error) {
        console.log(error);
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error);
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});

export const getLoggedInUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;  // Assuming req.user contains the decoded user info
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json(new ApiResponse(404, null, "User not found"));
        }

        return res.status(200).json(new ApiResponse(200, user, "User Fetched"));

    } catch (error) {
        console.log(error);
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error);
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});


export const logout = asyncHandler(async (req, res) => {
    try {
        res.clearCookie("accesstoken");
        res.clearCookie("refreshtoken");
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        const userId = req.user.id;  // Assuming req.user contains the decoded user info

        // Find user by ID and update the refresh token to null
        const user = await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });

        return res.status(200).json(new ApiResponse(200, null, "Logged Out"));

    } catch (error) {
        console.log(error);
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error);
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});
