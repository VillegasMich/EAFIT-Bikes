## Why

The `geolocalization` microservice has been initialized as a Rust project but lacks any application code. A working Axum HTTP server with health-check and graceful shutdown is needed as the foundation before any domain endpoints can be built.

## What Changes

- Add `axum`, `tokio`, `sqlx`, `dotenv`, and related dependencies to `Cargo.toml`
- Implement the main entry point (`src/main.rs`) with Axum server startup and graceful shutdown
- Add a `GET /health` endpoint to confirm the service is running
- Wire environment variables (`DATABASE_URL`, `APP_PORT`) at startup
- Add a `docker-compose.yml` and `.env.example` to run the service with PostgreSQL/PostGIS
- Add database migration scaffolding (`migrations/`) with the `bicycles_location` table

## Capabilities

### New Capabilities

- `http-server`: Axum HTTP server that binds on `APP_PORT`, serves registered routes, and shuts down gracefully on SIGTERM/SIGINT.
- `health-check`: `GET /health` endpoint returning `200 OK` to confirm the service is alive.
- `database-connection`: SQLx connection pool initialised from `DATABASE_URL` and made available to route handlers via Axum state.
- `db-migration`: Initial SQL migration that creates the `bicycles_location` table with the PostGIS `GEOGRAPHY(POINT, 4326)` column and GIST index.

### Modified Capabilities

## Impact

- `Cargo.toml` / `Cargo.lock`: new dependencies (`axum`, `tokio`, `sqlx`, `dotenvy`, `uuid`, `serde`, `serde_json`)
- `src/main.rs`: created from scratch
- `migrations/`: new directory with first migration file
- `docker-compose.yml`, `.env.example`: created for local development
