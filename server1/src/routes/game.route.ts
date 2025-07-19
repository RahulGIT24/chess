import { Router } from "express";
import { getGame,  getGamesOfUser } from "../controllers/game.controller.js";
import { verifyJWT } from "../middleware/auth.js";
const router = Router();

router.get("/",getGame)
router.get("/mygames",verifyJWT,getGamesOfUser)
// router.get("/analyze-game",getGameReviews)

export default router;