import { Router } from "express";
import {  getLoggedInUser, googleAuth } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

router.post("/google-auth",googleAuth)
router.get("/get-user",verifyJWT, getLoggedInUser)

export default router;