# geolocalization

A lightweight microservice responsible for storing and serving real-time geolocation data of bicycles. It is part of the **EAFIT Bike** platform, where the frontend consumes this service to render bicycle positions on an interactive map (Google Maps / Leaflet).

> This service does **not** handle map rendering. It only provides geolocation data via a REST API. All map visualization logic lives in the frontend.

---

## Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Acceptance Criteria](#acceptance-criteria)
- [CI Pipeline](#ci-pipeline)
- [Running Locally](#running-locally)
- [Database UI (pgAdmin)](#database-ui-pgadmin)

---

## Overview

The `geolocalization` microservice is a single-responsibility service that:

- Stores the geographic coordinates (latitude/longitude) of each bicycle
- Allows updating a bicycle's position when it moves
- Exposes endpoints to retrieve location data for one or all bicycles
- Is consumed exclusively by the frontend for map rendering purposes

It is intentionally minimal: **one table, one concern**.

---

## Technologies

### Rust + Axum
Rust is the implementation language. Its ownership model guarantees memory safety at compile time with no garbage collector, making the service stable and predictable under continuous load. **Axum** is the HTTP framework, built on the Tokio async runtime. It is lightweight, ergonomic, and integrates seamlessly with the rest of the Rust async ecosystem.

### PostgreSQL + PostGIS
PostgreSQL is the database. The **PostGIS** extension adds native support for geographic data types (`GEOGRAPHY`, `POINT`) and spatial indexing (`GIST`). This enables efficient geo queries — such as radius-based lookups — directly at the database level, without application-side computation. Coordinates are stored in WGS84 (EPSG:4326), the same coordinate system used by Google Maps and GPS devices, ensuring direct compatibility with the frontend.

### SQLx
SQLx is the Rust database driver. Its key feature is **compile-time query verification**: SQL queries are checked against the actual database schema at build time, catching type mismatches and invalid queries before runtime. It is fully async and integrates naturally with Tokio/Axum.

### Docker + Docker Compose
The entire stack is containerized. Docker ensures environment reproducibility across machines. Docker Compose orchestrates two containers — the Rust service and PostgreSQL/PostGIS — with a single `docker-compose.yml`. The official `postgis/postgis` image is used, providing PostgreSQL with PostGIS pre-installed.

---

## Database Schema

```sql
CREATE TABLE bicycles_location (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bicycle_id   UUID NOT NULL,
    location     GEOGRAPHY(POINT, 4326) NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bicycles_location_geo
    ON bicycles_location USING GIST(location);
CREATE INDEX idx_bicycles_location_bicycle_id
    ON bicycles_location (bicycle_id);
```

- `id` — auto-generated row primary key
- `bicycle_id` — matches the bicycle ID from the Bicycles microservice
- `location` — geographic point (longitude, latitude) in WGS84
- `updated_at` — timestamp of the position update

---

## API Endpoints

All responses are in JSON. This service returns **only geolocation data**.

### GET `/locations`
Returns the current location of all bicycles.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "latitude": 6.2012,
    "longitude": -75.5742,
    "updated_at": "2026-03-16T10:00:00Z"
  }
]
```

---

### GET `/locations/:id`
Returns the current location of a single bicycle.

**Response 200:**
```json
{
  "id": "uuid",
  "latitude": 6.2012,
  "longitude": -75.5742,
  "updated_at": "2026-03-16T10:00:00Z"
}
```

**Response 404:** Bicycle location not found.

---

### PUT `/locations/:id`
Updates the geographic position of a bicycle.

**Request body:**
```json
{
  "latitude": 6.2018,
  "longitude": -75.5750
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "latitude": 6.2018,
  "longitude": -75.5750,
  "updated_at": "2026-03-16T10:05:00Z"
}
```

---

### POST `/locations`
Registers an initial location entry for a new bicycle.

**Request body:**
```json
{
  "id": "uuid",
  "latitude": 6.2012,
  "longitude": -75.5742
}
```

**Response 201:** Location created.
**Response 409:** A location entry for this ID already exists.

---

### DELETE `/locations/:id`
Removes the location entry for a bicycle (e.g., when a bicycle is decommissioned).

**Response 204:** Deleted successfully.
**Response 404:** Not found.

---

## Acceptance Criteria

### AC-01 — Store location
- Given a valid bicycle ID and coordinates, when `POST /locations` is called, then a location record is created and a `201` response is returned.

### AC-02 — Update location
- Given an existing bicycle ID and new coordinates, when `PUT /locations/:id` is called, then the `location` and `updated_at` fields are updated and a `200` response is returned.

### AC-03 — Retrieve all locations
- When `GET /locations` is called, then all bicycle locations are returned as a JSON array with `id`, `latitude`, `longitude`, and `updated_at`.

### AC-04 — Retrieve single location
- Given a valid bicycle ID, when `GET /locations/:id` is called, then the location data for that bicycle is returned with a `200` response.
- Given an unknown bicycle ID, a `404` response is returned.

### AC-05 — Coordinates validity
- Latitude must be between `-90` and `90`. Longitude must be between `-180` and `180`. Invalid values must return a `422 Unprocessable Entity` response.

### AC-06 — No map rendering
- This service must not serve any HTML, map tiles, or frontend assets. It is a pure data API.

### AC-07 — Persistence
- Location data must be persisted in PostgreSQL. A service restart must not result in data loss.

### AC-08 — Containerized deployment
- The service and database must run via `docker compose up` with no additional configuration required beyond environment variables.

---

## CI Pipeline

A GitHub Actions workflow runs automatically on every pull request to `main`. It enforces three stages in order:

1. **Lint & Format** — `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo check`
2. **Build** — `cargo build --release`
3. **Test** — `cargo test` (with a PostGIS service container)

If any stage fails, subsequent stages are skipped.

---

## Running Locally

**Prerequisites:** Docker, Docker Compose (or Rust 1.83+ for native development)

```bash
git clone https://github.com/your-org/geolocalization.git
cd geolocalization
cp .env.example .env
docker compose up --build
```

The API will be available at `http://localhost:8080`.

**Verify it's running:**

```bash
curl http://localhost:8080/health
# {"status":"ok","db":"connected"}
```

---

## Database UI (pgAdmin)

The Docker Compose stack includes a **pgAdmin** container for browsing and managing the PostgreSQL database through a web interface.

After running `docker compose up`, open your browser at:

```
http://localhost:5050
```

**Login credentials:**

| Field | Value |
|-------|-------|
| Email | `admin@admin.com` |
| Password | `admin` |

**Connecting to the database:** Once logged in, register a new server with these settings:

| Field | Value |
|-------|-------|
| Host | `db` |
| Port | `5432` |
| Username | `user` |
| Password | `pass` |
| Database | `geolocalization` |

---

## Seed Data

The project includes a seed binary that populates the database with realistic test data — multiple bicycles with GPS routes near the EAFIT campus.

```bash
# Database must be running first
docker compose up -d db

# Run the seed binary
cargo run --bin seed
```

The seed binary is idempotent — re-running it resets seed data without creating duplicates. It inserts 4 bicycles, each with ~15 timestamped positions simulating movement.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@db:5432/geolocalization` |
| `APP_PORT` | Port the service listens on | `8080` |
| `RUST_LOG` | Log level filter (default: `error`) | `info`, `geolocalization=debug` |
