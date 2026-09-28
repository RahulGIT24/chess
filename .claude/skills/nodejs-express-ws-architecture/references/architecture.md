# Architecture deep dive (source: this repo's `server1/`)

This is the annotated version of the folder tree summarized in SKILL.md, plus the reasoning
behind each convention. Read this when explaining the architecture to a user, or when a scaffold
decision isn't covered by SKILL.md's steps.

## Full annotated tree

```
server1/
  src/
    index.ts                  # composition root: express app, middleware, WS server, route
                               # mounting, forks the background worker. No business logic.
    controllers/               # one file per resource
      auth.controller.ts
      game.controller.ts
    routes/                    # thin Router definitions: verb+path -> controller (+ middleware)
      auth.routes.ts
      game.route.ts
    middleware/
      auth.ts                  # verifyJWT: cookie or Bearer header -> jwt.verify -> load user via
                                # Prisma -> attach req.user -> next(), or throw ApiResponse
    lib/                       # framework-agnostic cross-cutting utilities
      ApiResponse.ts            # uniform { statuscode, data, message } envelope, also thrown as
                                 # an error to carry an HTTP status through a catch block
      asyncHandler.ts           # Promise.resolve(handler(...)).catch(next) wrapper
      prisma.ts                 # `export const prisma = new PrismaClient()` — single instance
      googleclient.ts           # `export const client = new OAuth2Client()` — single instance
      validators.ts             # zod schemas + validator functions for payloads (e.g. chess moves)
      messages.ts                # string constants for WS message `type` discriminants — the
                                  # shared vocabulary between client and server
      timeConstants.ts / timeCompute.ts  # small pure-function modules, each with its own
                                          # colocated *.test.ts
    redis/
      RedisService.ts            # class with `private static instance`, `static getInstance()`
                                  # lazily creating it, module exports the instance directly
    game/                        # domain/business-logic layer for the real-time feature —
                                  # deliberately has zero Express imports
      GameManager.ts              # orchestrator: in-memory array of active Game instances + all
                                   # connected sockets; the ONE place that switches on WS message
                                   # `type` and routes to the right Game or matchmaking queue;
                                   # also owns reconnect recovery (memory -> Redis -> Postgres)
      Game.ts                     # one instance per live match; extends EventEmitter; owns
                                   # chess.js board + both sockets + clocks; snapshots itself to
                                   # Redis (`saveGame`) on every state change, delegates permanent
                                   # writes to GameSave
      PendingUsers.ts              # tiny in-memory matchmaking queue (enqueue/dequeue), its own
                                   # unit tests, no I/O
      GameSave.ts                  # ALL Prisma calls for the Game aggregate live here — win/
                                   # resign/draw persistence, rating updates. Game.ts never
                                   # imports `prisma` directly.
      Analyzer.ts / scheduler.ts   # background worker: scheduler.ts is the forked entrypoint,
                                   # blocks on `redis.brpop(key, 0)`, hands each job to Analyzer.ts
      *.test.ts                    # colocated, `vi.mock()` on GameSave/redis/socket
    types/
      types.ts                    # shared interfaces: domain entities, DTOs, DecodedToken
      stockfish.d.ts               # ambient declarations for a JS-only dependency
  prisma/
    schema.prisma                 # single source of truth for the DB schema
  vitest.config.ts                 # node env, `src/**/*.test.ts`, v8 coverage excluding
                                    # types/index.ts/scheduler.ts
  tsconfig.json                    # strict: true, module: commonjs, rootDir: src, outDir: dist
  package.json                     # dev (nodemon dist), build (tsc -b), watch (tsc -w),
                                    # start/prod (node dist), db:migrate (prisma migrate dev),
                                    # test / test:watch / test:coverage (vitest)
  .env.example                     # documents every required env var, no real secrets
```

## The 12 conventions, and why each one is there

1. **Layering: routes → controllers → domain classes/lib → data-access.** Controllers only parse
   the request and call something else — they never contain a `while`/matchmaking loop or own
   in-memory state. Anything that isn't "translate HTTP to a function call" (the whole `game/`
   folder) lives outside `controllers/` entirely, with no Express types imported. This is what
   lets `Game`, `GameManager`, and `PendingUsers` be unit-tested with plain objects instead of
   mocked `req`/`res`.

2. **Data-access isolation.** `GameSave.ts` is the only file that calls `prisma.game.*` for
   game-result writes. `Game.ts` (the in-memory, per-match object) calls `GameSave` methods, never
   Prisma directly. This means the persistence strategy (which DB, which schema) can change
   without touching the in-memory game logic, and the in-memory logic can be tested without a DB.

