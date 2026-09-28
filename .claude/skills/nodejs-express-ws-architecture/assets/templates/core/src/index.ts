import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import exampleRoutes from "./routes/example.routes";
import { errorHandler } from "./middleware/errorHandler";

// This file is a composition root only: build the app, wire middleware and routes, listen.
// Business logic does not belong here — see routes/, controllers/, and any domain module.

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/examples", exampleRoutes);

// --- If a real-time layer was added (assets/templates/websocket/), splice its
//     WebSocketServer setup in here — see websocket/src/index.ws-snippet.ts.

// --- If a background worker was added (assets/templates/worker/), fork it here:
// import { fork } from "child_process";
// import path from "path";
// fork(path.resolve(__dirname, "./worker/scheduler.js"));

// Centralized error handler must be registered AFTER all routes.
app.use(errorHandler);

const PORT = process.env.SERVER_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
