## Context

The geolocalization service has a PostgreSQL/PostGIS database with the `bicycles_location` table already migrated and seeded, but no data-serving endpoints exist — only a health check. The existing codebase has a `BicycleLocation` model struct, an Axum router, and an `AppState` holding an optional `PgPool`. The seed binary already demonstrates insert queries using `ST_MakePoint`.

## Goals / Non-Goals

**Goals:**
- Expose read endpoints to list all locations and filter by bicycle ID, with an optional `?latest=true` query flag to return only the most recent location per bicycle
- Expose write endpoints for single and batch GPS position recording
- Define typed request/response structs with serde derive macros
- Validate coordinate bounds and return 422 on invalid input
- Document all public types and handlers with `///` doc comments

**Non-Goals:**
- Pagination, filtering by time range, or spatial queries (e.g., "bikes within radius")
- Authentication or authorization
- WebSocket (SSE is used instead for one-way push)
- Modifying the existing database schema

## Decisions

### 1. Route structure

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/locations` | List all locations (or latest per bicycle with `?latest=true`) |
| GET | `/locations/bicycle/:bicycle_id` | List locations for a bicycle (or latest only with `?latest=true`) |
| GET | `/locations/stream` | SSE stream of all new location events |
| GET | `/locations/stream/bicycle/:bicycle_id` | SSE stream of new events for a specific bicycle |
| POST | `/locations` | Insert a single location |
| POST | `/locations/batch` | Insert multiple locations |

**Rationale**: Using `/locations/bicycle/:bicycle_id` avoids ambiguity with the existing CRUD `/locations/:id` pattern from the API contract. The batch endpoint uses a separate path rather than overloading POST `/locations` to keep request schemas distinct and explicit.

### 2. Request/response types as dedicated structs

- `LocationResponse` — serialized output with `id`, `bicycle_id`, `latitude`, `longitude`, `updated_at`
- `LocationQuery` — query parameters struct with optional `latest: bool` (defaults to `false`)
- `CreateLocationRequest` — single write input with `bicycle_id`, `latitude`, `longitude`
- `CreateLocationBatchRequest` — wrapper containing `Vec<CreateLocationRequest>`
- `CreateLocationBatchResponse` — wrapper containing `Vec<LocationResponse>` for the inserted rows

**Rationale**: Typed structs give compile-time guarantees, enable derive-based validation, and generate self-documenting API shapes. Reusing `CreateLocationRequest` inside the batch wrapper avoids duplication.

### 3. Coordinate validation in a shared function

A single `validate_coordinates(lat, lon) -> Result<(), AppError>` function checks bounds before any database call. Both single and batch handlers call it, returning 422 with a descriptive message on failure.

**Rationale**: Centralizing validation avoids drift between single and batch paths and keeps handlers thin.

### 4. SQL approach

- Reads use `sqlx::query_as!` with `ST_Y(location::geometry)` and `ST_X(location::geometry)` to extract lat/lon. When `latest=true`, the query uses `DISTINCT ON (bicycle_id) ... ORDER BY bicycle_id, updated_at DESC` to return only the most recent row per bicycle (or the single most recent row when filtering by bicycle ID).
- Single insert uses `sqlx::query_as!` with `ST_SetSRID(ST_MakePoint($lon, $lat), 4326)` returning the inserted row.
- Batch insert uses a single query with `UNNEST` arrays to insert all rows in one round-trip, returning all inserted rows.

**Rationale**: `query_as!` gives compile-time SQL checking. Batch `UNNEST` is far more efficient than N individual inserts and avoids N round-trips.

### 5. SSE via tokio broadcast channel

A `tokio::sync::broadcast::Sender<LocationResponse>` is added to `AppState`. When the POST handlers successfully insert a location, they publish the `LocationResponse` to the broadcast channel. SSE handler functions subscribe to this channel via `sender.subscribe()` and yield each received message as an SSE event using Axum's `Sse` response type with `axum::response::sse::Event`.

- **GET `/locations/stream`** — subscribes and forwards all events.
- **GET `/locations/stream/bicycle/:bicycle_id`** — subscribes and filters, forwarding only events matching the path's `bicycle_id`.

The broadcast channel has a bounded capacity (e.g., 256). If a slow client falls behind, it receives a `Lagged` error and reconnects from the current point. Axum's SSE support handles `Content-Type: text/event-stream` and keep-alive automatically.

**Rationale**: A broadcast channel is the simplest in-process pub/sub. No external message broker needed. SSE (vs WebSocket) is the right fit because data flows one-way (server → client), it works over plain HTTP, and clients get automatic reconnection via the `EventSource` API. Axum has native SSE support via `axum::response::Sse`.

### 6. Module organization

New file `src/routes/locations.rs` contains all REST handlers. New file `src/routes/stream.rs` contains the SSE handlers. Request/response structs live in `src/models.rs` alongside `BicycleLocation`. The router merges both route modules in `src/router.rs`.

**Rationale**: Follows the existing pattern (health routes in `src/routes/health.rs`). Keeping models together in one file is appropriate given the small number of types.

## Risks / Trade-offs

- **Unbounded GET `/locations`** — Returns all rows, which could be large. → Acceptable for MVP; pagination can be added later without breaking changes.
- **Batch insert size** — No limit on array length in `CreateLocationBatchRequest`. → Could add a max-size check (e.g., 1000) if abuse becomes a concern.
- **No transaction for batch** — Single `INSERT ... UNNEST` is atomic by default in PostgreSQL, so no explicit transaction needed. If one row fails validation, the entire batch is rejected before hitting the DB.
- **Broadcast channel capacity** — If a client is too slow it misses events. → Acceptable: SSE clients can reconnect, and the REST GET endpoints remain available for catching up.
- **No persistence for SSE** — Events only reach currently-connected clients, not replayed on reconnect. → Fine for real-time "current position" use case; historical data is available via GET endpoints.
