## ADDED Requirements

### Requirement: BicycleLocation model struct
The codebase SHALL define a `BicycleLocation` Rust struct representing rows in the `bicycles_location` table. The struct MUST include fields for `id` (UUID), `latitude` (f64), `longitude` (f64), and `updated_at` (DateTime). It MUST derive `sqlx::FromRow` for database query mapping.

#### Scenario: Struct maps to database table
- **WHEN** a query fetches rows from `bicycles_location` using `ST_Y(location::geometry)` as latitude and `ST_X(location::geometry)` as longitude
- **THEN** the results can be deserialized into `BicycleLocation` instances

### Requirement: Seed binary populates multiple bicycles
The system SHALL provide a Rust binary target (`cargo run --bin seed`) that inserts location entries for at least 4 distinct bicycles directly into the PostgreSQL database via SQLx. The binary MUST use `clap` for CLI argument parsing and accept a `--live` flag. When `--live` is not passed, the binary MUST perform the existing one-shot seed behavior.

#### Scenario: Running seed creates multiple bicycles
- **WHEN** the seed binary is executed with a valid `DATABASE_URL` and without `--live`
- **THEN** location entries for at least 4 bicycles with distinct UUIDs are present in the `bicycles_location` table

#### Scenario: Running seed with --live enters live mode
- **WHEN** the seed binary is executed with a valid `DATABASE_URL` and `--live`
- **THEN** the binary enters continuous ingestor mode instead of one-shot seed

### Requirement: Each bicycle has multiple timestamped positions
The seed binary SHALL insert multiple location entries per bicycle to simulate movement over time. Each bicycle MUST have at least 10 position entries with different `updated_at` timestamps.

#### Scenario: Bicycle has movement history
- **WHEN** the seed binary completes for a given bicycle
- **THEN** querying `bicycles_location` for that bicycle's UUID returns at least 10 rows with distinct `updated_at` values and different coordinates

### Requirement: Coordinates follow realistic routes
The seed binary SHALL use GPS coordinates in the EAFIT campus area of Medellín, Colombia (approximately lat 6.20, lon -75.57). Positions for each bicycle MUST form a plausible movement path (sequential points within walking/cycling distance of each other).

#### Scenario: Coordinates are geographically plausible
- **WHEN** the seed data is examined
- **THEN** all coordinates fall within the Medellín metropolitan area (lat 6.15–6.35, lon -75.65–-75.50)
- **AND** consecutive positions for a single bicycle are no more than 500 meters apart

### Requirement: Seed binary is idempotent
The seed binary SHALL be safe to run multiple times. Re-running it MUST NOT create duplicate entries or fail due to conflicts.

#### Scenario: Re-running the seed binary
- **WHEN** the seed binary is run a second time
- **THEN** the database contains the same set of seed bicycles (no duplicates)
- **AND** the binary exits successfully

### Requirement: Seed uses fixed, identifiable UUIDs
The seed binary SHALL use a fixed set of deterministic UUIDs for seed bicycles so they can be easily identified and cleaned up. UUIDs MUST follow a recognizable pattern (e.g., `00000000-0000-4000-a000-000000000001`).

#### Scenario: Seed UUIDs are deterministic
- **WHEN** the seed binary runs
- **THEN** the same UUIDs are used on every execution

### Requirement: Binary validates database connectivity
The seed binary SHALL check that the PostgreSQL database is reachable before attempting to insert data. If the database is unavailable, the binary MUST exit with a clear error message.

#### Scenario: Database is not running
- **WHEN** the seed binary is executed and the database is unreachable
- **THEN** the binary exits with a non-zero exit code and prints an error indicating the database is not available

### Requirement: Binary provides execution feedback
The seed binary SHALL print progress information during execution, including which bicycle is being seeded and how many positions have been inserted.

#### Scenario: Normal execution output
- **WHEN** the seed binary runs successfully
- **THEN** the binary prints a summary showing the number of bicycles seeded and total positions inserted
