import { WebSocket } from "ws";
import { Game } from "./Game";
import { DRAW_OFFER_REPLY, INIT_GAME, MOVE, OFFER_DRAW, RESIGN, TIME_UP } from "../lib/messages";
import { PendingUser } from "./PendingUsers";
import { timeConv } from "../lib/timeConstants";
import { v4 as uuidv4 } from 'uuid';
import { GameSave } from "./GameSave";

export class GameManager {
    private games: Game[]
    private static pendingUser: PendingUser = new PendingUser()
    private users: WebSocket[]
    private static GameDBCalls = new GameSave();

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
                const userid = message.id
                const timeInMil = timeConv(time) as number;
                const pendingUser=GameManager.pendingUser?.deque(timeInMil);
                if (pendingUser) {
                    if(pendingUser?.id === userid) return;
                    
                    if(!GameManager.GameDBCalls.checkCompatibility({player1:pendingUser.id,player2:userid})){
                        return;
                    }
                    const id = uuidv4();
                    const game = new Game(pendingUser, { socket, name: username, timeLeft: timeInMil,id:userid }, message.time,id)
                    this.games.push(game);
                } else {
                    GameManager.pendingUser?.enque({ socket, name: username, timeLeft: timeInMil,id:userid })
                }
            }


            if (message.type === MOVE) {
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
                if (game) {
                    game.makeMove(socket, message.payload.move)
                }
            }

            if(message.type===RESIGN){
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
                const id = game?.player1.socket === socket ? game.player1.id : game?.player2.id as string
                if(game){
                    game.resign(message.payload.color,id)
                }
            }

            if(message.type===OFFER_DRAW){
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
                if(game){
                    game.offerDraw(socket)
                }
            }

            if(message.type===DRAW_OFFER_REPLY){
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
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
                const game = this.games.find(game => game.player1.socket === socket || game.player2.socket === socket)
                if(game){
                    const winner = game.player1.socket === socket ? game.player2.id : game.player1.id
                    game.timeUp(message.payload.color,winner);
                }
            }
        })
    }
}