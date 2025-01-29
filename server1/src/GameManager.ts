import { WebSocket } from "ws";
import { Game } from "./Game";
import { DRAW_OFFER_REPLY, INIT_GAME, MOVE, OFFER_DRAW, RESIGN, TIME_UP } from "./messages";

export class GameManager {
    private games: Game[]
    private pendingUser: { socket: WebSocket, name: string, timeLeft: number } | null
    private users: WebSocket[]

    constructor() {
        this.games = []
        this.users = []
        this.pendingUser = null;
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
                if (this.pendingUser) {
                    // const game = new Game(this.pendingUser,{socket,name:username,timeLeft:0}, message.time)
                    const game = new Game(this.pendingUser, { socket, name: username, timeLeft: 0 }, message.time)
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = { socket, name: username, timeLeft: 0 } //phatega yaha
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