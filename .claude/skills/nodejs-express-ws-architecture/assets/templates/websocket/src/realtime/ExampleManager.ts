import { WebSocket } from "ws";
import { ExampleSession } from "./ExampleSession";
import { CONNECT, INIT_SESSION, UPDATE } from "../lib/messages";

// Rename to the real domain noun (e.g. RoomManager). ONE instance for the whole process,
// created once in index.ts. This is the only place that reads an incoming message's `type`
// and decides what to do with it — sessions never route messages themselves.

interface ConnectedUser {
  socket: WebSocket;
  id: string;
}

export class ExampleManager {
  private sessions: ExampleSession[] = [];
  private users: ConnectedUser[] = [];
  private pendingUserId: string | null = null;
  private pendingSocket: WebSocket | null = null;

  addUser(socket: WebSocket, id: string) {
    this.users.push({ socket, id });

    const session = this.sessions.find(
      (s) => s.participant1.id === id || s.participant2.id === id
    );
    if (session) {
      // Reconnect path: re-attach the new socket to the existing in-memory session.
      // A real implementation should also fall back to Redis, then the DB, if the
      // session isn't in memory — see references/websocket-pattern.md.
      if (session.participant1.id === id) session.participant1.socket = socket;
      else session.participant2.socket = socket;
      return;
    }

    this.addHandler(socket, id);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((u) => u.socket !== socket);
    const session = this.sessions.find(
      (s) => s.participant1.socket === socket || s.participant2.socket === socket
    );
    if (!session) return;

    if (session.participant1.socket === socket) session.participant1.socket = null;
    else if (session.participant2.socket === socket) session.participant2.socket = null;
  }

  private addHandler(socket: WebSocket, id: string) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_SESSION) {
        if (this.pendingUserId && this.pendingUserId !== id && this.pendingSocket) {
          const sessionId = crypto.randomUUID();
          const session = new ExampleSession(
            sessionId,
            { socket: this.pendingSocket, id: this.pendingUserId },
            { socket, id }
          );
          session.on("removeSession", (sid: string) => this.removeSession(sid));
          this.sessions.push(session);
          this.pendingUserId = null;
          this.pendingSocket = null;
        } else {
          this.pendingUserId = id;
          this.pendingSocket = socket;
        }
      }

      if (message.type === UPDATE) {
        const session = this.sessions.find(
          (s) => s.participant1.socket === socket || s.participant2.socket === socket
        );
        session?.applyUpdate(socket, message.payload);
      }
    });
  }

  private removeSession(sessionId: string) {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
  }
}
