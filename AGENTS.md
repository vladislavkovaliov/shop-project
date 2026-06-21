# shop-project — monorepo

Содержит три подпроекта:
- `shop-ui-angular/` — Angular 21.2 frontend + SSR (Express)
- `shop-api-golang/` — Go backend (SQL workshop)
- `shop-graphql-nestjs/` — NestJS GraphQL API (Apollo + TypeORM)

---

## shop-ui-angular

Angular 21.2 CLI scaffold — standalone components, SSR, Tailwind v4, Vitest.

### Architecture

- **Standalone components** — no NgModules. Generated via `ng generate component`.
- **SSR** via `@angular/ssr` + Express (`src/server.ts`). All routes `RenderMode.Server` (no prerender).
- **Tailwind CSS v4** via `@tailwindcss/postcss` PostCSS plugin. Global `@import 'tailwindcss'` in `styles.css`. No `tailwind.config.*` — inline `@theme` directives.
- **Vitest** (not Karma/Jasmine). Globals (`describe`, `it`, `expect`) available without imports.
- **Prettier** only — `printWidth: 100`, `singleQuote`. No ESLint.
- **Strict TypeScript** (`strict`, `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers` all on).
- **Auth** via Better Auth on SSR (Express handler). Angular side: `auth.service.ts`, `auth.guard.ts` (SSR-aware), `api-base-url.interceptor.ts` (`withCredentials: true`), login page, conditional sidebar.

### SSR Server (`src/server.ts`)

Express server with:
- `dotenv/config` at import time
- CORS (origin `http://localhost:4200`, credentials true)
- Better Auth `toNodeHandler()` at `/^\/api\/auth\//`
- API proxy `/api/*` → `http://localhost:8080` (Go backend)
- `AngularNodeAppEngine` with `allowedHosts: ['localhost']` (prevents SSR SSRF rejection)
- Port 4000

### Better Auth (`src/server/`)

| File | Purpose |
|------|---------|
| `auth.ts` | Better Auth instance — drizzleAdapter, schema, emailAndPassword, trustedOrigins |
| `auth-schema.ts` | Drizzle schema: user, session, account, verification (camelCase columns) |
| `db.ts` | Postgres connection via `postgres` lib (from `DATABASE_URL`) |

### Auth files (Angular)

| File | Purpose |
|------|---------|
| `src/lib/auth-client.ts` | `createAuthClient()` with `baseURL: environment.authUrl` |
| `src/app/services/auth/auth.service.ts` | Wraps authClient: `signIn`, `signUp`, `signOut`, `init()` |
| `src/app/guards/auth.guard.ts` | SSR-aware guard: server → redirect `/login`; client → init + redirect |
| `src/app/interceptors/api-base-url.interceptor.ts` | Rewrites `/api/*` → `apiUrl`, adds `withCredentials: true` |
| `src/app/pages/login/login.ts` + `.html` | Login/register form toggle |
| `src/app/app.ts` + `app.html` | `AuthService.init()` in `ngOnInit`, conditional sidebar via `isLoggedIn()` |

### Environments

| File | apiUrl | authUrl |
|------|--------|---------|
| `environment.ts` | `http://localhost:4000` | `http://localhost:4000` |
| `environment.prod.ts` | `''` (same-origin via nginx) | `''` (same-origin) |

### Commands

| Action | Command |
|--------|---------|
| Dev (build + SSR + ng serve) | `npm run dev` |
| Build (SSR) | `npm run build` |
| SSR server only | `npm start` |
| Dev server only | `ng serve` (port 4200) |
| Test (Vitest) | `ng test` |
| Format | `npx prettier --write .` |

### Framework & quirks

- **Build quirk**: `npx ng build` requires `--legacy-peer-deps` because `better-auth` pulls `sveltekit` → `vite@8` which conflicts with Angular's `vite@7`.
- **SSR quirk**: `AngularNodeAppEngine` blocks requests without `allowedHosts` — always add `allowedHosts: ['localhost']` for dev.
- **Auth quirk**: In SSR `ngOnInit`, `AuthService.init()` calls `authClient.getSession()`. On server (no cookie), it fails gracefully via try/catch, setting session to `null`.
- **Auth quirk**: Better Auth `trustedOrigins: ['http://localhost:4200']` needed in dev for cross-origin cookies.
- **Routing**: All routes use `renderMode: RenderMode.Server` — no prerender (API unavailable during build).
- **`.env`** file in `shop-ui-angular/`: `DATABASE_URL`, `AUTH_SECRET`, `BETTER_AUTH_URL`, `API_URL`.

