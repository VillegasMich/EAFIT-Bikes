## Context

The geolocalization service currently uses `eprintln!()` for all diagnostic output. There is no way to filter log verbosity, add timestamps, or correlate logs with requests. As the service grows beyond the `/health` endpoint to full CRUD on `/locations`, structured logging becomes essential for debugging and operations.

The Rust ecosystem has converged on the `tracing` crate as the standard for structured, async-aware diagnostics. Axum and SQLx both emit `tracing` spans/events natively when a subscriber is present, giving us instrumentation for free.

## Goals / Non-Goals

**Goals:**
- Structured, leveled logging controlled by `RUST_LOG` env var
- Default log level of `error` so production is quiet unless configured otherwise
- Replace all `eprintln!()` with `tracing` macros at appropriate levels
- HTTP request/response logging via `tower-http::trace::TraceLayer`
- Establish a convention for logging in future code

**Non-Goals:**
- JSON-formatted log output (plain text is sufficient for now)
- Distributed tracing / OpenTelemetry integration
- Log aggregation or shipping to external systems
- Custom log formatting beyond tracing-subscriber defaults
- Metrics or performance instrumentation

## Decisions

### 1. Use `tracing` + `tracing-subscriber` over `log` + `env_logger`

**Choice**: `tracing` ecosystem

**Rationale**: `tracing` is span-aware and designed for async Rust. Axum, tower-http, and SQLx all instrument with `tracing` natively — using `log` would miss these events or require a compatibility bridge. `tracing-subscriber`'s `EnvFilter` reads `RUST_LOG` identically to `env_logger`, so the UX is the same.

**Alternative**: `log` + `env_logger` — simpler but lacks span context and doesn't integrate with Axum/tower-http middleware natively.

### 2. Use `tower-http::trace::TraceLayer` for request logging

**Choice**: Add `TraceLayer` to the Axum router.

**Rationale**: `TraceLayer` is the idiomatic way to log HTTP requests in tower/Axum. It automatically creates a span per request with method, URI, and status, and logs at configurable levels. No custom middleware needed.

**Alternative**: Custom Axum middleware — more code to maintain with no benefit over the well-tested `TraceLayer`.

### 3. Default to `error` level

**Choice**: When `RUST_LOG` is not set, only `error`-level events are emitted.

**Rationale**: The user explicitly requested quiet defaults. Operators can set `RUST_LOG=info` or `RUST_LOG=geolocalization=debug` to increase verbosity.

### 4. Log level guidelines for the codebase

| Level | Use for |
|-------|---------|
| `error!` | Unrecoverable failures (migration failure, listen bind failure) |
| `warn!` | Degraded state (DB unavailable, skipped migrations) |
| `info!` | Lifecycle events (server started, migrations applied, shutdown) |
| `debug!` | Per-request details, query results |
| `trace!` | Fine-grained internal state |

## Risks / Trade-offs

- **[Minimal risk] Dependency size** — `tracing` and `tracing-subscriber` are lightweight and widely used in the Rust ecosystem. `tower-http` is already an indirect dependency via Axum. → No mitigation needed.
- **[Low risk] Log noise from dependencies** — Libraries like `hyper` and `sqlx` emit their own tracing events. → Mitigated by the `error`-only default; operators use `RUST_LOG=geolocalization=info` to scope verbosity.
- **[Low risk] Test output noise** — Tracing subscriber in tests may produce unwanted output. → Tests can use `tracing_subscriber::fmt().with_test_writer()` or simply not initialize a subscriber (events are silently dropped).
