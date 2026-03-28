## Why

The service currently uses `eprintln!()` for all output, providing no log levels, timestamps, or structured context. This makes it impossible to filter noise in production (e.g., see only errors) or correlate logs with specific requests. Adding structured logging with `RUST_LOG` support gives operators control over verbosity and prepares the service for observability as more endpoints are added.

## What Changes

- Add `tracing` and `tracing-subscriber` crates for structured, leveled logging
- Initialize the tracing subscriber early in `main()` with `RUST_LOG` env var support, defaulting to `error` level
- Replace all `eprintln!()` calls in `main.rs` with appropriate `tracing` macros (`info!`, `warn!`, `error!`)
- Add request/response logging via `tower-http`'s `TraceLayer` middleware on the router
- Add logging to the health check handler and error response path
- Update `CLAUDE.md` to require logging in all future code changes
- Update `.env.example` with `RUST_LOG` variable documentation

## Capabilities

### New Capabilities
- `structured-logging`: Leveled, filterable logging via `tracing` with `RUST_LOG` env var control, defaulting to errors-only

### Modified Capabilities
- `http-server`: Add request/response trace logging middleware to the router
- `health-check`: Add trace-level logging to the health check handler
- `database-connection`: Replace `eprintln!` with structured log events for pool initialization

## Impact

- **Dependencies**: New crates — `tracing`, `tracing-subscriber` (with `env-filter` feature), `tower-http` (with `trace` feature)
- **Code**: `main.rs` (subscriber init, replace eprintln), `router.rs` (TraceLayer), `routes/health.rs` (handler logging), `errors.rs` (error logging)
- **Configuration**: New `RUST_LOG` env var; `.env.example` and `CLAUDE.md` updated
- **API**: No changes to API contract or response shapes
- **CI**: No changes needed — existing `cargo clippy` and `cargo test` cover new code
