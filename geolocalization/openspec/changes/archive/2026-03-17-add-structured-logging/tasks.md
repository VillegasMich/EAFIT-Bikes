## 1. Dependencies

- [x] 1.1 Add `tracing` and `tracing-subscriber` (with `env-filter` and `fmt` features) to `Cargo.toml`
- [x] 1.2 Add `tower-http` (with `trace` feature) to `Cargo.toml`

## 2. Subscriber Initialization

- [x] 2.1 Initialize `tracing_subscriber::fmt()` with `EnvFilter` in `main()` before any other work, defaulting to `error` when `RUST_LOG` is unset

## 3. Replace eprintln with tracing macros

- [x] 3.1 Replace all `eprintln!()` calls in `main.rs` with appropriate `tracing` macros (`info!`, `warn!`, `error!`) per the log level conventions
- [x] 3.2 Add `debug!` logging to the health check handler in `routes/health.rs` for DB connectivity result
- [x] 3.3 Add `error!` logging in `errors.rs` when building error responses

## 4. HTTP Request Tracing

- [x] 4.1 Add `tower_http::trace::TraceLayer` middleware to the router in `router.rs`

## 5. Configuration & Documentation

- [x] 5.1 Add `RUST_LOG` to `.env.example` with a comment explaining the default
- [x] 5.2 Update `CLAUDE.md` — add `RUST_LOG` to the Environment Variables table and add a logging convention section requiring `tracing` macros in all future code
- [x] 5.3 Update `README.md` to document the `RUST_LOG` environment variable

## 6. Verification

- [x] 6.1 Run `cargo check` and `cargo clippy` to confirm no warnings
- [x] 6.2 Run `cargo test` to confirm existing tests still pass
- [x] 6.3 Verify no `eprintln!()` or `println!()` calls remain in `src/`
