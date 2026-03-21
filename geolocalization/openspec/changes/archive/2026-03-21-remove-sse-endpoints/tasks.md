## 1. Remove SSE Route Module

- [x] 1.1 Delete `src/routes/stream.rs`
- [x] 1.2 Remove the `stream` module declaration and router merge from `src/routes/mod.rs`

## 2. Remove Broadcast Channel from AppState

- [x] 2.1 Remove `broadcast::Sender<LocationResponse>` field from `AppState` in `src/state.rs`
- [x] 2.2 Remove the `tokio::sync::broadcast` import from `src/state.rs`
- [x] 2.3 Update `AppState` construction in `src/main.rs` (or wherever it's built) to remove the broadcast channel creation

## 3. Remove Broadcast Publishing from Write Handlers

- [x] 3.1 Remove `state.location_tx.send(location.clone())` from `create_location` in `src/routes/locations.rs`
- [x] 3.2 Remove the broadcast send loop from `create_locations_batch` in `src/routes/locations.rs`

## 4. Remove Unused Dependencies

- [x] 4.1 Check if `tokio-stream` is used outside of `src/routes/stream.rs`; if not, remove from `Cargo.toml`
- [x] 4.2 Check if `futures` is used outside of `src/routes/stream.rs`; if not, remove from `Cargo.toml`

## 5. Remove SSE-Related Tests

- [x] 5.1 Remove any SSE/stream-related test code in `tests/`

## 6. Verify Build

- [x] 6.1 Run `cargo check` to confirm compilation
- [x] 6.2 Run `cargo test` to confirm all remaining tests pass
- [x] 6.3 Run `cargo clippy` to resolve any warnings

## 7. Update Documentation

- [x] 7.1 Update `CLAUDE.md` API Contract table to remove the two stream endpoint rows
- [x] 7.2 Update `README.md` to remove SSE endpoint references
- [x] 7.3 Update `docs/locations.md` to remove SSE endpoint documentation
