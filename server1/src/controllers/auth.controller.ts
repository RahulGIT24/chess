import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { client } from "../lib/googleclient";
import User from "../models/user.model";
import jwt from "jsonwebtoken"
import { DecodedToken } from "../types/types";

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
            audience: client_id
        })
        const payload = ticket.getPayload()
        if (payload) {

            const email = payload.email;

            let user = await User.findOne({ email: email })

            if (!user) {
                user = await User.create({
                    name: payload.name,
                    email: payload.email,
                    profilePicture: payload.picture,
                })
            }

            const { accessToken, refreshToken } = generateAccessandRefreshTokens({ user_id: user._id.toString(), email: user.email })

            user.refreshToken = refreshToken;
            await user.save();

            return res.status(200)
                .cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                })
                .cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                })
                .json(new ApiResponse(200, user, "Signed In"))
        } else {
            throw new ApiResponse(400, null, "Error while getting user id from google")
        }
    } catch (error) {
        console.log(error)
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error)
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"))
    }
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingToken = req.cokkies.refreshToken
        if (!incomingToken) {
            return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        }
        const decodedToken = jwt.verify(incomingToken, process.env.JWT_SECRET_REFRESH!) as DecodedToken;
        const userId = decodedToken.user_id

        const user = await User.findById(userId)
        if (!user) {
            throw new ApiResponse(401, null, "Token Expired");
        }
        if (incomingToken !== user?.refreshToken) {
            throw new ApiResponse(404, null, "Invalid Refresh Token");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } = generateAccessandRefreshTokens({ user_id: user._id.toString(), email: user.email })

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, null, "Access token refreshed"));

    } catch (error) {
        console.log(error)
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error)
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"))
    }
})

export const getLoggedInUser = asyncHandler(async(req,res)=>{
    try {
        const user = req.user;
        return res.status(200).json(new ApiResponse(200,user,"User Fetched"));
    } catch (error) {
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error)
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"))
    }
})