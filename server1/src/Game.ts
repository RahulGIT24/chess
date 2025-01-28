import { Chess, Square } from "chess.js";
import WebSocket from "ws";
import { DRAW, ERROR, GAME_OVER, INIT_GAME, MOVE, RESIGN } from "./messages";
import { moveValidator } from "./lib/validators";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private startTime: Date;
  private moveCount: number;
  private timer: number = 0;

  constructor(
    player1: { socket: WebSocket; name: string; timeLeft: number },
    player2: { socket: WebSocket; name: string; timeLeft: number },
    time: string
  ) {
    this.player1 = player1.socket;
    this.player2 = player2.socket;
    this.board = new Chess();
    this.moveCount = 0;
    this.startTime = new Date();
    switch (time) {
      case "10 M":
        this.timer = 600;
        break;
      case "20 M":
        this.timer = 1200;
        break;
      case "30 M":
        this.timer = 1800;
        break;
      case "60 M":
        this.timer = 3600;
        break;
    }



    player1.timeLeft = this.timer;
    player2.timeLeft = this.timer;



    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          name: player2.name,
          timer:player1.timeLeft,
          color: "white",
        },
      })
    );

    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          name: player1.name,
          timer:player2.timeLeft,
          color: "black",
        },
      })
    );
  }

  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
      promotion?: string;
    }
  ) {
    // console.log(move)
    if (!moveValidator(move)) {
      socket.send(
        JSON.stringify({
          type: ERROR,
          payload: { message: "Invalid Move Format" },
        })
      );
      return;
    }
    // validate the type of move using zod
    // validate move
    // is it this users move
    // is the move valid

    if (this.moveCount % 2 == 0 && socket !== this.player2) {
      socket.send(
        JSON.stringify({
          type: ERROR,
          payload: { message: "It's not your turn" },
        })
      );
      return;
    }
    if (this.moveCount % 2 == 1 && socket !== this.player1) {
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
      const piece = this.board.get(move.from as Square)?.type;
      if (piece === "p" && (move.to.endsWith("8") || move.to.endsWith("1"))) {
        if (!move.promotion || !["q", "r", "b", "n"].includes(move.promotion)) {
          socket.send(
            JSON.stringify({
              type: ERROR,
              payload: { message: "Invalid promotion piece" },
            })
          );
          return;
        }
        this.board.move(move);
      } else {
        this.board.move(move);
      }
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

    if (this.board.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
    }

    if(this.board.isDraw()){
      this.player1.send(
        JSON.stringify({
          type:   DRAW,
        })
      );
      this.player2.send(
        JSON.stringify({
          type: DRAW,
        })
      );
    }

    // send the updated board to both players
    if (this.moveCount % 2 == 0) {
      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
  }

  resign(color:string){
    this.player2.send(
      JSON.stringify({
        type: RESIGN,
        payload: {color},
      })
    )
    this.player1.send(
      JSON.stringify({
        type: RESIGN,
        payload: {color},
      })
    );
  }
}
