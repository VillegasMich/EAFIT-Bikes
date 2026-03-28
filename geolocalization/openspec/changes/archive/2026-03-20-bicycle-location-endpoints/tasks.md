## 1. Request/Response Types

- [x] 1.1 Define `LocationResponse` struct in `src/models.rs` with `id`, `bicycle_id`, `latitude`, `longitude`, `updated_at` fields, deriving `Serialize`, `Deserialize`, and `Debug`. Add `///` doc comments.
- [x] 1.2 Define `CreateLocationRequest` struct in `src/models.rs` with `bicycle_id`, `latitude`, `longitude` fields, deriving `Deserialize` and `Debug`. Add `///` doc comments.
- [x] 1.3 Define `CreateLocationBatchRequest` struct in `src/models.rs` with a `locations: Vec<CreateLocationRequest>` field, deriving `Deserialize` and `Debug`. Add `///` doc comments.
- [x] 1.4 Define `LocationQuery` struct in `src/models.rs` with an optional `latest: bool` field (defaulting to `false`), deriving `Deserialize` and `Debug`. Add `///` doc comments.

## 2. Broadcast Channel and AppState

- [x] 2.1 Add a `tokio::sync::broadcast::Sender<LocationResponse>` field to `AppState` in `src/state.rs`.
- [x] 2.2 Initialize the broadcast channel (capacity 256) in `main.rs` and pass the sender into `AppState`.

## 3. Validation and Error Handling

- [x] 3.1 Add a `validate_coordinates(lat: f64, lon: f64)` function that returns `Result<(), AppError>` checking latitude ∈ [-90, 90] and longitude ∈ [-180, 180].
- [x] 3.2 Extend `AppError` in `src/errors.rs` with variants for validation errors (422), not found (404), and bad request (400). Implement `IntoResponse` for each.

## 4. Read Endpoint Handlers

- [x] 4.1 Create `src/routes/locations.rs` with a `get_all_locations` handler that accepts `Query<LocationQuery>`, queries all rows (or uses `DISTINCT ON (bicycle_id) ... ORDER BY bicycle_id, updated_at DESC` when `latest=true`), extracts lat/lon via `ST_Y`/`ST_X`, and returns 200 with `Vec<LocationResponse>`.
- [x] 4.2 Add a `get_locations_by_bicycle` handler that accepts `Path<Uuid>` and `Query<LocationQuery>`, queries matching rows (or only the most recent row when `latest=true` via `ORDER BY updated_at DESC LIMIT 1`), and returns 200 with `Vec<LocationResponse>` (empty array if none found).

## 5. Write Endpoint Handlers

- [x] 5.1 Add a `create_location` handler that accepts `Json<CreateLocationRequest>`, validates coordinates, inserts using `ST_SetSRID(ST_MakePoint(...), 4326)`, publishes the resulting `LocationResponse` to the broadcast channel, and returns 201.
- [x] 5.2 Add a `create_locations_batch` handler that accepts `Json<CreateLocationBatchRequest>`, validates all entries' coordinates, inserts all rows using `UNNEST` arrays in a single query, publishes each resulting `LocationResponse` to the broadcast channel, and returns 201 with `Vec<LocationResponse>`.

## 6. SSE Stream Handlers

- [x] 6.1 Create `src/routes/stream.rs` with a `stream_all_locations` handler that subscribes to the broadcast channel and returns an `Sse` response, forwarding each `LocationResponse` as an SSE event with `event: location`.
- [x] 6.2 Add a `stream_locations_by_bicycle` handler that accepts `Path<Uuid>`, subscribes to the broadcast channel, filters events by `bicycle_id`, and returns an `Sse` response.
- [x] 6.3 Handle `Lagged` errors by logging a warning and continuing the stream from the current point.

## 7. Router Integration

- [x] 7.1 Register the REST routes in `src/routes/locations.rs` as an Axum router function (following the pattern in `health.rs`).
- [x] 7.2 Register the SSE routes in `src/routes/stream.rs` as an Axum router function.
- [x] 7.3 Merge both routers into `src/router.rs`.

## 8. Testing

- [x] 8.1 Add integration tests for GET `/locations` (empty DB returns `[]`, seeded DB returns all records, `?latest=true` returns one per bicycle).
- [x] 8.2 Add integration tests for GET `/locations/bicycle/:bicycle_id` (matching records, no records, invalid UUID, `?latest=true` returns single most recent).
- [x] 8.3 Add integration tests for POST `/locations` (valid creation returns 201, invalid coordinates returns 422).
- [x] 8.4 Add integration tests for POST `/locations/batch` (valid batch returns 201, invalid entry returns 422, empty array returns 422).
- [x] 8.5 Add integration tests for SSE `/locations/stream` (connect, insert a location via POST, verify the SSE event is received with correct data).
- [x] 8.6 Add integration tests for SSE `/locations/stream/bicycle/:bicycle_id` (verify only matching events are received, non-matching are filtered).

## 9. Documentation

- [x] 9.1 Create `docs/locations.md` documenting all six endpoints (4 REST + 2 SSE): method, path, request/response shapes, status codes, SSE event format, and validation rules.
- [x] 9.2 Update `CLAUDE.md` API Contract table to include the new endpoints.
- [x] 9.3 Update `README.md` to reflect the new endpoints and usage examples.
