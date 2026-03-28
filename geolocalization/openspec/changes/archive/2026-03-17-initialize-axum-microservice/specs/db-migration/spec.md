## ADDED Requirements

### Requirement: Migrations run automatically on startup when DB is available
The service SHALL call `sqlx::migrate!()` during startup, before the HTTP server begins accepting connections, only when a pool is available. If no pool is available the migration step is skipped entirely.

#### Scenario: Pending migration is applied on first start
- **WHEN** the database has no applied migrations and the service starts with a valid pool
- **THEN** the `bicycles_location` table is created and the service starts successfully

#### Scenario: Already-applied migration is skipped
- **WHEN** all migrations have already been applied and the service restarts with a valid pool
- **THEN** no migration is re-executed and the service starts successfully

#### Scenario: Migration skipped when database is unavailable
- **WHEN** the pool is `None` at startup
- **THEN** the migration step is skipped, a warning is logged stating that migrations could not run, and the HTTP server starts normally

#### Scenario: Failed migration logs error and starts without DB
- **WHEN** a pool is available but a migration SQL statement fails
- **THEN** the service logs an error with the migration failure details, sets the pool to `None`, and starts the HTTP server normally so non-database routes remain reachable

---

### Requirement: Initial schema creates bicycles_location table
The first migration file SHALL create the `bicycles_location` table with a UUID primary key, a PostGIS `GEOGRAPHY(POINT, 4326)` column, a `TIMESTAMPTZ` timestamp, and a GIST spatial index.

#### Scenario: Table and index exist after migration
- **WHEN** the initial migration has been applied to a fresh PostgreSQL + PostGIS database
- **THEN** `SELECT * FROM bicycles_location` succeeds and a GIST index on the `location` column exists
