## 1. Dependencies and CLI Setup

- [x] 1.1 Add `clap` with `derive` feature to `Cargo.toml`
- [x] 1.2 Define a `Cli` struct with a `--live` boolean flag using clap derive and parse it in `main`

## 2. Refactor Seed Binary

- [x] 2.1 Extract the existing one-shot seed logic into a standalone async function (e.g., `run_seed`)
- [x] 2.2 Branch in `main` based on the `--live` flag: call `run_seed` when `--live` is absent, call the live ingestor when present

## 3. Live Ingestor Implementation

- [x] 3.1 Implement the live ingestor loop: use `tokio::time::interval(1s)` to tick every second, inserting one new location row per bicycle per tick
- [x] 3.2 Maintain a per-bicycle route index that advances each tick and wraps at the end of the route
- [x] 3.3 Handle graceful shutdown via `tokio::signal::ctrl_c()` — stop the loop, log a summary (total positions, runtime), and exit cleanly

## 4. Logging

- [x] 4.1 Log `info` when entering live mode (including number of bicycles and route lengths)
- [x] 4.2 Log `debug` on each tick (tick number, positions inserted)
- [x] 4.3 Log `info` summary on shutdown (total positions inserted, elapsed time)

## 5. Documentation

- [x] 5.1 Update CLAUDE.md and README.md to document the `--live` flag usage (`cargo run --bin seed -- --live`) and its behavior
