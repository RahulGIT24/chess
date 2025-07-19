import { WebSocket } from "ws";
import { Game } from "./Game";
import { DRAW_OFFER_REPLY, ERROR, INIT_GAME, MOVE, OFFER_DRAW, OPPO_DISCONNECT, RECONNECTED, RECONNECTING, RESIGN, TIME_UP } from "../lib/messages";
import { PendingUser } from "./PendingUsers";
import { minutesToMilliseconds } from "../lib/timeConstants";
import { v4 as uuidv4 } from 'uuid';
import { GameSave } from "./GameSave";
import redis from "../redis/RedisService"
import { prisma } from "../lib/prisma";
import { Pending } from "../types/types";
import { computeLeftTime } from "../lib/timeCompute";

interface User {
    socket: WebSocket,
    id: string
}

export class GameManager {
    private games: Game[]
    private static pendingUser: PendingUser = new PendingUser()
    private users: User[]
    private static GameDBCalls = new GameSave();

    constructor() {
        this.games = []
        this.users = []
    }

    async addUser(socket: WebSocket, id: string) {
        this.users.push({ socket, id })

        let game = this.games.find(g => g.player1.id === id || g.player2.id === id);

        if (game) {
            if (game.player1.id === id) {
                game.player1.socket = socket;
            } else {
                game.player2.socket = socket;
            }
            const player1Color = game.player1.color

            let player1Time = game.player1.timeLeft
            let player2Time = game.player2.timeLeft

            const { p1, p2 } = computeLeftTime(game.lastMoveTime, player1Color, game.currentColor, player1Time, player2Time)

            player1Time = p1;
            player2Time = p2

            const gameState = {
                id: game.id,
                player1: { id: game.player1.id, timeLeft: player1Time, color: game.player1.color, name: game.player1.name, profilePicture: game.player1.profilePicture },
                player2: { id: game.player2.id, timeLeft: player2Time, color: game.player2.color, name: game.player2.name, profilePicture: game.player2.profilePicture },
                fen: game.board.fen(),
                pgn: game.board.pgn(),
                offerState: game.offerState,
                lastMoveTime: game.lastMoveTime
            }

            socket.send(JSON.stringify({ type: RECONNECTED, payload: { game: gameState, message: "Game Recovered from memory" } }));
            this.addHandler(socket);
            return;
        }

        // not in memory check in db;
        const dbgame = await prisma.game.findFirst({
            where: {
                OR: [
                    { whiteId: id },
                    { blackId: id }
                ],
                winner: null,
                draw: false,
                resign: null
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        if (dbgame) {
            const gameIdKey = `game:${dbgame.id}`
            redis.get(gameIdKey).then(async (game) => {
                if (game) {
                    const parsedData = JSON.parse(game);
                    if (parsedData) {

                        const player1Socket = this.users.find(user => user.id === parsedData.player1.id);
                        const player2Socket = this.users.find(user => user.id === parsedData.player2.id);

                        if (player1Socket && player2Socket) {
                            const res = await this.recoverGame(parsedData, player1Socket.socket, player2Socket.socket);
                            const game = res?.game
                            const data = res?.parsedData

                            if (game) {
                                this.games.push(game);
                            }
                            player1Socket.socket.send(JSON.stringify({ type: RECONNECTED, payload: { game: data, message: "Game Recovered" } }))
                            player2Socket.socket.send(JSON.stringify({ type: RECONNECTED, payload: { game: data, message: "Game Recovered" } }))
                        } else {
                            socket.send(JSON.stringify({ type: RECONNECTING, payload: { message: "Reconnecting to Game...." } }))
                        }
                        return;
                    }
                }
            });
        }

        this.addHandler(socket);
        return;
    }

    async removeUser(socket: WebSocket) {
        GameManager.pendingUser.deque({ socket: socket })
        this.users = this.users.filter(user => user.socket !== socket)
        const game = this.games.find(g => g.player1.socket === socket || g.player2.socket === socket);
        if (!game) return;

        if (game.player1.socket === socket) {
            game.player1.socket = null;
            if (game.player2.socket) {
                game.player2.socket.send(JSON.stringify({ type: OPPO_DISCONNECT }));
            }
        } else if (game.player2.socket === socket) {
            game.player2.socket = null;
            if (game.player1.socket) {
                game.player1.socket.send(JSON.stringify({ type: OPPO_DISCONNECT }));
            }
        }
        await game.saveGame()
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", async (data) => {
            const message = JSON.parse(data.toString())
            const username = message.name;
            if (message.type === INIT_GAME) {
                const userid = message.id
                const profilePicture = message.profilePicture
                const time = minutesToMilliseconds(message.time) as number;
                const pendingUser = GameManager.pendingUser?.deque({ userId: userid, time });

                const game = this.games.find(game => game.player1.id === userid || game.player2.id === userid)
                if (game) {
                    socket.send(JSON.stringify({
                        type: ERROR,
                        payload: { message: "You are already in another game" },
                    }))
                    return;
                }

                if (pendingUser) {
                    if (pendingUser?.id === userid) {
                        return
                    }

                    const pendingUserRating = await GameManager.GameDBCalls.getUserRating(pendingUser.id);
                    const currentUserRating = await GameManager.GameDBCalls.getUserRating(message.id)

                    const isCompatible = await GameManager.GameDBCalls.checkCompatibility({ player1: pendingUser.id, player2: userid })
                    if (!isCompatible) {
                        return;
                    }

                    const id = uuidv4();
                    const randomWhite = Math.random() > 0.5
                    const player1Color = randomWhite ? "white" : "black";
                    const player2Color = randomWhite ? "black" : "white";
                    const pendingCopy: Pending = { ...pendingUser, color: player2Color, rating: (pendingUserRating as number) }
                    const game = new Game(pendingCopy, { socket, name: username, timeLeft: time, id: userid, color: player1Color, profilePicture: profilePicture, rating: (currentUserRating as number) }, time, id, Date.now(), "white")

                    // event to remove game
                    game.on("removeGame", async (gameId: string) => {
                        await this.removeGame(gameId);
                    });

                    this.games.push(game);
                } else {
                    GameManager.pendingUser?.enque({ socket, name: username, timeLeft: time, id: userid, profilePicture: profilePicture })
                }
            }
            if (message.type === MOVE) {
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
                if (game) {
                    game.makeMove(socket, message.payload.move, parseInt(message.payload.timer))
                }
            }

            if (message.type === RESIGN) {
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
                const id = game?.player1.socket === socket ? game.player1.id : game?.player2.id as string
                if (game) {
                    game.resign(message.payload.color, id)
                    // Remove game from list and redis
                    this.removeGame(game.id)
                }
            }

            if (message.type === OFFER_DRAW) {
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
                if (game) {
                    game.offerDraw(socket)
                }
            }

            if (message.type === DRAW_OFFER_REPLY) {
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
                const draw = message.payload.draw;
                if (game?.offerState) {
                    if (draw) {
                        game.drawAccepted();
                        // Remove game from list and redis
                        this.removeGame(game.id)
                    } else {
                        game.drawRejected();
                    }
                }
            }

            if (message.type === TIME_UP) {
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
                if (game) {
                    const winner = game.player1.socket === socket ? game.player2.id : game.player1.id
                    game.timeUp(message.payload.color, winner);
                    // Remove game from list and redis
                    this.removeGame(game.id)
                }
            }
        })
    }

    async recoverGame(parsedData: any, socket1: WebSocket, socket2: WebSocket) {
        const gameId = parsedData.id
        const gameKey = `game:${gameId}`
        const gameData = await redis.get(gameKey);

        if (!gameData) return null;

        const parsedGame = JSON.parse(gameData);

        const findGame = await prisma.game.findFirst({
            where: {
                id: gameId
            },
            select: {
                duration: true
            }
        })

        if (!findGame) return null

        const player1Name = await prisma.user.findFirst({
            where: {
                id: parsedGame.player1.id
            },
            select: {
                name: true,
                profilePicture: true,
                rating: true
            }
        })
        const player2Name = await prisma.user.findFirst({
            where: {
                id: parsedGame.player2.id
            },
            select: {
                name: true,
                profilePicture: true,
                rating: true
            }
        })

        if (!player1Name || !player2Name) return null;
        const currentTimeinMil = Date.now()
        const lastMoveTime = parsedGame.lastMoveTime

        const diff = currentTimeinMil - lastMoveTime

        const player1Color = parsedGame.player1.color

        let player1Time = parsedGame.player1.timeLeft
        let player2Time = parsedGame.player2.timeLeft


        parsedData.player1.timeLeft = player1Time
        parsedData.player2.timeLeft = player2Time

        const game = new Game(
            { socket: socket1, name: player1Name?.name, timeLeft: player1Time, id: parsedGame.player1.id, color: parsedGame.player1.color, profilePicture: player1Name.profilePicture, rating: player1Name.rating[0].rating },
            { socket: socket2, name: player2Name?.name, timeLeft: player2Time, id: parsedGame.player2.id, color: parsedGame.player2.color, profilePicture: player2Name.profilePicture, rating: player2Name.rating[0].rating },
            findGame.duration,
            parsedGame.id,
            parsedGame.lastMoveTime,
            parsedGame.currentColor,
            true
        );

        // event to remove game
        game.on("removeGame", async (gameId: string) => {
            await this.removeGame(gameId)
        })

        game.setBoard(parsedGame.fen, parsedGame.pgn);
        // game.setPgn(parsedGame.pgn)
        game.currentColor = game.board.turn() === "w" ? "white" : "black";

        if (parsedGame.offerState) {
            game.setOfferState();
        } else {
            game.resetOfferState();
        }

        const actualTurn = game.board.turn() === "w" ? "white" : "black";
        if (actualTurn === player1Color) {
            player1Time = Math.max(0, player1Time - diff);
        } else {
            player2Time = Math.max(0, player2Time - diff);
        }

        return { game, parsedData };
    }

    async removeGame(gameId: string) {
        const gameKey = `game:${gameId}`
        const r = await redis.del(gameKey);
        this.games = this.games.filter((g) => g.id != gameId)
    }
}