## ADDED Requirements

### Requirement: Connection pool initialized from DATABASE_URL
The service SHALL attempt to create a SQLx `PgPool` from the `DATABASE_URL` environment variable during startup. If the pool cannot be created (missing variable or unreachable host), the service SHALL log a warning and start with no pool available — it MUST NOT exit.

#### Scenario: Valid DATABASE_URL at startup
- **WHEN** `DATABASE_URL` is set to a reachable PostgreSQL connection string and the service starts
- **THEN** the connection pool is created successfully and the server begins accepting HTTP requests

#### Scenario: Missing DATABASE_URL at startup
- **WHEN** `DATABASE_URL` is not set in the environment and the service starts
- **THEN** the service logs a warning that no database URL was configured, starts the HTTP server normally, and sets the pool to `None` in application state

#### Scenario: Unreachable database at startup
- **WHEN** `DATABASE_URL` points to a host that refuses connections and the service starts
- **THEN** the service logs a warning that the database is unavailable, starts the HTTP server normally, and sets the pool to `None` in application state

---

### Requirement: Connection pool passed to route handlers via state
`AppState` SHALL hold the pool as `Option<PgPool>`. Route handlers that require a database connection MUST check whether the pool is `Some` before use and return `503 Service Unavailable` when it is `None`.

#### Scenario: Handler receives pool from state when DB is available
- **WHEN** a route handler is invoked and the pool is `Some`
- **THEN** it can obtain a live database connection from the pool without panicking

#### Scenario: Handler returns 503 when DB is unavailable
- **WHEN** a route handler that requires a database connection is invoked and the pool is `None`
- **THEN** the handler returns HTTP `503 Service Unavailable` with a JSON error body `{"error":"database unavailable"}`

---

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
