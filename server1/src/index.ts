import { CONNECT } from './lib/messages';
import { WebSocketServer } from 'ws';
import { GameManager } from './game/GameManager';
import dotenv from "dotenv"
import cors from "cors"
import express from "express"
import cookieParser from "cookie-parser"

const app = express();

dotenv.config({
    path: ".env"
})

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

const PORT = process.env.SERVER_PORT || 5001


const wss = new WebSocketServer({ port: Number(process.env.SOCKET_PORT) });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on("close", () => gameManager.removeUser(ws))

    ws.on('message', async function message(data) {
        const parseData = JSON.parse(String(data));
        if (parseData.type === CONNECT) {
            if (!parseData.id) return;

            // console.log(parseData)
            const user = await prisma.user.findFirst({
                where:{
                    id:parseData.id
                }
            })

            if (user) {
                gameManager.addUser(ws,parseData.id);
            }
            return;
        }
    });

    ws.send('something');
});

// imports for routes
import authRoutes from "./routes/auth.routes.js"
import { prisma } from './lib/prisma';

app.use("/auth", authRoutes)

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
})