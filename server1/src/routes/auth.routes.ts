import { Router } from "express";
import {  getLoggedInUser, getUserRating, googleAuth, logout, refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

router.post("/google-auth",googleAuth)
router.get("/get-user",verifyJWT, getLoggedInUser)
router.get("/logout",verifyJWT,logout)
router.get("/refresh-token",refreshAccessToken)
router.get("/get-rating",verifyJWT,getUserRating)

export default router;