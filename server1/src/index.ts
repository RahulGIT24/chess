import { WebSocketServer } from 'ws';
import { GameManager } from './game/GameManager';
import dotenv from "dotenv"
import cors from "cors"
import express from "express"

const app = express();

app.use(cors({
    origin: "*"
}))

app.use(express.json())

const PORT = process.env.SERVER_PORT || 5001

dotenv.config({
    path: ".env"
})

const wss = new WebSocketServer({ port: Number(process.env.SOCKET_PORT) });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    gameManager.addUser(ws);

    ws.on("close", () => gameManager.removeUser(ws))

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
});

// imports for routes
import authRoutes from "./routes/auth.routes.js"
import { dbConnect } from './lib/connectToDB';

app.use("/auth", authRoutes)

dbConnect().then(() =>
    app.listen(PORT, () => {
        console.log(`Listening on PORT ${PORT}`)
    })).catch(e => console.log(e))