## 1. Dependencies

- [x] 1.1 Add `rand` crate to `Cargo.toml` dependencies

## 2. Core Implementation

- [x] 2.1 Create `src/bin/mover.rs` with main function: dotenv, tracing init, clap (no extra args for now), DATABASE_URL read, pool connection, migrations
- [x] 2.2 Implement the tick loop: every 1 second, query all distinct bicycle_id with their latest position, apply random offset (±0.0001–0.0005°), clamp coordinates, insert new rows
- [x] 2.3 Implement graceful Ctrl+C shutdown with summary logging (total positions inserted, elapsed time)
- [x] 2.4 Add structured logging: info on startup, per-tick summary, debug per-bicycle, info on shutdown

## 3. Build Verification

- [x] 3.1 Run `cargo check` and `cargo clippy` to ensure the binary compiles without warnings
- [x] 3.2 Run `cargo test` to ensure no existing tests are broken

## 4. Documentation

- [x] 4.1 Update CLAUDE.md commands section to document `cargo run --bin mover`
- [x] 4.2 Update README.md if it contains usage instructions for the seed/dev tools
