## Why

The SSE streaming endpoints (`/locations/stream` and `/locations/stream/bicycle/:bicycle_id`) add complexity (broadcast channel, SSE dependencies, extra route module) that is not currently needed by the platform. Removing them simplifies the codebase, reduces dependencies, and narrows the API surface.

## What Changes

- **BREAKING**: Remove `GET /locations/stream` endpoint
- **BREAKING**: Remove `GET /locations/stream/bicycle/:bicycle_id` endpoint
- Remove the `tokio::sync::broadcast` channel from `AppState`
- Remove broadcast `send()` calls from POST write handlers
- Remove `src/routes/stream.rs` module
- Remove SSE/streaming-related dependencies from `Cargo.toml` (e.g., `tokio-stream`, `futures`)
- Update `CLAUDE.md` API Contract table to remove stream rows
- Update `README.md` to reflect the reduced API surface

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `location-stream`: Capability is being **removed entirely** — all SSE streaming requirements are deleted.
- `location-write`: Remove the broadcast channel publishing from write handlers (POST `/locations` and POST `/locations/batch`).

## Impact

- **API**: Two SSE endpoints removed — any clients subscribing to real-time location streams will break.
- **Code**: `src/routes/stream.rs` deleted; `src/state.rs` simplified (no broadcast channel); `src/routes/locations.rs` simplified (no `send()` calls).
- **Dependencies**: `tokio-stream` and potentially `futures` crate can be removed if unused elsewhere.
- **Docs**: `CLAUDE.md` and `README.md` API tables must be updated.
