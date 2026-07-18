import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Player } from "../types/types";
import {
  CHAT,
  DRAW,
  DRAW_OFFERED,
  ERROR,
  GAME_OVER,
  INIT_GAME,
  MOVE,
  OFFER_ACCEPTED,
  OFFER_REJECTED,
  RESIGN,
  TIME_UP,
} from "../lib/messages";

const gameSaveMock = {
  setid: vi.fn(),
  initGameSave: vi.fn().mockResolvedValue(undefined),
  handleWin: vi.fn().mockResolvedValue(undefined),
  handleDraw: vi.fn().mockResolvedValue(undefined),
  handleResign: vi.fn().mockResolvedValue(undefined),
};

vi.mock("./GameSave", () => ({
  GameSave: vi.fn().mockImplementation(function () {
    return gameSaveMock;
  }),
}));

vi.mock("../redis/RedisService", () => ({
  default: {
    set: vi.fn().mockResolvedValue("OK"),
    expire: vi.fn().mockResolvedValue(1),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn().mockResolvedValue(1),
  },
}));

// Imported after the mocks above so that `Game` picks up the mocked GameSave/redis.
const { Game } = await import("./Game");
const redis = (await import("../redis/RedisService")).default as any;

function makeSocket() {
  return { send: vi.fn() } as any;
}

function makePlayers(): { player1: Player; player2: Player } {
  const player1: Player = {
    socket: makeSocket(),
    id: "p1",
    timeLeft: 60_000,
    name: "Alice",
    color: "white",
    profilePicture: null,
    rating: 1200,
  };
  const player2: Player = {
    socket: makeSocket(),
    id: "p2",
    timeLeft: 60_000,
    name: "Bob",
    color: "black",
    profilePicture: null,
    rating: 1300,
  };
  return { player1, player2 };
}

function typeOf(socket: any, callIndex = 0) {
  return JSON.parse(socket.send.mock.calls[callIndex][0]).type;
}

beforeEach(() => {
  vi.clearAllMocks();
  gameSaveMock.initGameSave.mockResolvedValue(undefined);
  gameSaveMock.handleWin.mockResolvedValue(undefined);
  gameSaveMock.handleDraw.mockResolvedValue(undefined);
  gameSaveMock.handleResign.mockResolvedValue(undefined);
  redis.set.mockResolvedValue("OK");
  redis.expire.mockResolvedValue(1);
});

describe("Game construction", () => {
  it("sends INIT_GAME to both players with their opponent's info", () => {
    const { player1, player2 } = makePlayers();
    new Game(player1, player2, 60_000, "game-1", Date.now(), "white");

    expect(typeOf(player1.socket)).toBe(INIT_GAME);
    expect(typeOf(player2.socket)).toBe(INIT_GAME);
    const p1Payload = JSON.parse((player1.socket as any).send.mock.calls[0][0]).payload;
    expect(p1Payload.name).toBe("Bob");
    expect(p1Payload.color).toBe("white");
  });

  it("does not send INIT_GAME when skipInitGame is true", () => {
    const { player1, player2 } = makePlayers();
    new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);

    expect((player1.socket as any).send).not.toHaveBeenCalled();
    expect((player2.socket as any).send).not.toHaveBeenCalled();
  });

  it("persists the initial game via the DB controller", () => {
    const { player1, player2 } = makePlayers();
    new Game(player1, player2, 60_000, "game-1", Date.now(), "white");

    expect(gameSaveMock.initGameSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "game-1", whiteId: "p1", blackId: "p2" })
    );
  });
});

