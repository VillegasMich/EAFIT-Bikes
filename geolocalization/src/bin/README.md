# Seed Binary

A Rust binary that populates the `bicycles_location` table with realistic test data for development and QA.

## Usage

```bash
# Start the database
docker compose up -d db

# Run the seed binary
cargo run --bin seed
```

## Prerequisites

- PostgreSQL with PostGIS must be running and accessible
- `DATABASE_URL` must be set (via environment or `.env` file)

## What It Does

- Inserts location data for **4 bicycles**, each with **~15 timestamped positions**
- GPS coordinates follow plausible routes near the **EAFIT campus** in Medellín (lat ~6.20, lon ~-75.57)
- Each position has an incrementing `updated_at` timestamp (30-second intervals) to simulate movement
- Uses fixed, recognizable UUIDs (`00000000-0000-4000-a000-00000000000N`) for easy identification

## Idempotency

The binary is safe to re-run. It deletes existing rows for the seed UUIDs before inserting, so it always produces a clean, consistent dataset.

## Log Output

Controlled by `RUST_LOG` (defaults to `info` for the seed binary). Shows per-bicycle progress and a final summary.
