## Why

The geolocalization microservice currently has no data endpoints — only a health check. The service needs read and write endpoints so other parts of the EAFIT Bikes platform can query bicycle locations (all or by bicycle ID) and record new GPS positions (single or batch). Without these, the service cannot fulfill its core responsibility of storing and serving real-time bicycle coordinates.

## What Changes

- Add **GET `/locations`** endpoint to retrieve all bicycle locations, with an optional `?latest=true` query flag to return only the most recent location per bicycle
- Add **GET `/locations/bicycle/:bicycle_id`** endpoint to retrieve all location records for a specific bicycle, with an optional `?latest=true` query flag to return only the most recent location
- Add **GET `/locations/stream`** SSE endpoint that pushes new location events to connected clients in near real-time
- Add **GET `/locations/stream/bicycle/:bicycle_id`** SSE endpoint that pushes location events for a specific bicycle
- Add **POST `/locations`** endpoint to record a single bicycle's GPS position
- Add **POST `/locations/batch`** endpoint to record multiple bicycles' GPS positions in one request
- Define typed request and response structs (`CreateLocationRequest`, `CreateLocationBatchRequest`, `LocationResponse`) with serde serialization
- Add input validation for coordinates (latitude ∈ [-90, 90], longitude ∈ [-180, 180])
- Add documentation comments on all public types and handler functions

## Capabilities

### New Capabilities

- `location-read`: Read endpoints for querying bicycle locations — list all and filter by bicycle ID
- `location-stream`: Server-Sent Events endpoints for real-time location push to clients
- `location-write`: Write endpoints for recording bicycle GPS positions — single and batch insertion

### Modified Capabilities

_None._

## Impact

- **Code**: New route handlers in `src/routes/`, new request/response structs in `src/models.rs` (or a dedicated module), router updates in `src/router.rs`
- **API**: Six new HTTP endpoints added to the public API surface (4 REST + 2 SSE)
- **State**: An in-memory broadcast channel added to `AppState` for notifying SSE streams of new inserts
- **Database**: New read queries and insert queries against the existing `bicycles_location` table (no schema changes)
- **Errors module**: Extended with validation error variants (422) and not-found handling