describe("Game.makeMove", () => {
  it("rejects a malformed move payload", async () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);

    await game.makeMove(player1.socket as any, { from: "e2e2", to: "e4" }, 60_000);

    expect(typeOf(player1.socket)).toBe(ERROR);
  });

  it("rejects an illegal chess move without mutating the board", async () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);
    const fenBefore = game.board.fen();

    await game.makeMove(player1.socket as any, { from: "e2", to: "e5" }, 60_000);

    expect(typeOf(player1.socket)).toBe(ERROR);
    expect(game.board.fen()).toBe(fenBefore);
  });

  it("broadcasts a MOVE message to both players on a legal move", async () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);

    await game.makeMove(player1.socket as any, { from: "e2", to: "e4" }, 60_000);

    expect(typeOf(player1.socket)).toBe(MOVE);
    expect(typeOf(player2.socket)).toBe(MOVE);
    expect(game.currentColor).toBe("black");
  });

  it("requires a promotion piece when a pawn reaches the last rank", async () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);
    game.board.load("7k/P7/8/8/8/8/8/7K w - - 0 1");

    await game.makeMove(player1.socket as any, { from: "a7", to: "a8" }, 60_000);

    const payload = JSON.parse((player1.socket.send as any).mock.calls[0][0]);
    expect(payload.type).toBe(ERROR);
    expect(payload.payload.message).toBe("Invalid promotion piece");
  });

  it("promotes a pawn when a valid promotion piece is supplied", async () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);
    game.board.load("7k/P7/8/8/8/8/8/7K w - - 0 1");

    await game.makeMove(player1.socket as any, { from: "a7", to: "a8", promotion: "q" }, 60_000);

    expect(typeOf(player1.socket)).toBe(MOVE);
    expect(game.board.get("a8" as any)?.type).toBe("q");
  });

  it("declares GAME_OVER with the correct winner on checkmate and persists the win", async () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);
    // Fool's mate: after 1.f3 e5 2.g4, black delivers checkmate with Qh4#.
    game.board.load("rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2");

    const removeGameSpy = vi.fn();
    game.on("removeGame", removeGameSpy);

    await game.makeMove(player2.socket as any, { from: "d8", to: "h4" }, 60_000);

    expect(game.board.isCheckmate()).toBe(true);
    const p1Messages = (player1.socket.send as any).mock.calls.map((c: any[]) => JSON.parse(c[0]));
    const gameOverMsg = p1Messages.find((m: any) => m.type === GAME_OVER);
    expect(gameOverMsg.payload.winner).toBe("black");
    expect(gameSaveMock.handleWin).toHaveBeenCalledWith("p2", expect.any(String), expect.any(Number), expect.any(Array), expect.any(String));
    expect(removeGameSpy).toHaveBeenCalledWith("game-1");
  });

  // NOTE: `makeMove` checks `board.isGameOver()` before `board.isDraw()`, but
  // isGameOver() is already true for draws (insufficient material, stalemate,
  // etc). That makes the DRAW branch unreachable: a drawn position is reported
  // as a decisive GAME_OVER win for whoever's turn it becomes, and persisted
  // via handleWin instead of handleDraw. This test documents the current
  // (buggy) behavior rather than the intended one.
  it("currently reports a drawn position (insufficient material) as a GAME_OVER win instead of a DRAW", async () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);
    game.board.load("8/8/8/4k3/8/4K3/8/8 w - - 0 1");

    const removeGameSpy = vi.fn();
    game.on("removeGame", removeGameSpy);

    await game.makeMove(player1.socket as any, { from: "e3", to: "e2" }, 60_000);

    const p1Messages = (player1.socket.send as any).mock.calls.map((c: any[]) => JSON.parse(c[0]));
    expect(p1Messages.some((m: any) => m.type === DRAW)).toBe(false);
    expect(p1Messages.some((m: any) => m.type === GAME_OVER)).toBe(true);
    expect(gameSaveMock.handleDraw).not.toHaveBeenCalled();
    expect(gameSaveMock.handleWin).toHaveBeenCalled();
    expect(removeGameSpy).toHaveBeenCalledWith("game-1");
  });
});

describe("Game chat, draw offers, resign and time-up", () => {
  it("forwards a chat message to the other player only", () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);

    game.sendChatMessage(player1.socket as any, { type: CHAT, text: "hi" });

    expect((player1.socket.send as any)).not.toHaveBeenCalled();
    expect(typeOf(player2.socket)).toBe(CHAT);
  });

  it("notifies the opponent and flags offerState when a draw is offered", () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);

    game.offerDraw(player1.socket as any);

    expect(typeOf(player2.socket)).toBe(DRAW_OFFERED);
    expect(game.offerState).toBe(true);
  });

  it("notifies both players and persists the draw on acceptance", () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);
    const removeGameSpy = vi.fn();
    game.on("removeGame", removeGameSpy);

    game.drawAccepted();

    expect(typeOf(player1.socket)).toBe(OFFER_ACCEPTED);
    expect(typeOf(player2.socket)).toBe(OFFER_ACCEPTED);
    expect(gameSaveMock.handleDraw).toHaveBeenCalled();
    expect(removeGameSpy).toHaveBeenCalledWith("game-1");
  });

  it("notifies both players when a draw is rejected without persisting anything", () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);

    game.drawRejected();

    expect(typeOf(player1.socket)).toBe(OFFER_REJECTED);
    expect(typeOf(player2.socket)).toBe(OFFER_REJECTED);
    expect(gameSaveMock.handleDraw).not.toHaveBeenCalled();
  });

  it("notifies both players of a resignation and persists the result", () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);

    game.resign("white", "p1");

    const p1Payload = JSON.parse((player1.socket.send as any).mock.calls[0][0]);
    expect(p1Payload.type).toBe(RESIGN);
    expect(p1Payload.payload.color).toBe("white");
    expect(gameSaveMock.handleResign).toHaveBeenCalledWith("p1", expect.any(String), expect.any(Number), expect.any(Array), expect.any(String));
  });

  it("declares the opposite color as winner when time runs out", () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);

    game.timeUp("white", "p2");

    const p1Payload = JSON.parse((player1.socket.send as any).mock.calls[0][0]);
    expect(p1Payload.type).toBe(TIME_UP);
    expect(p1Payload.payload.color).toBe("black");
    expect(gameSaveMock.handleWin).toHaveBeenCalledWith("p2", expect.any(String), expect.any(Number), expect.any(Array), expect.any(String));
  });
});

describe("Game.saveGame", () => {
  it("writes serialized game state to redis with a 1 hour expiry", async () => {
    const { player1, player2 } = makePlayers();
    const game = new Game(player1, player2, 60_000, "game-1", Date.now(), "white", true);

    await game.saveGame();

    expect(redis.set).toHaveBeenCalledWith("game:game-1", expect.any(String));
    expect(redis.expire).toHaveBeenCalledWith("game:game-1", 3600);
    const saved = JSON.parse(redis.set.mock.calls[0][1]);
    expect(saved.id).toBe("game-1");
  });
});
