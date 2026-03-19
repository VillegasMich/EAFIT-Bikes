## Why

The seed binary currently loads static test data into the database, but there is no way to simulate real-time bicycle movement. A live ingestor mode would continuously insert new location rows (one per bicycle per second), letting consumers of the `/locations` endpoint observe bicycles "moving" in real time — essential for developing and testing any real-time UI or downstream service.

## What Changes

- Add a CLI argument (`--live`) to the existing `seed` binary that switches it into a continuous ingestor mode.
- In live mode, the binary inserts a new location row for every seeded bicycle once per second, advancing each bicycle along its predefined route with interpolated waypoints.
- The binary loops through each route indefinitely (wrapping back to the start) so movement never stops until the process is terminated.
- The existing one-shot seed behavior remains the default when `--live` is not passed.

## Capabilities

### New Capabilities
- `live-ingestor`: CLI flag and runtime loop that continuously inserts interpolated GPS positions for all bicycles at a one-second cadence.

### Modified Capabilities
- `seed-factory`: The seed binary gains a new CLI argument (`--live`) and the `main` function is restructured to branch between one-shot seed and live ingestor modes.

## Impact

- **Code**: `src/bin/seed.rs` — new dependency on `clap` for argument parsing; new async loop and timing logic.
- **Dependencies**: Adds `clap` crate with `derive` feature.
- **Database**: No schema changes; the live mode inserts into the existing `bicycles_location` table.
- **API**: No endpoint changes; consumers simply see more recent rows appearing.
