## Context

The repository was bootstrapped with `cargo new` and contains only a minimal `Cargo.toml` and placeholder `src/main.rs`. No HTTP server, no database connection, and no Docker configuration exist yet. This design covers the minimal wiring needed to produce a running, testable Axum service that subsequent PRs can extend with domain endpoints.

All technology choices (Rust, Axum, Tokio, PostgreSQL + PostGIS, SQLx) are already locked in by ADR-01 and ADR-02. This design operates within those constraints.

## Goals / Non-Goals

**Goals:**
- Produce a `cargo build`-clean binary that starts an Axum server and listens on `APP_PORT`
- Expose a `GET /health` liveness probe
- Initialize a SQLx connection pool from `DATABASE_URL` and attach it to Axum application state
- Run `sqlx::migrate!()` on startup to apply pending migrations
- Shutdown gracefully on SIGTERM/SIGINT (Tokio signal handling)
- Ship a `docker-compose.yml` + `.env.example` so developers can run the full stack locally

**Non-Goals:**
- Domain endpoints (`/locations`) — those belong to a follow-on change
- Authentication or authorization
- Observability beyond the health endpoint (metrics, tracing)

## Decisions

### D1 — Modular `src/` layout from the start

Even though only the health endpoint exists today, the project adopts the full module structure immediately so that every future feature lands in the right place without requiring a disruptive reorganisation later. The layout is:

```
src/
├── main.rs          # entry point: env, pool, migrations, server startup
├── router.rs        # builds and returns the top-level axum::Router
├── state.rs         # AppState definition (Option<PgPool>, shared config)
├── routes/
│   mod.rs           # re-exports all route sub-modules
│   health.rs        # GET /health handler
└── errors.rs        # shared error types and IntoResponse impls (placeholder)
```

`main.rs` is kept thin — it reads config, creates the pool, calls `router::build(state)`, and starts the server. No handler logic lives in `main.rs`.

**Alternative considered**: Keep everything in `main.rs` until the service grows.
**Why rejected**: The cost of setting up the structure now is one extra file; the cost of refactoring later is touching every handler and updating every import across multiple PRs.

---

### D2 — `dotenvy` for environment loading

`dotenvy` (the maintained fork of `dotenv`) loads `.env` at startup in development. In production the variables come from the container environment and `.env` is absent — `dotenvy::dotenv().ok()` silently ignores this.

**Alternative considered**: `config` crate with layered config files.
**Why rejected**: Overkill for two variables; adds a dependency not justified by current requirements.

---

### D3 — SQLx compile-time query verification disabled for initial scaffold

`sqlx::migrate!()` is used at runtime. Compile-time query checking (`sqlx prepare`) requires a live database during CI and adds setup friction. Macros will be adopted once the full CI pipeline (with a PostGIS container) is in place.

**Alternative considered**: Enable `DATABASE_URL` at compile time with `sqlx prepare`.
**Why rejected**: Blocks compilation on developer machines without a running database.

---

### D4 — Graceful shutdown via `tokio::signal`

`axum::serve(...).with_graceful_shutdown(shutdown_signal())` is used with a future that resolves on `SIGINT` or `SIGTERM`. This ensures in-flight requests complete before the process exits, which is important in Kubernetes rolling deploys.

## Risks / Trade-offs

- **Migration lock contention** → The service acquires an advisory lock during `sqlx::migrate!()`. If multiple replicas start simultaneously they will queue on the lock. Mitigation: run migrations as a separate init-container in production.
- **Degraded-mode silent failures** → When the pool is `None`, every DB-dependent endpoint returns 503. If the root cause (bad `DATABASE_URL`, network partition) persists, all data endpoints are dead but the service appears alive to liveness probes. Operators MUST monitor the `"db":"unavailable"` field in `GET /health` or set up an alerting rule on sustained 503 rates.
