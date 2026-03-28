## Why

The geolocalization service has no easy way to populate the database with realistic test data. Developers and QA need to verify API behavior and time-series queries against multiple bicycles moving through real-world-like routes over time. A factory/seed binary will let anyone spin up the stack and immediately see lifelike data without manual SQL. Additionally, the codebase currently lacks a Rust struct model representing the `bicycles_location` table — the seed binary is the natural moment to introduce it.

## What Changes

- Introduce a `BicycleLocation` Rust struct model representing rows in the `bicycles_location` table, usable by the main service and the seed binary.
- Add a Rust binary target (`cargo run --bin seed`) that connects directly to PostgreSQL/PostGIS and inserts seed data via SQLx.
- Each bicycle gets a sequence of location entries at different timestamps, simulating movement along plausible routes around the EAFIT campus in Medellín.
- The seed binary is idempotent — re-running it resets seed data without duplicating rows.
- **Note:** The REST API endpoints are not yet implemented. The seed binary inserts data directly into the database, bypassing any API layer.

## Capabilities

### New Capabilities
- `seed-factory`: Rust binary that populates the database with simulated bicycle movement data (multiple bikes, multiple timestamped positions per bike) via direct SQL inserts.

### Modified Capabilities
<!-- No existing spec-level requirements are changing. -->

## Impact

- **New files**: `src/bin/seed.rs` (binary target), model struct in `src/models/` or `src/model.rs`.
- **Database**: writes rows to `bicycles_location` via direct SQL — no schema changes.
- **API**: no changes — endpoints do not exist yet.
- **Dependencies**: uses existing `sqlx`, `uuid`, `tokio` crates already in `Cargo.toml`; no new production dependencies.
