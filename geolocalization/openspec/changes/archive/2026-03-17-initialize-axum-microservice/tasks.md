## 1. Dependencies & Project Setup

- [x] 1.1 Add `axum`, `tokio` (full features), `dotenvy`, `sqlx` (with `postgres`, `uuid`, `chrono`, `runtime-tokio-native-tls`), `serde`, `serde_json`, and `uuid` (with `v4`) to `Cargo.toml`
- [x] 1.2 Copy `.env.example` with `DATABASE_URL` and `APP_PORT` placeholders
- [x] 1.3 Add `docker-compose.yml` with a `postgis/postgis` service and the `geolocalization` app service

## 2. Database Migration

- [x] 2.1 Create `migrations/` directory and add the initial migration file (`0001_create_bicycles_location.sql`)
- [x] 2.2 Write the `CREATE TABLE bicycles_location` DDL with UUID PK, `GEOGRAPHY(POINT, 4326)` column, `TIMESTAMPTZ updated_at`, and a GIST index

## 3. Application Wiring

- [x] 3.1 Create `src/state.rs`: define `AppState` struct holding `Option<PgPool>` and derive `Clone`
- [x] 3.2 Create `src/errors.rs`: add `AppError` enum with at least a `DatabaseUnavailable` variant that serialises to `503` + `{"error":"database unavailable"}`
- [x] 3.3 Create `src/routes/mod.rs`: declare the `health` sub-module and re-export its router function
- [x] 3.4 Create `src/router.rs`: implement `pub fn build(state: AppState) -> Router` that nests all route modules (starting with `routes::health`)
- [x] 3.5 Implement `src/main.rs`: load `.env`, read `APP_PORT`; attempt `PgPool` creation from `DATABASE_URL` — on failure log a warning and use `None`; if pool is `Some` attempt `sqlx::migrate!()` — on failure log an error and downgrade pool to `None`; call `router::build(state)`, bind `TcpListener` on `0.0.0.0:<APP_PORT>`, start `axum::serve(...).with_graceful_shutdown(shutdown_signal())`

## 4. Health Check Endpoint

- [x] 4.1 Create `src/routes/health.rs`: implement `GET /health` handler that reads `Option<PgPool>` from state and returns `{"status":"ok","db":"connected"}` or `{"status":"ok","db":"unavailable"}` accordingly (always `200`), and a `pub fn router() -> Router` that registers it
- [x] 4.2 Verify `cargo test` passes (add an integration test or doc-test that confirms the handler returns 200)

## 5. Graceful Shutdown

- [x] 5.1 Implement `shutdown_signal()` async function using `tokio::signal` that resolves on `SIGINT` or `SIGTERM`
- [x] 5.2 Wire shutdown signal into `axum::serve(...).with_graceful_shutdown(...)`

## 6. Validation & Cleanup

- [x] 6.1 Run `cargo check` and resolve all compile errors
- [x] 6.2 Run `cargo clippy` and fix all warnings
- [x] 6.3 Run `cargo fmt`
- [x] 6.4 Run `docker compose up --build` and confirm `GET /health` returns `200`

## 7. Documentation

- [x] 7.1 Update `README.md` with setup instructions (prerequisites, `.env` setup, `docker compose up --build`, `GET /health` example)
- [x] 7.2 Update `CLAUDE.md` if any environment variables, commands, or architectural notes have changed
