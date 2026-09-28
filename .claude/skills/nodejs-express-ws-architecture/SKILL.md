---
name: nodejs-express-ws-architecture
description: Scaffold a new Node.js + TypeScript backend using the layered architecture from this repo's server1/ (Express REST + optional raw `ws` real-time layer, Prisma/Postgres, Redis, JWT auth, Vitest with colocated tests). Use this whenever the user wants to start a new Node.js/Express backend, asks to "set up a server like the chess app", wants a REST API with a real-time/WebSocket layer, or asks how this project's backend is structured/organized. Also use it as a reference when the user asks about this repo's own server1/ architecture, folder structure, or conventions (singletons, ApiResponse envelope, asyncHandler, domain vs data-access separation, EventEmitter-based decoupling). Trigger even if they don't say "chess" or name files explicitly — "new node backend", "express + websocket server", "scaffold an API with realtime" all qualify.
---

# Node.js / Express layered architecture (from this repo's `server1/`)

This skill packages the backend architecture of this repo's chess server (`server1/`) as a
reusable scaffold. It is a battle-tested pattern for a TypeScript Express API that also needs a
stateful real-time layer (WebSockets), a relational DB, and an in-memory cache/queue — not a
generic "Express starter." Read `references/architecture.md` once per session before scaffolding;
it explains *why* each piece exists, not just what to copy, and calls out one anti-pattern this
codebase actually has that a new project should avoid repeating.

## When to actually scaffold vs. just explain

- User asks about *this repo's* backend architecture → answer from `references/architecture.md`
  and point at the real files in `server1/` (e.g. `server1/src/game/GameManager.ts`). Don't
  create anything.
- User wants a *new* Node.js backend, in this repo or elsewhere → scaffold using the steps below.

## Step 1 — Work out which layers the new project needs

The core (Express + layered folders + Vitest) is always used. The rest are independent add-ons —
don't force them onto a project that doesn't need them. Infer from the request if possible;
otherwise ask briefly. Use this repo's server1/ as the concrete example of "when you'd want this":

| Layer | Pulled in by server1/ because... | Skip it if... |
|---|---|---|
| Prisma + Postgres | needs durable relational data (users, games, ratings) | the app has no persistent relational data yet |
| Redis (`ioredis`) | needs fast ephemeral state (live game snapshots) + a work queue (`brpop` for the analyzer) | there's no live/ephemeral state or background queue |
| Raw `ws` WebSocket server | gameplay is bidirectional and stateful, REST doesn't fit | everything is request/response — skip WS, REST alone is simpler and correct |
| JWT + Google OAuth | needs authenticated users | no auth requirement yet |
| Background worker (`child_process.fork` + Redis queue) | has slow work (Stockfish analysis) that must not block the request/WS loop | no CPU/latency-heavy async work |

## Step 2 — Create the core folder structure

Adapt `{{project}}` to the new app's directory and `{{Entity}}` to its main domain noun (e.g.
`Order`, `Room`, `Ticket` — whatever `Game` was for chess).

```
{{project}}/
  src/
    index.ts            # composition root only — wires everything, contains no business logic
    routes/              # thin Router files: verb+path -> controller (+ middleware)
    controllers/         # one file per resource; parses req, calls domain/lib, returns ApiResponse
    middleware/           # auth, error handler, etc.
    lib/                  # framework-agnostic cross-cutting utilities + singletons
    types/                # shared interfaces/DTOs
  tsconfig.json
  package.json
  vitest.config.ts
  .env.example
```

Copy the always-needed core files verbatim from `assets/templates/core/` (paths mirror the tree
above), then adjust names/content for the domain:

- `package.json` — set `name`, keep the scripts as-is (`dev`, `build`, `watch`, `start`/`prod`,
  `test`/`test:watch`/`test:coverage`); add `db:migrate` only if Prisma is included.
- `tsconfig.json`, `vitest.config.ts` — copy unchanged; they're stack conventions, not
  domain-specific.
- `src/lib/asyncHandler.ts`, `src/lib/ApiResponse.ts` — copy unchanged. These two are the
  foundation of every controller (see "Response and error convention" below).
- `src/middleware/errorHandler.ts` — copy unchanged. **Use this instead of** the
  try/catch-in-every-controller pattern server1/ actually has; see the anti-pattern note.
