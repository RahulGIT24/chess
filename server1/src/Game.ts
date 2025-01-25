import { Chess } from "chess.js";
import WebSocket from "ws";
import { ERROR, GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { moveValidator } from "./lib/validators";

export class Game {
    public player1: WebSocket
    public player2: WebSocket
    private board: Chess
    private startTime: Date
    private moveCount: number

    constructor(player1: {socket:WebSocket,name:string}, player2: {socket:WebSocket,name:string}) {
        this.player1 = player1.socket
        this.player2 = player2.socket
        this.board = new Chess()
        this.moveCount=0;
        this.startTime = new Date()
        this.player1.send(JSON.stringify({
            type:INIT_GAME,
            payload:{
                name:player2.name,
                color:"white"
            }
        }))
        this.player2.send(JSON.stringify({
            type:INIT_GAME,
            payload:{
                name:player1.name,
                color:"black"
            }
        }))
        console.log({
            name:player2.name,
            color:"white"
        })
        console.log({
            name:player1.name,
            color:"black"
        })
    }

    makeMove(socket: WebSocket, move: {
        from:string,to:string
    }) {
        if(!moveValidator(move)){
            socket.send(
                JSON.stringify({
                    type:ERROR,
                    payload:{message:"Invalid Move Format"}
                })
            )
            return;
        }
        // validate the type of move using zod
        // validate move
        // is it this users move
        // is the move valid

        if(this.moveCount%2==0 && socket!==this.player2){
            socket.send(
                JSON.stringify({
                    type: ERROR,
                    payload: { message: "It's not your turn" },
                })
            );
            return;
        }
        if(this.moveCount%2==1 && socket!==this.player1){
            socket.send(
                JSON.stringify({
                    type: ERROR,
                    payload: { message: "It's not your turn" },
                })
            );
            return;
        }

        // attempt for move
        try {
            this.board.move(move);
            this.moveCount++;
        } catch (error) {
            socket.send(
                JSON.stringify({
                    type: ERROR,
                    payload: { message: "Illegal Move" },
                })
            );
            return;
        }

        if(this.board.isGameOver()){
            this.player1.send(JSON.stringify({
                type:GAME_OVER,
                payload:{
                    winner:this.board.turn() === "w" ? "black":"white"
                }
            }))
            this.player2.send(JSON.stringify({
                type:GAME_OVER,
                payload:{
                    winner:this.board.turn() === "w" ? "black":"white"
                }
            }))
            return;
        }

        // send the updated board to both players
        if(this.moveCount % 2 == 0){
            this.player2.send(JSON.stringify({
                type:MOVE,
                payload:move
            }))
        }else{
            this.player1.send(JSON.stringify({
                type:MOVE,
                payload:move
            }))
        }
    }   
}