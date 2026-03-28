# ADR-02: PostgreSQL + PostGIS as the Microservice Database

## Architectural Decision

PostgreSQL with the PostGIS extension will be used as the persistent storage system for the geolocation data of the Geolocalization microservice. The database will contain a single table holding the geographic position of each bicycle.

## Impacts and Implications

Adopting PostgreSQL with PostGIS requires running an additional container in the Docker environment, which slightly increases the server's memory requirements compared to embedded solutions such as SQLite. However, this decision enables native geospatial capabilities that would be impossible or very costly to replicate at the application level. Both PostgreSQL and PostGIS are open source projects with no licensing cost, and the official `postgis/postgis` image simplifies installation by including both components pre-configured.

## Problem & Constraints

### Problem

Geographic coordinates (latitude/longitude) of bicycles must be stored and queried efficiently, with support for spatial indexes that allow scaling to proximity queries without degrading performance.

### Context

Location data will be consumed by the frontend to render bicycles on an interactive map (Google Maps / Leaflet). Coordinates must be compatible with the WGS84 reference system (EPSG:4326) used by both mapping platforms.

### Scope

This decision applies only to the database of the Geolocalization microservice. It will store geographic position data only; bicycle business data (brand, type, color) resides in the bicycles microservice.

### Constraints

- The database must run in a Docker container.
- The schema is limited to a single table.
- Data must persist across container restarts via Docker volumes.

### Assumptions

- Data volume is small (fewer than 1,000 bicycle records).
- No replication or high availability is required at this stage of the project.
- The WGS84 coordinate system is sufficient for the current map requirements.

## Solution Analysis

### Solution Architecture

PostgreSQL is deployed using the official `postgis/postgis` Docker image. The `bicycles_location` table stores each position using the `GEOGRAPHY(POINT, 4326)` type, which represents a geographic point in the WGS84 reference system. A GIST spatial index is created on this column to optimize retrieval and proximity queries. Communication between the microservice and the database is handled asynchronously via SQLx.

### Rationale

PostgreSQL with PostGIS was selected because it is the industry-standard solution for geospatial data, offering the `GEOGRAPHY(POINT, 4326)` type and GIST indexes that allow spatial queries to be executed directly in the database without additional application-level logic. Native compatibility with WGS84 ensures that stored coordinates are directly consumable by the frontend without transformations, and the robustness and maturity of PostgreSQL guarantee full transactional integrity.
