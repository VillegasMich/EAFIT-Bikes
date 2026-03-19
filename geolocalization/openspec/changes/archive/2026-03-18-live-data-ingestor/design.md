## Context

The `seed` binary (`src/bin/seed.rs`) currently performs a one-shot insertion of static GPS data for 4 bicycles near EAFIT campus. Each bicycle gets ~15 interpolated positions with timestamps 30 seconds apart. This is useful for populating initial test data but does not simulate real-time movement — a consumer querying the API sees a fixed snapshot rather than evolving positions.

The binary already has route definitions, interpolation logic, and database connectivity. The live ingestor mode can reuse all of this infrastructure.

## Goals / Non-Goals

**Goals:**
- Add a `--live` CLI flag to the seed binary that enables a continuous ingestor mode.
- In live mode, insert one new location row per bicycle per second, advancing each along its route.
- Routes loop indefinitely so movement never stops.
- Keep the existing one-shot seed as the default behavior (no flag = current behavior).

**Non-Goals:**
- No WebSocket or push-based notification to consumers — they poll the REST API.
- No configurable tick rate beyond the fixed 1-second interval (can be added later if needed).
- No new database tables or schema changes.
- No new API endpoints.

## Decisions

### 1. Use `clap` with derive for CLI argument parsing

**Choice**: Add `clap` with the `derive` feature to parse a `--live` boolean flag.

**Rationale**: `clap` is the Rust ecosystem standard, provides `--help` for free, and derive-based parsing keeps the code declarative. The seed binary is a standalone tool so the dependency cost is negligible.

**Alternatives considered**:
- Manual `std::env::args()` parsing — fragile, no `--help`, harder to extend.
- `argh` — lighter but less ecosystem support and fewer examples.

### 2. Reuse existing route definitions with modular index tracking

**Choice**: In live mode, maintain a per-bicycle index into the interpolated route. Each tick advances the index by 1, wrapping at the end to create a continuous loop.

**Rationale**: The routes and interpolation logic already exist. Wrapping the index is trivial and produces smooth, repeating movement.

### 3. Use `tokio::time::interval` for the 1-second tick

**Choice**: Use `tokio::time::interval(Duration::from_secs(1))` to drive the insertion loop.

**Rationale**: Already on the Tokio runtime. `interval` compensates for processing time drift, keeping ticks consistent.

### 4. Insert all bicycles in each tick iteration

**Choice**: Each second, insert one new row for every bicycle in a single loop iteration (4 inserts per tick).

**Rationale**: 4 inserts per second is negligible load. Keeping it simple avoids the complexity of per-bicycle tasks or batch inserts.

### 5. Graceful shutdown on Ctrl+C

**Choice**: Use `tokio::signal::ctrl_c()` to detect SIGINT and exit the loop cleanly.

**Rationale**: The binary runs indefinitely; users expect Ctrl+C to stop it gracefully with a summary log.

## Risks / Trade-offs

- **Unbounded row growth** → The live mode inserts rows indefinitely. Users should be aware that long runs accumulate data. Mitigation: this is a dev/test tool; document the behavior.
- **Clock drift under load** → If DB inserts take >1s, `tokio::time::interval` will fire immediately to catch up, creating bursts. Mitigation: 4 simple inserts should complete in <10ms; not a realistic concern for dev usage.
- **No cleanup on exit** → Live-inserted rows are not automatically cleaned. Mitigation: re-running `cargo run --bin seed` (without `--live`) deletes and re-seeds the data for the fixed UUIDs.
