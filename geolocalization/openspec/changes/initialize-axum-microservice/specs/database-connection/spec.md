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
