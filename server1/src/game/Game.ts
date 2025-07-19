import { Chess, Square } from "chess.js";
import WebSocket from "ws";
import { DRAW, DRAW_OFFERED, ERROR, GAME_OVER, INIT_GAME, MOVE, OFFER_ACCEPTED, OFFER_REJECTED, RESIGN, TIME_UP } from "../lib/messages";
import { moveValidator } from "../lib/validators";
import { GameSave } from "./GameSave";
import redis from "../redis/RedisService"
import { computeLeftTime } from "../lib/timeCompute";
import { Player } from "../types/types";
import { EventEmitter } from "events";

export class Game extends EventEmitter {
  public player1: Player;
  public player2: Player;
  public board: Chess;
  public startTime: Date;
  public offerState: boolean
  public id: string
  public static gameDBController = new GameSave()
  public currentColor: string
  public lastMoveTime: number
  public initialTime: number
  public skipInitGame?:boolean

  constructor(
    player1: Player,
    player2: Player,
    initialTime: number,
    id: string,
    lastMoveTime: number,
    currentColor: string,
    skipInitGame?: boolean,
  ) {
    super()
    this.player1 = { socket: player1.socket, id: player1.id, timeLeft: player1.timeLeft, name: player1.name, color: player1.color, profilePicture: player1.profilePicture, rating: player1.rating };
    this.player2 = { socket: player2.socket, id: player2.id, timeLeft: player2.timeLeft, name: player2.name, color: player2.color, profilePicture: player2.profilePicture, rating: player2.rating };
    this.offerState = false
    this.board = new Chess();
    this.startTime = new Date();
    this.id = id;
    Game.gameDBController.setid(id)
    this.currentColor = currentColor
    this.lastMoveTime = lastMoveTime;
    this.initialTime = initialTime

    if (!this.player1.socket || !this.player2.socket) return;
    if(skipInitGame) return;

    this.player1.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          name: player2.name,
          timer: initialTime,
          color: player1.color,
          profilePicture: player2.profilePicture,
          rating: player2.rating,
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
          profilePicture: player1.profilePicture,
          rating: player1.rating
        },
      })
    );

    let white: any = ""
    let black: any = ""
    if (this.player1.color === "white") {
      white = this.player1
      black = this.player2
    } else {
      white = this.player2
      black = this.player1
    }

    Game.gameDBController.initGameSave({
      id: this.id,
      whiteId: white.id,
      blackId: black.id,
      whiteTimeLeft: white.timeLeft,
      blackTimeLeft: black.timeLeft,
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
      }

      const moved = this.board.move(move);
      if (!moved) {
        throw new Error("Invalid Move")
      }

      this.emitMove(move)

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
        let winnerId = null;
        if (winnerColor === this.player1.color) {
          winnerId = this.player1.id
        } else {
          winnerId = this.player2.id
        }
        Game.gameDBController.handleWin(winnerId, this.board.fen(), this.board.history().length, this.board.history()).catch(e => console.log(e))
        this.emit("removeGame", this.id);
        return;
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
        Game.gameDBController.handleDraw(this.board.fen(), this.board.history().length, this.board.history()).catch(e => console.log(e))
        this.emit("removeGame", this.id)
        return;
      }
    } catch (error) {
      socket.send(
        JSON.stringify({
          type: ERROR,
          payload: { message: "Illegal Move" },
        })
      );
      // console.log(error)
      return;
    }
  }

  async emitMove(move: any) {
    const currentTimeinMil = Date.now();
    const { p1, p2 } = computeLeftTime(this.lastMoveTime, this.player1.color, this.currentColor, this.player1.timeLeft, this.player2.timeLeft)
    this.player1.timeLeft = p1;
    this.player2.timeLeft = p2;

    this.currentColor = this.currentColor === "white" ? "black" : "white"
    const payload = {
      move: move,
      "white": this.player1.color === "white" ? this.player1.timeLeft : this.player2.timeLeft,
      "black": this.player1.color === "black" ? this.player1.timeLeft : this.player2.timeLeft,
      "currentColor": this.currentColor
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
    Game.gameDBController.handleDraw(this.board.fen(), this.board.history().length, this.board.history()).catch(e => console.log(e));
    this.emit("removeGame", this.id)
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
    Game.gameDBController.handleWin(playerId, this.board.fen(), this.board.history().length, this.board.history()).catch(e => console.log(e))
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
    Game.gameDBController.handleResign(id, this.board.fen(), this.board.history().length, this.board.history()).catch(e => console.log(e))
  }

  async saveGame() {
    const gameKey = `game:${this.id}`;
    const gameState = {
      id: this.id,
      player1: {
        id: this.player1.id,
        timeLeft: this.player1.timeLeft,
        color: this.player1.color,
        name: this.player1.name,
        profilePicture: this.player1.profilePicture
      },
      player2: {
        id: this.player2.id,
        timeLeft: this.player2.timeLeft,
        color: this.player2.color,
        name: this.player2.name,
        profilePicture: this.player2.profilePicture
      },
      fen: this.board.fen(),
      pgn: this.board.pgn(),
      offerState: this.offerState,
      currentColor: this.board.turn() === "w" ? "white" : "black",
      lastMoveTime: this.lastMoveTime,
      matchTime: this.initialTime
    };
    await redis.set(gameKey, JSON.stringify(gameState));
    await redis.expire(gameKey, 3600);
  }

  setBoard(fen: string, pgn: string) {
    const chess = new Chess();
    chess.loadPgn(pgn)
    this.board = chess
  }
}
