# The real-time layer: Manager / Session / EventEmitter pattern

This is the part of server1/'s architecture that isn't a standard Express thing, modeled on
`GameManager` + `Game`. Read this before wiring `assets/templates/websocket/` into a new project.
The naming below uses generic terms; the mapping to server1/'s actual names is given in
parentheses throughout.

## The two objects

**Manager (`GameManager`)** — one instance for the whole process, created once in `index.ts` and
passed the raw `WebSocketServer`'s connections.

- Holds the in-memory list of active sessions (`games`) and every connected socket (`users`).
- Is the *only* place that reads an incoming message's `type` field and decides what to do with it
  — matchmaking, routing to a session, or removal on disconnect. Nothing else in the codebase
  switches on WS message types.
- Owns matchmaking (`PendingUsers`, a plain enqueue/dequeue queue) — pairs two waiting connections
  into a new Session once compatible.
- Owns reconnect recovery: on a new connection, check in-memory sessions first, then Redis (a live
  snapshot), then Postgres (a durable but possibly-stale record) — the three-tier lookup that lets
  a player refresh their browser mid-game and pick back up.
- Never touches game rules — it delegates every actual move/state transition to the Session.

**Session (`Game`)** — one instance per active real-time interaction (one chess match).

- `extends EventEmitter`. It has no reference back to the Manager; instead it does
  `this.emit("removeGame", this.id)` when it's finished (checkmate, resignation, draw, timeout),
  and the Manager subscribed to that event when it created the Session. This is the key decoupling
  move: the Session doesn't need to know who's listening or what "being removed" even means at the
  system level — it just announces "I'm done."
- Owns the actual domain state (chess.js board) and both participants' sockets.
- Snapshots its full state to Redis on every mutation (`saveGame`), so the Manager's reconnect
  logic can rebuild it later without replaying every move.
- Delegates all *permanent* persistence (final result, rating updates) to a dedicated data-access
  class (`GameSave`) rather than calling Prisma itself — see architecture.md convention #2.
- Is fully unit-testable with plain mock sockets (`{ send: vi.fn() }`) and no real WebSocketServer,
  because it never touches `ws`'s server machinery directly, only the individual socket objects
  it's handed.

## Why not simpler alternatives

- **A single class doing both jobs** (routing + game state) works for a toy example but stops
  scaling once you have real matchmaking, reconnects, and multiple simultaneous sessions — you end
  up with one giant class mixing "which socket is this" bookkeeping with "is this chess move
  legal" logic, both of which get harder to test in isolation.
- **The Session calling back into the Manager directly** (`this.manager.removeGame(this.id)`)
  works but creates a circular import/reference and makes the Session impossible to unit-test
  without a real or heavily-mocked Manager. The EventEmitter callback removes that coupling for
  the cost of one `.on()` call at creation time.
- **Polling Redis/Postgres for state changes** instead of push-based WS messages would add latency
  and load proportional to poll frequency; for gameplay where both players need moves in
  near-real-time, push is the only reasonable choice — this is the actual reason a WS layer exists
  alongside REST at all.

## Adapting the naming for a new domain

| Chess (server1/) | Generic |
|---|---|
| `GameManager` | `<Domain>Manager` — e.g. `RoomManager`, `SessionManager` |
| `Game` | `<Domain>Session` — e.g. `Room`, `MatchSession` |
| `PendingUsers` | whatever the matchmaking/queueing unit is called, or delete it if there's no matchmaking step |
| `GameSave` | `<Domain>Repository` / `<Domain>Save` |
| `INIT_GAME`, `MOVE`, ... in `messages.ts` | the new domain's own message-type constants |

Keep the shape (Manager owns routing+lifecycle, Session owns domain state+EventEmitter, dedicated
data-access class owns writes) even when the names change — that shape is the reusable part, not
the chess-specific field names.
