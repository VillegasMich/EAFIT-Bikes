## Why

The development and demo workflow needs a way to simulate realistic bicycle movement across all existing entries in the database. Currently, the seed binary inserts static positions or appends new ones via `--live`, but there is no tool to make *existing* rows move over time. A continuous movement simulator makes it easy to visually verify the frontend map, test real-time update flows, and demo the platform without real GPS hardware.

## What Changes

- Add a new Rust binary (`src/bin/mover.rs`) that runs as a long-lived process.
- Every 1 second, the binary reads all distinct `bicycle_id` values and their latest position from `bicycles_location`.
- For each bicycle, it inserts a new row with coordinates slightly offset from the current position (random small delta), simulating movement.
- The process handles new bicycles appearing in the database at any time — each tick re-queries the current set of bicycles.
- Graceful shutdown on `Ctrl+C`.

## Capabilities

### New Capabilities
- `position-mover`: Continuous binary that periodically nudges all existing bicycles to nearby random positions, supporting dynamically appearing entries.

### Modified Capabilities

(none)

## Impact

- **Code**: New binary at `src/bin/mover.rs`; new entry in `Cargo.toml` `[[bin]]`.
- **Database**: Read-heavy (one query per tick to fetch latest positions) + write-heavy (one insert per bicycle per tick). No schema changes.
- **Dependencies**: Uses existing crates (`sqlx`, `tokio`, `chrono`, `tracing`, `rand` for random offsets). `rand` may need to be added to `Cargo.toml`.
- **Docker / Compose**: Optionally add a `mover` service profile, but not required — can be run with `cargo run --bin mover`.
