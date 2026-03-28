## MODIFIED Requirements

### Requirement: BicycleLocation model struct
The codebase SHALL define a `BicycleLocation` Rust struct representing rows in the `bicycles_location` table. The struct MUST include fields for `id` (UUID), `bicycle_id` (i32), `latitude` (f64), `longitude` (f64), and `updated_at` (DateTime). It MUST derive `sqlx::FromRow` for database query mapping.

#### Scenario: Struct maps to database table
- **WHEN** a query fetches rows from `bicycles_location` using `ST_Y(location::geometry)` as latitude and `ST_X(location::geometry)` as longitude
- **THEN** the results can be deserialized into `BicycleLocation` instances with `bicycle_id` as i32

### Requirement: Seed binary populates multiple bicycles
The system SHALL provide a Rust binary target (`cargo run --bin seed`) that inserts location entries for at least 4 distinct bicycles directly into the PostgreSQL database via SQLx. The binary MUST use `clap` for CLI argument parsing and accept a `--live` flag. When `--live` is not passed, the binary MUST perform the existing one-shot seed behavior.

#### Scenario: Running seed creates multiple bicycles
- **WHEN** the seed binary is executed with a valid `DATABASE_URL` and without `--live`
- **THEN** location entries for at least 4 bicycles with distinct integer IDs are present in the `bicycles_location` table

#### Scenario: Running seed with --live enters live mode
- **WHEN** the seed binary is executed with a valid `DATABASE_URL` and `--live`
- **THEN** the binary enters continuous ingestor mode instead of one-shot seed

### Requirement: Seed uses fixed, identifiable integer IDs
The seed binary SHALL use a fixed set of deterministic integer IDs for seed bicycles (e.g., 1, 2, 3, 4) so they can be easily identified and cleaned up.

#### Scenario: Seed IDs are deterministic
- **WHEN** the seed binary runs
- **THEN** the same integer bicycle IDs are used on every execution

## REMOVED Requirements

### Requirement: Seed uses fixed, identifiable UUIDs
**Reason**: `bicycle_id` has been changed from UUID to INTEGER to match the Bicycles microservice.
**Migration**: Seed data now uses fixed integer IDs (1, 2, 3, 4) instead of deterministic UUIDs.