---

## shop-api-golang

Go educational backend for a SQL workshop. Module: `shop-api` (Go 1.25).

### Project structure

```
shop-api-golang/
  cmd/
    api/main.go              — entrypoint, swagger annotations, server wiring
    api/wiring.go             — router setup with auth boundaries
    migration/main.go         — DB migrations
    migration/seed_users/     — user seed data
  internal/
    config/config.go          — env-based config (godotenv)
    events/                   — Kafka event consumers/producers (order, user)
    rabbit/                   — RabbitMQ consumer/producer/types
  domain/
    product/                  — Product entity + Repository interface
    category/                 — Category entity + Repository interface
    order/                    — Order, OrderItem, daily_stats, widgets, etc.
    user/                     — User entity + Repository interface
    widget/                   — Widget stats
    growth/                   — Growth metrics
  repository/
    product/                  — Product repository impl
    category/                 — Category repository impl
    order/                    — Order repository impl
    user/                     — User repository impl
    widget/                   — Widget repository impl
  service/
    product/                  — Product business logic
    category/                 — Category business logic
    order/                    — Order business logic
    user/                     — User business logic
    widget/                   — Widget business logic
  http/
    handlers/                 — Gin handlers (product, category, order, user)
    dto/                      — Response DTOs
    middleware/auth.go        — Auth middleware (cookie/Bearer → session DB check)
  docs/                       — swaggo generated (do not edit manually)
  restore.sql                 — Full DB dump (business data + auth tables)
  .air.toml                   — hot-reload config
```

### Key conventions

- **Architecture**: domain → repository → service → handler (clean layers, DIP via interfaces in domain).
- **Repository interface** in `domain/xxx/repository.go`, impl in `repository/xxx/`.
- **Package naming**: service = `service/xxx/` (package `xxx`), handler = `http/handlers/` (package `handlers`).
- **Domain fields** are unexported lowercase — serialization via explicit DTO mapping. DTO fields **must** be exported for `encoding/json`.

### Auth middleware (`http/middleware/auth.go`)

- Reads `better-auth.session_token` cookie, falls back to `Authorization: Bearer` header.
- Token format from Better Auth: `{32-char-id}.{hmac-signature}` — middleware splits on `.`, uses only the first part (the DB `session.token`).
- Queries `"session"` table (camelCase columns quoted: `"userId"`, `"expiresAt"`).
- Sets `userID` in Gin context on success, returns 401 on failure.

### Auth boundaries (`cmd/api/wiring.go`)

| Group | Public endpoints | Protected (authMw) |
|-------|-----------------|---------------------|
| Products + Categories | All (list, get, revenue-stats) | — |
| Orders | `count`, `trend` | CRUD (list, get-by-id, create, update, delete) |
| Users | `count`, `registration-trend` | CRUD (list, get-by-id, create, update, delete) |

### Swagger

- Bearer auth defined in `cmd/api/main.go` via `@securityDefinitions.apikey BearerAuth`.
- Protected endpoints annotated with `@Security BearerAuth`.
- Regenerate: `swag init -g ./cmd/api/main.go` (from `shop-api-golang/`).

### Database

- Default URL: `postgres://postgres:postgres@localhost:55000/shop`.
- Config via env vars: `PORT`, `DATABASE_URL` (loaded from `.env` if present).
- `restore.sql` contains business tables (categories, products, orders, etc.) + **auth tables** (`user`, `session`, `account`, `verification` with camelCase columns). Load with `psql -f restore.sql`.
- Auth tables use `CREATE TABLE IF NOT EXISTS` — safe to run alongside Better Auth auto-migration.

### Commands

| Action | Command |
|--------|---------|
| Run with hot-reload | `air` (from `shop-api-golang/`) |
| Manual build | `go build -o ./tmp/main ./cmd/api/main.go` |
| Run directly | `go run ./cmd/api/main.go` |
| Regenerate swagger | `swag init -g ./cmd/api/main.go` |
| Run tests | `go test ./...` |

