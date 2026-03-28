## MODIFIED Requirements

### Requirement: Database lifecycle logging
Database pool initialization, migration execution, and connection failures SHALL use structured `tracing` events instead of `eprintln!()`.

#### Scenario: Successful DB connection
- **WHEN** the service connects to the database successfully
- **THEN** an `info`-level event "Connected to database" is emitted

#### Scenario: DB connection failure
- **WHEN** the service fails to connect to the database
- **THEN** a `warn`-level event is emitted with the error details

#### Scenario: DATABASE_URL not set
- **WHEN** `DATABASE_URL` is not set
- **THEN** a `warn`-level event "DATABASE_URL not set, starting without database" is emitted

#### Scenario: Migrations applied
- **WHEN** migrations run successfully
- **THEN** an `info`-level event "Migrations applied successfully" is emitted

#### Scenario: Migration failure
- **WHEN** migrations fail
- **THEN** an `error`-level event is emitted with the migration error

#### Scenario: Migrations skipped
- **WHEN** there is no database connection
- **THEN** a `warn`-level event "Skipping migrations (no database connection)" is emitted
