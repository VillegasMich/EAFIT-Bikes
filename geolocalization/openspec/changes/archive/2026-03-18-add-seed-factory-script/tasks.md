## 1. Model Struct

- [x] 1.1 Create `src/models.rs` (or `src/models/bicycle_location.rs`) with a `BicycleLocation` struct: `id: Uuid`, `latitude: f64`, `longitude: f64`, `updated_at: DateTime<Utc>`, deriving `sqlx::FromRow`
- [x] 1.2 Wire the models module into `src/lib.rs` or `src/main.rs` so it is accessible from both the service and the seed binary

## 2. Seed Binary Setup

- [x] 2.1 Add a `[[bin]]` target in `Cargo.toml` for `seed` pointing to `src/bin/seed.rs`
- [x] 2.2 Create `src/bin/seed.rs` with a `#[tokio::main]` entrypoint that reads `DATABASE_URL` (from env or `.env`) and creates a SQLx connection pool
- [x] 2.3 Implement database connectivity check with a clear error message on failure

## 3. Route Data

- [x] 3.1 Define the fixed seed UUIDs (at least 4 bicycles) using the `00000000-0000-4000-a000-*` pattern
- [x] 3.2 Define GPS waypoint routes for each bicycle near the EAFIT campus area (lat ~6.20, lon ~-75.57)
- [x] 3.3 Implement waypoint interpolation to generate 10–20 positions per bicycle with consecutive points ≤500m apart and incrementing `updated_at` timestamps

## 4. Core Seed Logic

- [x] 4.1 Implement idempotency: DELETE existing rows for the seed UUIDs before inserting
- [x] 4.2 Implement INSERT logic using SQLx to write each bicycle's positions into `bicycles_location` with `ST_SetSRID(ST_MakePoint(lon, lat), 4326)` and explicit `updated_at` values

## 5. User Feedback

- [x] 5.1 Add progress output (via `tracing` macros) showing which bicycle is being seeded and position count
- [x] 5.2 Print a final summary with total bicycles seeded and total positions inserted

## 6. Documentation

- [x] 6.1 Update README.md with instructions on how to run the seed binary (`cargo run --bin seed`)
- [x] 6.2 Review whether CLAUDE.md needs updates (new binary target, model struct)
- [x] 6.3 Add a README.md alongside the seed binary (`src/bin/README.md`) documenting its purpose, usage, prerequisites (database must be running), and the seed data it generates
