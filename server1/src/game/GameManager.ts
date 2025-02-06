import { WebSocket } from "ws";
import { Game } from "./Game";
import { ADDTOGAME, DRAW_OFFER_REPLY, ERROR, INIT_GAME, MOVE, OFFER_DRAW, OPPO_CONNECTED, OPPO_DISCONNECT, RECONNECTED, RECONNECTING, RESIGN, TIME_UP } from "../lib/messages";
import { PendingUser } from "./PendingUsers";
import { timeConv } from "../lib/timeConstants";
import { v4 as uuidv4 } from 'uuid';
import { GameSave } from "./GameSave";
import redis from "../redis/RedisService"
import { prisma } from "../lib/prisma";

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

        const game = await prisma.game.findFirst({
            where: {
                OR: [
                    { player1: id },
                    { player2: id }
                ]
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        if (game && game.draw == false && game.winner == null) {
            const gameIdKey = `game:${game.id}`
            redis.get(gameIdKey).then(async (game) => {
                if (game) {
                    const parsedData = JSON.parse(game);
                    if (parsedData) {
                        const player1Socket = this.users.find(user => user.id === parsedData.player1.id);
                        const player2Socket = this.users.find(user => user.id === parsedData.player2.id);

                        if (player1Socket && player2Socket) {
                            const game = await this.recoverGame(parsedData.id, player1Socket.socket, player2Socket.socket);
                            if (game) {
                                this.games.push(game);
                            }
                            player1Socket.socket.send(JSON.stringify({ type: RECONNECTED, payload: { game: JSON.stringify(parsedData), message: "Game Recovered" } }))
                            player2Socket.socket.send(JSON.stringify({ type: RECONNECTED, payload: { game: JSON.stringify(parsedData), message: "Game Recovered" } }))
                            this.addHandler(player1Socket.socket);
                            this.addHandler(player2Socket.socket);
                        } else {
                            socket.send(JSON.stringify({ type: RECONNECTING, payload: { message: "Reconnecting to Game...." } }))
                        }
                        return;
                    }
                }
            });
        } else {
            this.addHandler(socket);
            return;
        }
    }

    async removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user.socket !== socket)
        const game = this.games.find(g => g.player1.socket === socket || g.player2.socket === socket);
        if (!game) return;
        if (game.player1.socket === socket) {
            game.player1.socket = null;
            if (game.player2.socket) {
                game.player2.socket.send(JSON.stringify({
                    type: OPPO_DISCONNECT
                }))
            }
        } else if (game.player2.socket === socket) {
            game.player2.socket === null;
            if (game.player1.socket) {
                game.player1.socket.send(JSON.stringify({
                    type: OPPO_DISCONNECT
                }))
            }
        }
        const board = game.getBoard()
        const gameKey = `game:${game.id}`;
        const gameState = {
            id: game.id,
            player1: { id: game.player1.id, timeLeft: game.player1.timeLeft, color: "black" },
            player2: { id: game.player2.id, timeLeft: game.player2.timeLeft, color: "white" },
            board: board.fen(),
            pgn: board.pgn(),
            moveCount: game.getMoveCount(),
            offerState: game.offerState,
            matchTime: game.getTimeString()
        }
        await redis.set(gameKey, JSON.stringify(gameState));
        await redis.expire(gameKey, 3600);
    }

    async addUserBackToGame(socket: WebSocket, gameid: string, userid: string) {
        let game = this.games.find(g => g.id === gameid);
    
        // Try to load from Redis if not found in memory
        if (!game) {
            const gameData = await redis.get(`game:${gameid}`);
            if (!gameData) {
                socket.send(JSON.stringify({ type: ERROR, message: "Game not found" }));
                return;
            }
            game = JSON.parse(gameData);
            if(game){
                this.games.push(game);
            }
        }

        if (game && (game.player1.socket === socket || game.player2.socket === socket)) {
            return;
        }
    
        if (game && (game.player1.id !== userid && game.player2.id !== userid)) {
            socket.send(JSON.stringify({ type: ERROR, message: "You are not in this game" }));
            return;
        }
        
        if(!game) return;

        // Assign the new socket and notify the opponent
        if (game.player1.id === userid) {
            game.player1.socket = socket;
            if (game.player2.socket) {
                game.player2.socket.send(JSON.stringify({ type: OPPO_CONNECTED }));
            }
        } else {
            game.player2.socket = socket;
            if (game.player1.socket) {
                game.player1.socket.send(JSON.stringify({ type: OPPO_CONNECTED }));
            }
        }

        this.addHandler(socket);

        const gameKey = `game:${game.id}`;
        const board  = game.getBoard();
        const gameState = {
            id: game.id,
            player1: { id: game.player1.id, timeLeft: game.player1.timeLeft, color: "black" },
            player2: { id: game.player2.id, timeLeft: game.player2.timeLeft, color: "white" },
            board: board.fen(),
            pgn: board.pgn(),
            moveCount: game.getMoveCount(),
            offerState: game.offerState,
            matchTime: game.getTimeString()
        }
        await redis.set(gameKey, JSON.stringify(gameState));
        await redis.expire(gameKey, 3600);
    }
    

    private addHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString())
            const username = message.name;
            if (message.type === INIT_GAME) {
                const time = message.time;
                const userid = message.id
                const timeInMil = timeConv(time) as number;
                const pendingUser = GameManager.pendingUser?.deque(timeInMil, userid);

                const game = this.games.find(game => game.player1.id === userid || game.player2.id === userid)
                if (game) {
                    socket.send(JSON.stringify({
                        type: ERROR,
                        payload: { message: "You are already in another game" },
                    }))
                }

                if (pendingUser) {
                    if (pendingUser?.id === userid) {
                        console.log("R1")
                        return
                    }

                    if (!GameManager.GameDBCalls.checkCompatibility({ player1: pendingUser.id, player2: userid })) {
                        return;
                    }
                    const id = uuidv4();
                    console.log(`Pending User`, pendingUser.id);
                    const game = new Game(pendingUser, { socket, name: username, timeLeft: timeInMil, id: userid }, message.time, id)
                    this.games.push(game);
                } else {
                    GameManager.pendingUser?.enque({ socket, name: username, timeLeft: timeInMil, id: userid })
                }
            }

            if (message.type === MOVE) {
                console.log("Moved")
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
                }
            }

            if (message.type == ADDTOGAME) {
                console.log(message.payload);
                const id = message.payload.userid;
                const gameid = message.payload.gameid;
                this.addUserBackToGame(socket, gameid, id)
            }
        })
    }

    async recoverGame(gameId: string, socket1: WebSocket, socket2: WebSocket) {
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
                name: true
            }
        })
        const player2Name = await prisma.user.findFirst({
            where: {
                id: parsedGame.player2.id
            },
            select: {
                name: true
            }
        })

        if (!player1Name || !player2Name) return null;

        const game = new Game(
            { socket: socket1, name: player1Name?.name, timeLeft: parsedGame.player1.timeLeft, id: parsedGame.player1.id },
            { socket: socket2, name: player2Name.name, timeLeft: parsedGame.player2.timeLeft, id: parsedGame.player2.id },
            parsedGame.matchTime,
            parsedGame.id
        );

        game.setBoard(parsedGame.board);
        game.setMoveCount(parsedGame.moveCount)
        if (parsedGame.offerState) {
            game.setOfferState();
        } else {
            game.resetOfferState();
        }
        return game;
    }
}