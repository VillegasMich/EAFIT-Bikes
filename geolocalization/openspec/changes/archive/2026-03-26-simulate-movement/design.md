## Context

The geolocalization microservice stores bicycle GPS positions in a PostGIS-backed `bicycles_location` table. The existing `seed` binary can insert static data or run a live ingestor that appends positions for a hardcoded set of 4 bicycles. There is no tool to make *all* existing entries appear to move continuously, which is needed for frontend demos and real-time update testing.

## Goals / Non-Goals

**Goals:**
- Provide a `mover` binary that continuously nudges every bicycle in the database to a nearby random position every 1 second.
- Dynamically discover bicycles — new rows inserted by other processes (seed, API, RabbitMQ consumer) are picked up on the next tick.
- Follow the same patterns as `seed.rs`: dotenv, tracing, clap, sqlx, graceful Ctrl+C shutdown.

**Non-Goals:**
- Realistic physics-based movement (bearing, speed limits, road snapping). Simple random offsets are sufficient.
- Modifying or deleting existing rows — the mover only *inserts* new position rows.
- Docker Compose service definition — the binary is run ad-hoc during development.

## Decisions

### 1. Discover bicycles via query each tick

**Choice**: Each tick, query `SELECT DISTINCT bicycle_id, ... FROM bicycles_location` to get the latest position per bicycle, then insert new nudged positions.

**Alternative**: Cache bicycle IDs and only refresh periodically. Rejected because the query is lightweight (indexed on `bicycle_id`) and caching adds complexity for negligible gain at development-tool scale.

### 2. Random offset magnitude

**Choice**: Apply a uniform random offset in the range ±0.0001° to ±0.0005° (~11–55 meters) to both latitude and longitude independently. This produces visible movement on a map without teleporting bicycles across the city.

**Alternative**: Use a bearing + distance model. Rejected as over-engineered for a dev tool.

### 3. Clamp coordinates to valid ranges

**Choice**: After applying the random offset, clamp latitude to [-90, 90] and longitude to [-180, 180] to avoid PostGIS validation errors.

### 4. Add `rand` dependency

**Choice**: Add the `rand` crate for random number generation. This is a well-established Rust crate and the only new dependency required.

## Risks / Trade-offs

- **Table growth**: The mover inserts one row per bicycle per second indefinitely. For dev use this is acceptable; for long runs the table could grow large. → Mitigation: This is a dev tool; users can truncate the table or stop the binary.
- **Database load**: One read query + N insert queries per second. At dev scale (tens of bicycles) this is negligible. → No mitigation needed.
- **Coordinate drift**: Pure random walk will eventually drift bicycles far from their origin. → Acceptable for a dev/demo tool. Users can re-seed to reset positions.
