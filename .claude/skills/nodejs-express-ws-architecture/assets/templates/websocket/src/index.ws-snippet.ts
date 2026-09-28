// Splice this into the composition root's index.ts, after `const app = express()` and
// before `app.listen(...)`. It runs a SECOND listener (WS) alongside the HTTP API, both
// in the same process, sharing the same lib/prisma and redis/RedisService singletons.

import { WebSocketServer } from "ws";
import { ExampleManager } from "./realtime/ExampleManager";
import { CONNECT } from "./lib/messages";

const wss = new WebSocketServer({ port: Number(process.env.SOCKET_PORT) || 5002 });
const manager = new ExampleManager();

wss.on("connection", (ws) => {
  ws.on("error", console.error);
  ws.on("close", () => manager.removeUser(ws));

  ws.on("message", (data) => {
    const parsed = JSON.parse(String(data));
    if (parsed.type === CONNECT) {
      if (!parsed.id) return;
      // Look the user up (e.g. via prisma.user.findFirst) before trusting the id, exactly
      // like server1/index.ts does, then:
      manager.addUser(ws, parsed.id);
    }
  });
});