- `src/routes/example.routes.ts` + `src/controllers/example.controller.ts` — rename to the real
  resource and use as the pattern for every other route/controller pair.
- `src/types/types.ts` — start empty except for whatever DTOs the first resource needs.

## Step 3 — Add only the layers the project needs

Each add-on below is a self-contained set of template files under `assets/templates/<layer>/` —
copy the ones that apply, then wire them into `src/index.ts` per the note in each file.

- **Prisma + Postgres** → copy `assets/templates/prisma/` (`prisma/schema.prisma`,
  `src/lib/prisma.ts`). Start `schema.prisma` with just the entities the new app actually has —
  don't carry over `Game`/`Rating`/etc. Add `db:migrate` to `package.json` scripts.
- **Redis** → copy `assets/templates/redis/src/redis/RedisService.ts` unchanged — it's a generic
  lazy singleton, nothing chess-specific in it.
- **JWT auth (+ optional Google OAuth)** → copy `assets/templates/auth-jwt/` (`middleware/auth.ts`,
  `lib/jwt.ts`, optionally `lib/googleclient.ts`). Requires Prisma (it loads the user by id).
- **Real-time / WebSocket layer** → copy `assets/templates/websocket/` and read
  `references/websocket-pattern.md` first — this is the highest-value and least obvious part of
  the architecture (manager/session split, EventEmitter decoupling, reconnect-from-cache). Don't
  skip the reference file for this one.
- **Background worker** → copy `assets/templates/worker/src/worker/scheduler.ts`, fork it from
  `index.ts` (`fork(path.resolve(__dirname, './worker/scheduler.js'))`), and give it its own Redis
  queue key. Only needed once there's actual slow/CPU-bound async work to offload.

## Step 4 — Wire `src/index.ts`

`src/index.ts` should only: load env, build the Express app, apply middleware, mount routers,
(optionally) start the `WebSocketServer` on a second port, (optionally) fork the background
worker, and `listen()`. If you find yourself adding a conditional or a loop with real logic in
here, that logic belongs in `routes/`, `controllers/`, or a domain module instead — this file
should stay boring. Copy `assets/templates/core/src/index.ts` as the starting point and splice in
the WS/worker blocks from their template files only if those layers were added.

## Response and error convention — pick ApiResponse, and only ApiResponse

Every controller returns `res.status(code).json(new ApiResponse(code, data, message))` on
success. `ApiResponse` doubles as the shape thrown on failure. **Use exactly one mechanism to
turn a thrown/rejected error into that JSON shape**: wrap every async handler in `asyncHandler`
(from `lib/asyncHandler.ts`) so rejections reach `next(err)`, and let the single
`middleware/errorHandler.ts` at the end of the middleware chain turn any error — `ApiResponse` or
not — into the right response.

server1/'s controllers actually do *both* — `asyncHandler` **and** a manual try/catch with an
`instanceof ApiResponse` check inside every handler body. That's redundant: pick the centralized
error handler, don't copy the per-handler try/catch into a new project. It's called out here
because it's the one place this skill deliberately does *not* mirror server1/ as-is.

## Testing convention

Put `*.test.ts` next to the file it tests (not in a separate `__tests__/` tree). Mock every
external I/O boundary with `vi.mock()` — Prisma, Redis, WebSocket/`socket.send` — so the whole
suite runs with no live DB, Redis, or network. `vitest.config.ts`'s coverage `exclude` should list
`src/types/**`, `src/index.ts`, and any forked worker entrypoint, since none of those are
meaningfully unit-testable. `server1/src/game/Game.test.ts` and `PendingUsers.test.ts` in this
repo are good worked examples of mocking pattern if you want to show the user a live reference
instead of (or alongside) the template.

## Reference material

- `references/architecture.md` — the full annotated layer breakdown, all 12 conventions with the
  reasoning behind each, and the monorepo/Docker/CI shape (client+server siblings, one Dockerfile
  per service, one CI workflow with independent jobs) — read this before explaining the
  architecture to a user or making a judgment call the steps above didn't cover.
- `references/websocket-pattern.md` — the Manager/Session/EventEmitter real-time pattern in
  depth, since it's the least standard and easiest-to-get-wrong piece.
