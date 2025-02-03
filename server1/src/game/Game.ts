import { Chess, Square } from "chess.js";
import WebSocket from "ws";
import { DRAW, DRAW_OFFERED, ERROR, GAME_OVER, INIT_GAME, MOVE, OFFER_ACCEPTED, OFFER_REJECTED, RESIGN, TIME_UP } from "../lib/messages";
import { moveValidator } from "../lib/validators";
import { timeConv } from "../lib/timeConstants";
import { GameSave } from "./GameSave";
import redis from "../redis/RedisService"

export class Game {
  public player1: { socket: WebSocket, id: string, timeLeft: number | null };
  public player2: { socket: WebSocket, id: string, timeLeft: number | null };
  private board: Chess;
  private startTime: Date;
  private moveCount: number;
  private timer: number = 0;
  public offerState: boolean
  private id: string
  private static gameDBController = new GameSave()
  private timeString: string

  constructor(
    player1: { socket: WebSocket; name: string; timeLeft: number, id: string },
    player2: { socket: WebSocket; name: string; timeLeft: number, id: string },
    time: string,
    id: string
  ) {
    this.player1 = { socket: player1.socket, id: player1.id, timeLeft: this.timer };
    this.player2 = { socket: player2.socket, id: player2.id, timeLeft: this.timer };
    this.offerState = false
    this.board = new Chess();
    this.moveCount = 0;
    this.startTime = new Date();
    this.timeString = time;
    this.timer = timeConv(time) as number

    player1.timeLeft = this.timer;
    player2.timeLeft = this.timer;
    this.id = id;
    Game.gameDBController.setid(id)

    this.player1.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          name: player2.name,
          timer: player1.timeLeft,
          color: "white",
        },
      })
    );

    this.player2.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          name: player1.name,
          timer: player2.timeLeft,
          color: "black",
        },
      })
    );

    Game.gameDBController.initGameSave({
      id: this.id,
      player1: player1.id,
      player2: player2.id,
      duration: this.timer
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
    console.log(timer);
    if (!moveValidator(move)) {
      socket.send(
        JSON.stringify({
          type: ERROR,
          payload: { message: "Invalid Move Format" },
        })
      );
      return;
    }

    if (this.moveCount % 2 == 0 && socket !== this.player2.socket) {
      socket.send(
        JSON.stringify({
          type: ERROR,
          payload: { message: "It's not your turn" },
        })
      );
      return;
    }
    if (this.moveCount % 2 == 1 && socket !== this.player1.socket) {
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
        if (this.player1.socket === socket) {
          this.player1.timeLeft = timer;
          console.log("Timer Set Player 1",this.player1.timeLeft)
        }else{
          console.log("Timer Set Player 2",this.player2.timeLeft)
          this.player2.timeLeft = timer;
        }
      } else {
        this.board.move(move);
        if (this.player1.socket === socket) {
          this.player1.timeLeft = timer;
          console.log("Timer Set Player 1",this.player1.timeLeft)
        }else{
          this.player2.timeLeft = timer;
          console.log("Timer Set Player 1",this.player2.timeLeft)
        }
      }
      this.moveCount++;
      await this.saveGame();
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
      const winnerColor = this.board.turn() === "w" ? "black" : "white";
      this.player1.socket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: winnerColor
          },
        })
      );
      this.player2.socket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: winnerColor
          },
        })
      );
      const winnerId = winnerColor === "black" ? this.player1.id : this.player2.id;
      Game.gameDBController.handleWin(winnerId).catch(e => console.log(e))
    }

    if (this.board.isDraw()) {
      this.player1.socket.send(
        JSON.stringify({
          type: DRAW,
        })
      );
      this.player2.socket.send(
        JSON.stringify({
          type: DRAW,
        })
      );
      Game.gameDBController.handleDraw().catch(e => console.log(e))
    }

    // send the updated board to both players
    if (this.moveCount % 2 == 0) {
      this.player2.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
  }

  offerDraw(socket: WebSocket) {
    if (socket === this.player1.socket) {
      this.player2.socket.send(
        JSON.stringify({
          type: DRAW_OFFERED,
        })
      );
    }
    else if (socket === this.player2.socket) {
      this.player1.socket.send(
        JSON.stringify({
          type: DRAW_OFFERED,
        })
      );
    }
    this.setOfferState()
  }

  drawAccepted() {
    this.player1.socket.send(
      JSON.stringify({
        type: OFFER_ACCEPTED,
      })
    );
    this.player2.socket.send(
      JSON.stringify({
        type: OFFER_ACCEPTED,
      })
    );
    Game.gameDBController.handleDraw().catch(e => console.log(e));
  }

  drawRejected() {
    this.player1.socket.send(
      JSON.stringify({
        type: OFFER_REJECTED,
      })
    );
    this.player2.socket.send(
      JSON.stringify({
        type: OFFER_REJECTED,
      })
    );
  }

  timeUp(color: string, playerId: string) {
    const winnerColor = color === "w" ? "black" : "white"
    this.player1.socket.send(
      JSON.stringify({
        type: TIME_UP,
        payload: { color: winnerColor }
      })
    );
    this.player2.socket.send(
      JSON.stringify({
        type: TIME_UP,
        payload: { color: winnerColor }
      })
    );
    Game.gameDBController.handleWin(playerId).catch(e => console.log(e))
  }

  setOfferState() {
    this.offerState = true
  }

  resetOfferState() {
    this.offerState = false
  }

  resign(color: string, id: string) {
    this.player2.socket.send(
      JSON.stringify({
        type: RESIGN,
        payload: { color },
      })
    )
    this.player1.socket.send(
      JSON.stringify({
        type: RESIGN,
        payload: { color },
      })
    );
    Game.gameDBController.handleResign(id).catch(e => console.log(e))
  }

  async saveGame() {
    const gameKey = `game:${this.id}`;
    const gameState = {
      id: this.id,
      player1: { id: this.player1.id, timeLeft: this.player1.timeLeft, color:"black" },
      player2: { id: this.player2.id, timeLeft: this.player2.timeLeft, color:"white" },
      board: this.board.fen(),
      moveCount: this.moveCount,
      offerState: this.offerState,
      matchTime: this.timeString
    }
    await redis.set(gameKey, JSON.stringify(gameState));
    await redis.expire(gameKey, 3600);
  }

  setBoard(board: string) {
    this.board.load(board);
  }

  setMoveCount(moveC: number) {
    this.moveCount = moveC;
  }

}
