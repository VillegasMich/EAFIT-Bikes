## Context

The geolocalization microservice currently exposes two SSE streaming endpoints (`/locations/stream` and `/locations/stream/bicycle/:bicycle_id`) backed by a `tokio::sync::broadcast` channel in `AppState`. Write handlers (POST `/locations` and POST `/locations/batch`) publish every inserted location to this channel. The SSE feature adds a dedicated route module (`src/routes/stream.rs`) and pulls in `tokio-stream` and `futures` as dependencies.

## Goals / Non-Goals

**Goals:**
- Remove all SSE streaming endpoints and their supporting infrastructure
- Simplify `AppState` by removing the broadcast channel
- Remove unused dependencies to reduce compile time and binary size
- Update documentation (CLAUDE.md, README.md) to reflect the new API surface

**Non-Goals:**
- Replacing SSE with an alternative real-time mechanism (e.g., WebSockets, polling)
- Changing the behavior of existing REST endpoints (GET/POST locations)
- Modifying the database schema

## Decisions

1. **Delete `src/routes/stream.rs` entirely** rather than gutting it.
   - *Rationale*: No SSE code remains; an empty module serves no purpose.

2. **Remove `broadcast::Sender` from `AppState`** and all `send()` calls in write handlers.
   - *Rationale*: The broadcast channel exists solely to feed SSE streams. Without consumers, publishing is dead code.

3. **Remove `tokio-stream` and `futures` from `Cargo.toml`** only if no other code depends on them.
   - *Rationale*: These were added specifically for SSE stream adapters. A quick grep will confirm whether they're used elsewhere before removal.

4. **Remove SSE-related test code** in `tests/` if any exists.
   - *Rationale*: Tests for deleted functionality should not remain.

## Risks / Trade-offs

- **[Breaking change]** → Any client currently consuming SSE streams will break. Mitigation: This is intentional and accepted per the proposal.
- **[Dependency removal]** → If `futures` is used elsewhere (e.g., in tests or seed binaries), removing it will cause compile errors. Mitigation: Grep for usage before removing.
