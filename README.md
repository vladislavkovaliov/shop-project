# shop-project

Monorepo with three e-commerce services:

| Service | Description | Stack |
|---------|-------------|-------|
| `shop-ui-angular/` | Frontend + SSR | Angular 21, Express, Tailwind v4, Better Auth |
| `shop-api-golang/` | REST API | Go 1.25, Gin, PostgreSQL, Kafka, RabbitMQ |
| `shop-graphql-nestjs/` | GraphQL API | NestJS, Apollo, TypeORM, PostgreSQL |

Infrastructure: PostgreSQL, Redpanda (Kafka), RabbitMQ, nginx.

---

## Quick Start

### 1. Start infrastructure

```bash
docker compose up -d postgres redpanda rabbitmq
```

Postgres boots with `shop-api-golang/restore.sql` — all tables and seed data are created automatically.

Links:
- **Postgres**: `localhost:55000` (user `postgres`, password `password`, db `shop`)
- **Redpanda Console**: http://localhost:8082
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### 2. Start services for development

Each service runs separately in its own terminal.

#### Go REST API (`shop-api-golang/`)

```bash
cd shop-api-golang
air              # hot-reload on :8080
```

Swagger UI: http://localhost:8080/api/swagger/

#### GraphQL API (`shop-graphql-nestjs/`)

```bash
cd shop-graphql-nestjs
npm install
npm run start:dev    # port :3000
```

Apollo Studio: http://localhost:3000/graphql

#### Angular frontend (`shop-ui-angular/`)

Requires `.env` in `shop-ui-angular/`:

```
DATABASE_URL="postgres://postgres:password@localhost:55000/shop"
AUTH_SECRET="fd589bf745dd7796d65a5fb7d5a18e5069bf58de5070cda1c7569ab087635359"
BETTER_AUTH_URL="http://localhost:4000"
API_URL="http://localhost:8080"
```

```bash
cd shop-ui-angular
npm install --legacy-peer-deps
npm run dev    # SSR :4000 + ng serve :4200
```

---

## Full Docker Compose

```bash
docker compose up -d --build
```

Starts all services:

| Service | Ports | Description |
|---------|-------|-------------|
| `postgres` | `55000:5432` | PostgreSQL |
| `redpanda` | `9092`, `8081` | Kafka-compatible |
| `console` | `8082:8080` | Redpanda Console UI |
| `rabbitmq` | `5672`, `15672` | RabbitMQ |
| `graphql` | `3000` | GraphQL API |
| `api` | `8080` | Go REST API |
| `ssr` | `4000` (internal) | Angular SSR |
| `nginx` | `80:80` | Reverse proxy |

After startup:

| URL | What |
|-----|------|
| http://localhost | Frontend (via nginx) |
| http://localhost:8080/api/swagger/ | Swagger (Go API) |
| http://localhost:3000/graphql | Apollo Studio (GraphQL) |
| http://localhost:8082 | Redpanda Console |
| http://localhost:15672 | RabbitMQ Management |

---

## Architecture

### REST API (Go)

- **Clean Architecture**: domain → repository → service → handler
- **Auth**: cookie `better-auth.session_token` → Go middleware validates against `session` table
- **Swagger**: via swaggo, annotations in `cmd/api/main.go`

### GraphQL API (NestJS)

- **Standalone modules** — each module registers its own TypeORM entities
- **Mixed queries**: TypeORM `find`/`count` for simple queries, raw SQL via `@InjectDataSource()` for complex joins
- **Auth**: `@UseGuards(AuthGuard)` per-method; public queries have no guard

### Frontend (Angular)

- **Standalone components**, SSR via `@angular/ssr` + Express
- **Auth**: Better Auth (SSR), Angular `auth.service.ts` with `authClient.getSession()`
- **Build**: `npm run build` with `--legacy-peer-deps`

### Shared SQL

PostgreSQL functions and views shared between Go and NestJS live in `shop-api-golang/restore.sql`. Use `tools/review/review sql` to find duplicate SQL across projects.

---

## Requirements

- Go 1.25+
- Node.js 22+
- npm 11+
- Docker + Docker Compose

---

## Environment Variables

| Variable | Used by | Default |
|----------|---------|---------|
| `DATABASE_URL` | Go, NestJS, Angular SSR | `postgres://postgres:password@localhost:55000/shop` |
| `PORT` | Go, NestJS | `8080` / `3000` |
| `KAFKA_BROKERS` | Go | `redpanda:9092` |
| `RABBITMQ_URL` | Go | `amqp://guest:guest@localhost:5672` |
| `AUTH_SECRET` | Angular SSR | — |
| `BETTER_AUTH_URL` | Angular SSR | `http://localhost:4000` |
| `API_URL` | Angular SSR | `http://localhost:8080` |

---

## tools/review

Go CLI for code review and SQL extraction. See `tools/review/main.go` for details.

```bash
cd tools/review
go build -o review .
./review              # review staged changes
./review sql          # find duplicate SQL between Go and NestJS
./review --help       # flags: --model, --ollama-url
```
