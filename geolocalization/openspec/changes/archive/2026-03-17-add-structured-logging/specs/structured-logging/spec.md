## ADDED Requirements

### Requirement: Tracing subscriber initialization
The service SHALL initialize a `tracing-subscriber` `FmtSubscriber` with an `EnvFilter` before any other work in `main()`. The filter SHALL read the `RUST_LOG` environment variable. If `RUST_LOG` is not set, the default filter level SHALL be `error`.

#### Scenario: Default log level when RUST_LOG is unset
- **WHEN** the service starts without `RUST_LOG` set
- **THEN** only `error`-level events are emitted to stderr

#### Scenario: Custom log level via RUST_LOG
- **WHEN** the service starts with `RUST_LOG=info`
- **THEN** events at `info` level and above are emitted to stderr

#### Scenario: Scoped log level via RUST_LOG
- **WHEN** the service starts with `RUST_LOG=geolocalization=debug`
- **THEN** only events from the `geolocalization` crate at `debug` and above are emitted

### Requirement: Log level conventions
All code in the service SHALL use `tracing` macros (`error!`, `warn!`, `info!`, `debug!`, `trace!`) instead of `println!()` or `eprintln!()`. The following conventions SHALL apply:
- `error!`: Unrecoverable failures (migration failure, bind failure)
- `warn!`: Degraded state (DB unavailable, skipped migrations)
- `info!`: Lifecycle events (server started, migrations applied, shutdown)
- `debug!`: Per-request details, query results
- `trace!`: Fine-grained internal state

#### Scenario: No eprintln or println in production code
- **WHEN** the codebase is reviewed
- **THEN** no `eprintln!()` or `println!()` calls exist in `src/`

### Requirement: RUST_LOG documented in environment
The `RUST_LOG` environment variable SHALL be documented in `.env.example` and `CLAUDE.md` with its default value and usage.

#### Scenario: .env.example includes RUST_LOG
- **WHEN** a developer reads `.env.example`
- **THEN** they see `RUST_LOG` with a comment explaining the default is `error`
