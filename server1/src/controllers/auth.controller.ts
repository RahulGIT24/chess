import { ApiResponse } from "../lib/ApiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { client } from "../lib/googleclient";
import User from "../models/user.model";

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

            const checkExistingUser = await User.findOne({email:email})

            if(checkExistingUser){
                return res.status(200).json(new ApiResponse(200, checkExistingUser, "Welcome Back"))
            }

            const newUser = await User.create({
                name: payload.name,
                email: payload.email,
                profilePicture: payload.picture
            })

            return res.status(200).json(new ApiResponse(200, newUser, "Signed Up Successfully"))
        } else {
            throw new ApiResponse(400, null, "Error while getting user id from google")
        }
    } catch (error) {
        if (error instanceof ApiResponse) {
            return res.status(error.statuscode).json(error)
        }
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"))
    }
})