---

## shop-graphql-nestjs

NestJS GraphQL API (Apollo + TypeORM + PostgreSQL). Module: `shop-graphql-nestjs`.

### Structure

```
shop-graphql-nestjs/
  src/
    main.ts                     — entry point
    app.module.ts               — root module, GraphQL + TypeORM config
    schema.gql                  — auto-generated GraphQL schema
    auth/                       — Better Auth session entity + module
    guards/
      auth.guard.ts             — GraphQL auth guard (reads cookie/session)
      current-user.decorator.ts — @CurrentUser() param decorator
    controllers/
      users/                    — user queries + mutations
        users.module.ts
        users.resolver.ts
        users.service.ts
        users.repository.ts
        entities/user.entity.ts
        dto/
      orders/                   — order queries
        orders.module.ts
        orders.resolver.ts
        orders.service.ts
        orders.repository.ts
        entities/order.entity.ts
        dto/
```

### Key conventions

- **Standalone modules** — no shared module, each feature registers its own TypeORM entities.
- **Repository pattern** — TypeORM for simple queries (`find`, `count`), `@InjectDataSource()` + raw SQL for complex joins.
- **Auth** — `@UseGuards(AuthGuard)` per-method on protected queries. Public queries have no guard.
- **GrowthResponse** DTO shared between users and orders via import from `users/dto/`.
- **PostgreSQL functions/views** — shared between Go and NestJS via `shop-api-golang/restore.sql` (mounted to postgres container).

### Commands

| Action | Command |
|--------|---------|
| Build | `npm run build` |
| Dev | `npm run start:dev` |
| Test | `npm test` |

---

## tools/review

Go CLI для code review и работы с SQL. Собирается в `tools/review/review`.

### Structure

```
tools/review/
  main.go              — dispatcher: review | sql, flags: --model, --ollama-url, --help
  review.go            — code review: git diff → Ollama
  sql.go               — sql extract: find duplicate SQL → Ollama → DDL
  internal/
    git/diff.go        — git diff --cached for .ts files
    llm/ollama.go      — Ollama API client (chat, no streaming)
    report/writer.go   — formatted terminal output
    sql/
      scanner.go       — extract SQL blocks from .go and .repository.ts
      matcher.go       — normalize, hash, group duplicates
      extract.go       — scan → match → Ollama → print DDL
```

### Commands

| Command | Description |
|---------|-------------|
| `./review` | Review staged changes in shop-graphql-nestjs/ |
| `./review sql` | Find duplicate SQL between Go and NestJS, suggest extraction |
| `./review --help` | Show help |

### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--model <name>` | `deepseek-coder:6.7b` | Ollama model |
| `--ollama-url <url>` | `http://192.168.1.85:11434` | Ollama server |

### sql extract flow

1. Scan `shop-api-golang/repository/*.go` and `shop-graphql-nestjs/src/**/*.repository.ts` for SQL in backtick strings
2. Normalize (lowercase, collapse whitespace, `$N` → `?`), hash, group by hash
3. Filter out already-extracted SQL (function calls, view calls)
4. For each cross-project duplicate: show files + SQL → ask `[y/N]` → if yes, send to Ollama → print `CREATE OR REPLACE FUNCTION` DDL to terminal

---

## Docker Compose (root `docker-compose.yml`)

7 services, all defined in root compose:

| Service | Image/Build | Port(s) | Notes |
|---------|-------------|---------|-------|
| `postgres` | `postgres:latest` | `55000:5432` | Volume `pgdata` at `/var/lib/postgresql`; `restore.sql` mounted to `/docker-entrypoint-initdb.d/` |
| `redpanda` | `redpanda:latest` | `9092:9092`, `8081:8081` | Kafka-compatible |
| `console` | `console:latest` | `8082:8080` | Redpanda Console |
| `rabbitmq` | `rabbitmq:4-management` | `5672:5672`, `15672:15672` | |
| `api` | `./shop-api-golang/Dockerfile` | `8080:8080` | Go backend |
| `ssr` | `./shop-ui-angular/Dockerfile` | (expose 4000) | SSR Express, behind nginx |
| `nginx` | `nginx:alpine` | `80:80` | Reverse proxy: `/api/auth/` → SSR, `/api/` → Go, `/*` → SSR |

