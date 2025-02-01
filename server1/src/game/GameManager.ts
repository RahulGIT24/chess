import { WebSocket } from "ws";
import { Game } from "./Game";
import { DRAW_OFFER_REPLY, INIT_GAME, MOVE, OFFER_DRAW, RESIGN, TIME_UP } from "../lib/messages";
import { PendingUser } from "./PendingUsers";
import { timeConv } from "../lib/timeConstants";

export class GameManager {
    private games: Game[]
    private static pendingUser: PendingUser = new PendingUser()
    private users: WebSocket[]

    constructor() {
        this.games = []
        this.users = []
    }

    addUser(socket: WebSocket) {
        this.users.push(socket)
        this.addHandler(socket)
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket)
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString())
            const username = message.name;
            
            if (message.type === INIT_GAME) {
                const time = message.time;
                const timeInMil = timeConv(time) as number;
                // console.log(timeInMil)
                const pendingUser=GameManager.pendingUser?.deque(timeInMil);
                if (pendingUser) {
                    const game = new Game(pendingUser, { socket, name: username, timeLeft: timeInMil }, message.time)
                    this.games.push(game);
                } else {
                    GameManager.pendingUser?.enque({ socket, name: username, timeLeft: timeInMil })
                }
            }


            if (message.type === MOVE) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket)
                if (game) {
                    game.makeMove(socket, message.payload.move)
                }
            }

            if(message.type===RESIGN){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket)
                if(game){
                    game.resign(message.payload.color)
                }
            }

            if(message.type===OFFER_DRAW){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket)
                if(game){
                    game.offerDraw(socket)
                }
            }
            if(message.type===DRAW_OFFER_REPLY){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket)
                const draw = message.payload.draw;
                if(game?.offerState){
                    if(draw){
                        game.drawAccepted();
                    }else{
                        game.drawRejected();
                    }
                }
            }

            if(message.type===TIME_UP){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket)
                if(game){
                    game.timeUp(message.payload.color);
                }
            }
        })
    }
}