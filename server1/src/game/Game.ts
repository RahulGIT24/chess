import { Chess, Square } from "chess.js";
import WebSocket from "ws";
import { DRAW, DRAW_OFFERED, ERROR, GAME_OVER, INIT_GAME, MOVE, OFFER_ACCEPTED, OFFER_REJECTED, RESIGN, TIME_UP } from "../lib/messages";
import { moveValidator } from "../lib/validators";
import { GameSave } from "./GameSave";
import redis from "../redis/RedisService"

export class Game {
  public player1: { socket: WebSocket | null, id: string, timeLeft: number, name: string | null, color: "black" | "white" };
  public player2: { socket: WebSocket | null, id: string, timeLeft: number, name: string | null, color: "black" | "white" };
  public board: Chess;
  public startTime: Date;
  public offerState: boolean
  public id: string
  public static gameDBController = new GameSave()
  public currentColor: string
  public lastMoveTime: number

  constructor(
    player1: { socket: WebSocket | null; name: string; timeLeft: number, id: string, color: "white" | "black" },
    player2: { socket: WebSocket | null; name: string; timeLeft: number, id: string, color: "white" | "black" },
    initialTime: number,
    id: string,
    lastMoveTime:number,
    currentColor:string
  ) {
    this.player1 = { socket: player1.socket, id: player1.id, timeLeft: player1.timeLeft, name: player1.name, color: player1.color };
    this.player2 = { socket: player2.socket, id: player2.id, timeLeft: player2.timeLeft, name: player2.name, color: player2.color };
    this.offerState = false
    this.board = new Chess();
    this.startTime = new Date();
    this.id = id;
    Game.gameDBController.setid(id)
    this.currentColor =currentColor
    this.lastMoveTime = lastMoveTime;

    if (!this.player1.socket || !this.player2.socket) return;

    this.player1.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          name: player2.name,
          timer: initialTime,
          color: player1.color,
        },
      })
    );

    this.player2.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          name: player1.name,
          timer: initialTime,
          color: player2.color,
        },
      })
    );

    Game.gameDBController.initGameSave({
      id: this.id,
      player1: player1.id,
      player2: player2.id,
      duration: initialTime
    }).catch(e => (console.log(e)))
  }

  async makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
      promotion?: string;
    },
    timer: number
  ) {
    if (!moveValidator(move)) {
      socket.send(
        JSON.stringify({
          type: ERROR,
          payload: { message: "Invalid Move Format" },
        })
      );
      console.log("Invalid Move")
      return;
    }

    if (socket === this.player2.socket && this.player2.color != this.currentColor) {
      socket.send(
        JSON.stringify({
          type: ERROR,
          payload: { message: "It's not your turn" },
        })
      );
      console.log("Not Your Turn")
      return;
    }

    if (socket === this.player1.socket && this.player1.color != this.currentColor) {
      socket.send(
        JSON.stringify({
          type: ERROR,
          payload: { message: "It's not your turn" },
        })
      );
      console.log("Not Your Turn")
      return;
    }

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
    } catch (error) {
      socket.send(
        JSON.stringify({
          type: ERROR,
          payload: { message: "Illegal Move" },
        })
      );
      console.log(error)
      return;
    }

    if (this.board.isGameOver()) {
      const winnerColor = this.board.turn() === "w" ? "black" : "white";
      if (this.player1.socket) {
        this.player1.socket.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner: winnerColor
            },
          })
        );
      }
      if (this.player2.socket) {
        this.player2.socket.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner: winnerColor
            },
          })
        );
      }
      const winnerId = winnerColor === "black" ? this.player1.id : this.player2.id;
      Game.gameDBController.handleWin(winnerId).catch(e => console.log(e))
    }

    if (this.board.isDraw()) {
      if (this.player1.socket) {
        this.player1.socket.send(
          JSON.stringify({
            type: DRAW,
          })
        );
      }
      if (this.player2.socket) {
        this.player2.socket.send(
          JSON.stringify({
            type: DRAW,
          })
        );
      }
      Game.gameDBController.handleDraw().catch(e => console.log(e))
    }
    // Elasped time in milliseconds
    const currentTimeinMil = Date.now()
    const diffTimeinMil = currentTimeinMil - this.lastMoveTime

    // If current turn is white I will update current's white time whiteLastMoveTime - elasped
    if (this.currentColor === this.player1.color) {
      this.player1.timeLeft = Math.max(0, this.player1.timeLeft - diffTimeinMil)
    }

    // If current turn is black I will update current's black time by blackLastMoveTime - elasped
    if (this.currentColor === this.player2.color) {
      this.player2.timeLeft = Math.max(0, this.player2.timeLeft - diffTimeinMil)
    }

    this.currentColor = this.currentColor === "white" ? "black" : "white"
    const payload = {
      move: move,
      "white":this.player1.color === "white" ? this.player1.timeLeft : this.player2.timeLeft,
      "black":this.player1.color === "black" ? this.player1.timeLeft : this.player2.timeLeft,
      "currentColor":this.currentColor
    }
    this.lastMoveTime = currentTimeinMil
    
    if (this.player1.socket) {
      this.player1.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: payload,
        })
      );
    }

    if (this.player2.socket) {
      this.player2.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: payload,
        })
      );
    }

    await this.saveGame();
  }

  offerDraw(socket: WebSocket) {
    if (socket === this.player1.socket) {
      if (this.player2.socket) {
        this.player2.socket.send(
          JSON.stringify({
            type: DRAW_OFFERED,
          })
        );
      }
    }
    else if (socket === this.player2.socket) {
      if (this.player1.socket) {
        this.player1.socket.send(
          JSON.stringify({
            type: DRAW_OFFERED,
          })
        );
      }
    }
    this.setOfferState()
  }

  drawAccepted() {
    if (this.player1.socket) {
      this.player1.socket.send(
        JSON.stringify({
          type: OFFER_ACCEPTED,
        })
      );
    }
    if (this.player2.socket) {
      this.player2.socket.send(
        JSON.stringify({
          type: OFFER_ACCEPTED,
        })
      );
    }
    Game.gameDBController.handleDraw().catch(e => console.log(e));
  }

  drawRejected() {
    if (this.player1.socket) {
      this.player1.socket.send(
        JSON.stringify({
          type: OFFER_REJECTED,
        })
      );
    }
    if (this.player2.socket) {
      this.player2.socket.send(
        JSON.stringify({
          type: OFFER_REJECTED,
        })
      );
    }
  }

  timeUp(color: string, playerId: string) {
    const winnerColor = color === "white" ? "black" : "white"
    if (this.player1.socket) {
      this.player1.socket.send(
        JSON.stringify({
          type: TIME_UP,
          payload: { color: winnerColor }
        })
      );
    }
    if (this.player2.socket) {
      this.player2.socket.send(
        JSON.stringify({
          type: TIME_UP,
          payload: { color: winnerColor }
        })
      );
    }
    Game.gameDBController.handleWin(playerId).catch(e => console.log(e))
  }

  setOfferState() {
    this.offerState = true
  }

  resetOfferState() {
    this.offerState = false
  }

  resign(color: string, id: string) {
    if (this.player2.socket) {
      this.player2.socket.send(
        JSON.stringify({
          type: RESIGN,
          payload: { color },
        })
      )
    }
    if (this.player1.socket) {
      this.player1.socket.send(
        JSON.stringify({
          type: RESIGN,
          payload: { color },
        })
      );
    }
    Game.gameDBController.handleResign(id).catch(e => console.log(e))
  }

  async saveGame() {
    const gameKey = `game:${this.id}`;
    const gameState = {
      id: this.id,
      player1: { id: this.player1.id, timeLeft: this.player1.timeLeft, color: this.player1.color, name: this.player1.name },
      player2: { id: this.player2.id, timeLeft: this.player2.timeLeft, color: this.player2.color, name: this.player1.name },
      fen: this.board.fen(),
      pgn: this.board.pgn(),
      offerState: this.offerState,
      currentColor: this.currentColor,
      lastMoveTime: this.lastMoveTime,
    }
    await redis.set(gameKey, JSON.stringify(gameState));
    await redis.expire(gameKey, 3600);
  }

  setBoard(board: string) {
    this.board.load(board);
  }
}