**Important**: Old `shop-api-golang/docker-compose.yaml` still exists and maps Postgres to the same port (`55000`). Don't delete it, but be aware of port conflict when running both.

---

## Auth system (cross-cutting)

| Layer | What | How |
|-------|------|-----|
| **Better Auth** (SSR) | User sign-in/sign-up, session management | `src/server/auth.ts` — drizzleAdapter with emailAndPassword |
| **Angular client** | Login UI, auth guards, API calls with cookie | `auth.service.ts`, `auth.guard.ts`, `api-base-url.interceptor.ts` |
| **Go middleware** | Validates session for protected routes | Middleware reads cookie/Bearer header, splits on `.`, queries session table |
| **Swagger** | Bearer token for API docs | User pastes `{token}` from sign-in response via Authorize button |
| **Session cookie** | `better-auth.session_token` | Set by Better Auth, sent automatically with `withCredentials: true` |
| **Cookie format** | `{32-char-id}.{hmac-signature}` | Go middleware splits on `.`, uses only `id` part for DB query |

---

## Critical Context

- **Session table columns** are camelCase (`userId`, `expiresAt`) — Go middleware SQL uses quoted identifiers (`"userId"`, `"expiresAt"`).
- **Cookie split** on `.` — Better Auth signed cookie format is `{token-id}.{signature}`. DB stores only the ID part.
- **Build requires `--legacy-peer-deps`** because `better-auth` → `sveltekit` → `vite@8` conflicts with Angular's `vite@7`.
- **SSR `init()`** calls `authClient.getSession()` — fails gracefully on server (no cookie) via try/catch.
- **restore.sql** now includes auth tables at the end (before `-- PostgreSQL database dump complete`). Single file restores full DB.
- **Swagger UI** at `/api/swagger/` — Authorize with `Bearer <token>` from sign-in response.
- **Go handlers** can read `c.GetString("userID")` to filter data by authenticated user.
- **`.env`** for Angular SSR lives in `shop-ui-angular/.env` — loaded via `import 'dotenv/config'` at server startup.

<!-- pane-agent-context:start -->
## Pane

The developer is using Pane for this repository. Pane can manage saved repositories and create user-visible panes with terminal-backed tools for planning, discussion, implementation, and review work.

Start with `runpane doctor --json` before taking Pane actions. Use it to understand wrapper/runtime details, daemon reachability, and the next safe commands.

Use `runpane agent-context --json` for full Pane CLI context. Use `runpane agent-context --command "panels wait" --json` or another command name for detailed schema only when needed.

Default to context-safe validation: after creating panes or sending terminal input, run `runpane panels wait` or `runpane panels screen` before reporting success. Prefer `runpane panels submit` for normal text plus Enter; use `runpane panels input` only for exact bytes such as Ctrl-C or escape sequences.

Common commands:
- `runpane doctor --json`
- `runpane agent-context --json`
- `runpane repos list --json`
- `runpane repos add --path <repo> --yes --json`
- `runpane agents doctor --agent codex --repo active --json`
- `runpane panes create --repo active --name <name> --agent codex --prompt "<task>" --wait-ready --yes --json`
- `runpane panels list --pane <pane-id> --json`
- `runpane panels screen --panel <panel-id> --limit 80 --json`
- `runpane panels wait --panel <panel-id> --for ready --timeout-ms 30000 --json`
- `runpane panels submit --panel <panel-id> --text "<answer>" --yes --json`
- `runpane panels input --panel <panel-id> --input-file <path|-> --yes --json`

WSL note: if `runpane doctor --json` cannot find `/tmp/pane-daemon.../daemon.sock` or `runpane` resolves to a broken Windows shim, Pane may be running on Windows. Try `powershell.exe -NoProfile -Command 'Set-Location $env:TEMP; runpane doctor --json'`, then create panes through the same PowerShell form using the saved WSL repo name or id. Use `runpane agents doctor --agent codex --repo <selector> --json` to diagnose the repo environment Pane will actually use.
<!-- pane-agent-context:end -->
