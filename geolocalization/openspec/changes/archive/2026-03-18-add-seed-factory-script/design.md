## Context

The geolocalization service stores bicycle GPS coordinates in a PostGIS-backed PostgreSQL database. The REST API endpoints are **not yet implemented** — only the database schema and infrastructure (Docker Compose, migrations) exist. There is currently no Rust struct model representing the `bicycles_location` table, and no automated way to populate the database with test data.

Because there are no API endpoints to call, the seed tool must insert data directly into the database using SQLx.

## Goals / Non-Goals

**Goals:**
- Define a `BicycleLocation` Rust struct that maps to the `bicycles_location` table, reusable by the future API handlers and the seed binary.
- Provide a Rust binary target (`cargo run --bin seed`) that connects to PostgreSQL and inserts multiple bicycles with realistic GPS routes around the EAFIT campus in Medellín.
- Each bicycle should have multiple location entries at different timestamps to simulate movement over time.
- The binary should be idempotent — safe to re-run without creating duplicates.

**Non-Goals:**
- Implementing REST API endpoints (that is a separate change).
- Real-time streaming simulation (WebSocket/SSE push) — this is a one-shot data loader.
- Generating thousands of bicycles or stress-testing the database.
- Modifying the database schema.

## Decisions

### Decision 1: Rust binary with direct database inserts

**Choice:** A Rust binary target (`src/bin/seed.rs`) that uses SQLx to insert rows directly into `bicycles_location`.

**Alternatives considered:**
- *Python script calling a REST API* — The API endpoints don't exist yet, so this is not viable.
- *Raw SQL seed file* — Less flexible for generating interpolated routes; harder to keep idempotent.
- *Shell script with psql* — Verbose, poor error handling, harder to generate coordinate sequences programmatically.

**Rationale:** A Rust binary reuses the project's existing SQLx and Tokio dependencies, shares the `BicycleLocation` model with the main service, and needs no additional toolchain. Direct DB access is the only option since endpoints aren't built yet.

### Decision 2: Introduce a `BicycleLocation` model struct

**Choice:** Define a struct in `src/models.rs` (or `src/models/bicycle_location.rs`) with fields matching the `bicycles_location` table: `id: Uuid`, `latitude: f64`, `longitude: f64`, `updated_at: DateTime<Utc>`. Derive `sqlx::FromRow` for query mapping.

**Rationale:** The struct is needed by the seed binary and will be reused by future API handlers. Introducing it now avoids duplication later. Latitude and longitude are stored as separate `f64` fields in the struct even though PostGIS stores them as a single `GEOGRAPHY(POINT)` — the SQL queries handle the conversion via `ST_Y`/`ST_X` and `ST_SetSRID(ST_MakePoint(...))`.

### Decision 3: Predefined routes with interpolated waypoints

**Choice:** Define 4–6 bicycles, each with a series of GPS waypoints forming a plausible route (campus loop, street grid, etc.). The binary interpolates between waypoints to generate ~10–20 location entries per bicycle.

**Rationale:** Hardcoded waypoints near EAFIT (lat ~6.20, lon ~-75.57) keep the data realistic and deterministic. Interpolation adds density without manual coordinate entry.

### Decision 4: Idempotency via DELETE-then-INSERT

**Choice:** The binary uses a fixed set of UUIDs for seed bicycles. On each run it DELETEs any existing rows for those UUIDs, then INSERTs the full route data.

**Rationale:** Simplest idempotency strategy using standard SQL. No schema changes or special flags needed.

### Decision 5: Simulated timestamps via explicit `updated_at` values

**Choice:** Each position entry is inserted with an explicit `updated_at` timestamp, incrementing by a fixed interval (e.g., 30 seconds) per waypoint. This creates a realistic time-series without needing to sleep or make sequential calls.

**Rationale:** A single batch of INSERTs with explicit timestamps is faster and more deterministic than relying on `DEFAULT now()` with delays between inserts.

## Risks / Trade-offs

- **[Database must be running]** → The binary requires PostgreSQL to be up. Mitigated by documenting that users should run `docker compose up` first, and the binary checks for connectivity before starting.
- **[Fixed UUIDs could collide]** → Seed UUIDs are hardcoded. Use a distinctive namespace (e.g., `00000000-0000-4000-a000-*`) to avoid collision with real data.
- **[Model may drift from schema]** → The `BicycleLocation` struct must stay in sync with the `bicycles_location` table. Mitigated by SQLx compile-time query checking.