3. **Two real-time layers side by side.** REST (`express`) handles CRUD/auth — stateless,
   request/response. Raw `ws` (`WebSocketServer`) handles the live game — stateful, bidirectional,
   long-lived connections. Both are started from the same `index.ts` and share the same
   `lib/prisma.ts` and `redis/RedisService.ts` singletons. Don't try to force one transport to do
   both jobs — REST for a live two-way game would mean polling; WS for simple auth/CRUD would mean
   reimplementing routing and status codes by hand.

4. **Singletons for anything stateful/expensive to construct.** `PrismaClient` and the Redis
   client are each created exactly once (module-level `const`, or a lazy `static getInstance()`)
   and imported everywhere they're needed. Never `new PrismaClient()` or `new Redis()` inside a
   request handler — that leaks connections under load.

5. **Uniform API envelope, dual-purpose.** `ApiResponse` is both the success payload shape
   (`res.json(new ApiResponse(200, data, "OK"))`) and the thing thrown on failure
   (`throw new ApiResponse(403, null, "Unauthorized")`), caught and re-serialized the same way.
   One class, one shape, everywhere — a frontend never has to branch on "is this a success or
   error format."

6. **`asyncHandler` wraps every async Express handler.** Express doesn't forward rejected promises
   to error middleware on its own; `asyncHandler(fn)` does `Promise.resolve(fn(...)).catch(next)`
   so a thrown/rejected error always reaches `next(err)` instead of crashing the process or
   hanging the request. server1/ additionally wraps every controller body in its own try/catch —
   SKILL.md calls this out as redundant; a new project should pick asyncHandler+centralized
   error middleware **or** per-handler try/catch, not both.

7. **WS messages are routed by a string `type` constant**, all defined once in `lib/messages.ts`
   (`INIT_GAME`, `MOVE`, `RESIGN`, ...) and switched on on the server (`GameManager.addHandler`)
   the same way the client switches on the socket's `onmessage`. This constants file is the
   contract between client and server — add a new message type there first, not inline as a
   string literal in two places.

8. **`EventEmitter` for decoupling child from parent.** `Game` doesn't hold a reference back to
   `GameManager` to say "remove me when I'm over" — it `extends EventEmitter` and does
   `this.emit("removeGame", this.id)`; `GameManager` subscribes when it creates each `Game`. This
   avoids a circular dependency and means `Game` can be unit-tested with a plain
   `game.on("removeGame", spy)` instead of a mocked manager.

9. **Slow/CPU-bound work runs in a forked child process, fed by a blocking Redis queue.**
   `scheduler.ts` is `fork()`'d from `index.ts` and does `await redis.brpop(key, 0)` in an infinite
   loop — it blocks *that process*, not the main event loop serving HTTP/WS traffic. Producers
   (e.g. a controller wanting a game analyzed) just `LPUSH`/`RPUSH` a job payload onto the queue
   and return immediately. This is preferred over `setInterval` polling or running the work inline
   on a request/message handler, because Stockfish analysis is slow enough to stall real gameplay
   if it ran on the same event loop as the WS server.

10. **Tests are colocated and mock every I/O boundary.** `Game.test.ts` sits next to `Game.ts`;
    `vi.mock("../redis/RedisService")` and `vi.mock("./GameSave")` replace Redis and Prisma access
    with spies, so the whole suite runs with `pnpm test` and no live database, Redis instance, or
    network — which is also why the CI workflow (see below) needs no secrets or services to pass.

11. **Env-driven config, never hardcoded.** `dotenv.config()` in `index.ts`, every secret/URL read
    from `process.env`, and `.env.example` documents the full list a new deploy needs
    (`DATABASE_URL`, `REDIS_HOST`/`REDIS_PORT`, `CLIENT_URL`, `JWT_SECRET`/`JWT_SECRET_REFRESH`,
    `STOCKFISH_PATH`, ...). `docker-compose.yml` supplies throwaway values for local dev only —
    never copy those into a committed `.env`.

12. **Monorepo shape.** `client/` (Vite+React) and `server1/` (this Node app) are sibling
    top-level folders, each with its own `package.json`/lockfile/`tsconfig`/`vitest.config.ts`.
    Root level holds one `Dockerfile.client`, one `Dockerfile.server`, one `docker-compose.yml`
    wiring `db` (Postgres), `redis`, `backend`, `frontend` together, and a single GitHub Actions
    workflow (`.github/workflows/ci.yml`) with two independent jobs (`server`, `client`), each
    scoped to its own `working-directory` and its own install/build/test steps. Neither CI job
    needs a live DB/Redis/secret, by design (see convention 10). Adopt this shape only when there
    actually are two deployable halves — a backend-only project doesn't need the `client/` sibling
    or `Dockerfile.client`.

## What NOT to copy as-is

The one deliberate deviation from server1/, called out again here because it's easy to miss: the
double error-handling (asyncHandler *and* try/catch-with-`instanceof ApiResponse` in every
controller). Pick one. `assets/templates/core/src/middleware/errorHandler.ts` is the centralized
version this skill recommends for new projects.
