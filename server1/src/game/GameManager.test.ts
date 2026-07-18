import { describe, it, expect, vi, beforeEach } from "vitest";
import { ERROR, INIT_GAME, OPPO_DISCONNECT, RECONNECTED } from "../lib/messages";

const gameSaveMock = {
  setid: vi.fn(),
  initGameSave: vi.fn().mockResolvedValue(undefined),
  handleWin: vi.fn().mockResolvedValue(undefined),
  handleDraw: vi.fn().mockResolvedValue(undefined),
  handleResign: vi.fn().mockResolvedValue(undefined),
  getUserRating: vi.fn().mockResolvedValue(1000),
  checkCompatibility: vi.fn().mockResolvedValue(true),
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

vi.mock("../lib/prisma", () => ({
  prisma: {
    game: { findFirst: vi.fn().mockResolvedValue(null) },
    user: { findFirst: vi.fn() },
  },
}));

const { GameManager } = await import("./GameManager");
const { prisma } = (await import("../lib/prisma")) as any;

function makeSocket() {
  return { send: vi.fn(), on: vi.fn() } as any;
}

function messageHandlerOf(socket: any) {
  const call = socket.on.mock.calls.find((c: any[]) => c[0] === "message");
  return call?.[1];
}

beforeEach(() => {
  vi.clearAllMocks();
  gameSaveMock.getUserRating.mockResolvedValue(1000);
  gameSaveMock.checkCompatibility.mockResolvedValue(true);
  prisma.game.findFirst.mockResolvedValue(null);
});

describe("GameManager.addUser", () => {
  it("registers a message handler and checks the DB for an in-progress game when none is in memory", async () => {
    const gm = new GameManager();
    const socket = makeSocket();

    await gm.addUser(socket, "brand-new-user");

    expect(prisma.game.findFirst).toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith("message", expect.any(Function));
  });
});

describe("GameManager.removeUser", () => {
  it("does nothing when the socket has no associated game", async () => {
    const gm = new GameManager();
    const socket = makeSocket();

    await expect(gm.removeUser(socket)).resolves.toBeUndefined();
  });

  it("notifies the opponent and clears the disconnecting player's socket", async () => {
    const gm = new GameManager();
    const socketA = makeSocket();
    const socketB = makeSocket();

    await gm.addUser(socketA, "userA");
    await gm.addUser(socketB, "userB");

    const handlerA = messageHandlerOf(socketA);
    const handlerB = messageHandlerOf(socketB);

    await handlerA(JSON.stringify({ type: INIT_GAME, id: "userA", name: "Alice", time: "7 min" }));
    await handlerB(JSON.stringify({ type: INIT_GAME, id: "userB", name: "Bob", time: "7 min" }));

    socketA.send.mockClear();
    socketB.send.mockClear();

    await gm.removeUser(socketA);

    expect(socketA.send).not.toHaveBeenCalled();
    const [payload] = socketB.send.mock.calls[0];
    expect(JSON.parse(payload).type).toBe(OPPO_DISCONNECT);
  });
});

describe("GameManager matchmaking", () => {
  it("queues the first player and matches them with a second compatible player", async () => {
    const gm = new GameManager();
    const socketA = makeSocket();
    const socketB = makeSocket();

    await gm.addUser(socketA, "playerA");
    await gm.addUser(socketB, "playerB");

    const handlerA = messageHandlerOf(socketA);
    const handlerB = messageHandlerOf(socketB);

    await handlerA(
      JSON.stringify({ type: INIT_GAME, id: "playerA", name: "Alice", time: "9 min" })
    );
    // First player just gets queued; no message is sent back yet.
    expect(socketA.send).not.toHaveBeenCalled();

    await handlerB(
      JSON.stringify({ type: INIT_GAME, id: "playerB", name: "Bob", time: "9 min" })
    );

    expect(gameSaveMock.checkCompatibility).toHaveBeenCalledWith({ player1: "playerA", player2: "playerB" });
    const socketAPayload = JSON.parse(socketA.send.mock.calls[0][0]);
    const socketBPayload = JSON.parse(socketB.send.mock.calls[0][0]);
    expect(socketAPayload.type).toBe(INIT_GAME);
    expect(socketBPayload.type).toBe(INIT_GAME);
    expect(socketAPayload.payload.name).toBe("Bob");
    expect(socketBPayload.payload.name).toBe("Alice");
  });

  it("rejects a player who tries to queue while already in an active game", async () => {
    const gm = new GameManager();
    const socketA = makeSocket();
    const socketB = makeSocket();
    const socketC = makeSocket();

    await gm.addUser(socketA, "gpA");
    await gm.addUser(socketB, "gpB");
    await gm.addUser(socketC, "gpA-second-connection");

    const handlerA = messageHandlerOf(socketA);
    const handlerB = messageHandlerOf(socketB);
    const handlerC = messageHandlerOf(socketC);

    await handlerA(JSON.stringify({ type: INIT_GAME, id: "gpA", name: "A", time: "3 min" }));
    await handlerB(JSON.stringify({ type: INIT_GAME, id: "gpB", name: "B", time: "3 min" }));

    socketA.send.mockClear();
    socketB.send.mockClear();

    // gpA tries to queue again on a second socket while already in the game just created.
    await handlerC(JSON.stringify({ type: INIT_GAME, id: "gpA", name: "A", time: "3 min" }));

    const payload = JSON.parse(socketC.send.mock.calls[0][0]);
    expect(payload.type).toBe(ERROR);
    expect(payload.payload.message).toBe("You are already in another game");
  });
});
