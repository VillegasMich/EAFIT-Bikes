# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`geolocalization` is a Rust microservice in the **EAFIT Bikes** platform. It stores and serves real-time bicycle GPS coordinates via a REST API. It is a pure data API — no map rendering.

## Commands

```bash
# Build
cargo build
cargo build --release

# Run tests
cargo test
cargo test <test_name>   # single test

# Lint and format
cargo clippy
cargo fmt

# Run the full stack (service + PostgreSQL/PostGIS)
docker compose up --build
```

The API is served at `http://localhost:8080`. Requires a `.env` file (copy from `.env.example`).

## Stack

- **Rust** with **Axum** (HTTP framework) on the **Tokio** async runtime
- **PostgreSQL + PostGIS** for geospatial storage (`GEOGRAPHY(POINT, 4326)`, WGS84 coordinates)
- **SQLx** for compile-time-verified async SQL queries
- **Docker Compose** to orchestrate the service and `postgis/postgis` containers

## Database

Single table:

```sql
CREATE TABLE bicycles_location (
    id         UUID PRIMARY KEY,      -- matches ID from Bicycles microservice
    location   GEOGRAPHY(POINT, 4326) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_bicycles_location_geo ON bicycles_location USING GIST(location);
```

PostGIS stores points as `(longitude, latitude)` internally. The API response serializes them as separate `latitude`/`longitude` fields.

## API Contract

| Method | Path | Success | Errors |
|--------|------|---------|--------|
| GET | `/locations` | 200 array | — |
| GET | `/locations/:id` | 200 | 404 |
| POST | `/locations` | 201 | 409 (duplicate) |
| PUT | `/locations/:id` | 200 | 404 |
| DELETE | `/locations/:id` | 204 | 404 |

Coordinates are validated: latitude ∈ [-90, 90], longitude ∈ [-180, 180]. Invalid values return `422 Unprocessable Entity`.

## Development Workflow

After every code change:
1. Run `cargo check` to catch compile errors fast.
2. Run `cargo test` to confirm nothing is broken.
3. Run `cargo clippy` and resolve any warnings before committing.
4. Run `cargo fmt` to keep formatting consistent.

If an API endpoint, request/response shape, status code, or validation rule changes, update the **API Contract** section in this file to match. The README.md must also stay in sync with any such changes.

## Environment Variables

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgres://user:pass@db:5432/geolocalization` |
| `APP_PORT` | `8080` |
