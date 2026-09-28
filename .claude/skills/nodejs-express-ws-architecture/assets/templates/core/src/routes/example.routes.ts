import { Router } from "express";
import { getExample, listExamples } from "../controllers/example.controller";

// Rename to the real resource (e.g. order.routes.ts) and mount it in index.ts as
// app.use("/orders", orderRoutes). Add middleware (e.g. verifyJWT) per-route as needed.

const router = Router();

router.get("/", listExamples);
router.get("/:id", getExample);

export default router;
