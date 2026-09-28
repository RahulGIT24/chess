import { WebSocket } from "ws";
import { EventEmitter } from "events";
import { UPDATE, END_SESSION } from "../lib/messages";
import redis from "../redis/RedisService";

// Rename to the real domain noun (e.g. Room, MatchSession). One instance per active
// real-time interaction. Owns domain state + both participants' sockets.
//
// It never calls the Manager back directly — it emits events, and whoever created it
// subscribes. This avoids a circular reference and keeps this class testable with plain
// mock sockets ({ send: vi.fn() }) and no real Manager or WebSocketServer.
//
// Permanent persistence (final results, etc.) belongs in a dedicated data-access class
// (see e.g. server1/src/game/GameSave.ts for the pattern), not inline here — this class
// should only ever call `redis` for live-state snapshots, never a DB client directly.

interface Participant {
  socket: WebSocket | null;
  id: string;
}

export class ExampleSession extends EventEmitter {
  public id: string;
  public participant1: Participant;
  public participant2: Participant;

  constructor(id: string, participant1: Participant, participant2: Participant) {
    super();
    this.id = id;
    this.participant1 = participant1;
    this.participant2 = participant2;
  }

  async applyUpdate(socket: WebSocket, payload: unknown) {
    // 1. Validate `payload` (see lib/validators.ts pattern).
    // 2. Mutate this session's domain state.
    // 3. Broadcast the result to both participants.
    const message = JSON.stringify({ type: UPDATE, payload });
    this.participant1.socket?.send(message);
    this.participant2.socket?.send(message);

    await this.saveSnapshot();

    // When the session is actually over:
    // this.emit("removeSession", this.id);
  }

  async saveSnapshot() {
    const key = `session:${this.id}`;
    const state = {
      id: this.id,
      participant1: { id: this.participant1.id },
      participant2: { id: this.participant2.id },
      // ...whatever domain state needs to survive a reconnect
    };
    await redis.set(key, JSON.stringify(state));
    await redis.expire(key, 3600);
  }

  end() {
    const message = JSON.stringify({ type: END_SESSION });
    this.participant1.socket?.send(message);
    this.participant2.socket?.send(message);
    this.emit("removeSession", this.id);
  }
}
