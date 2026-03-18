## ADDED Requirements

### Requirement: Health endpoint returns 200 OK with DB status
The service SHALL expose `GET /health` and respond with HTTP `200 OK` regardless of database availability. The JSON body SHALL include a `db` field reflecting the current pool state so operators can distinguish a fully healthy service from a degraded one.

#### Scenario: Health check when database is available
- **WHEN** a client sends `GET /health` and the pool is `Some`
- **THEN** the server responds with status `200` and body `{"status":"ok","db":"connected"}`

#### Scenario: Health check when database is unavailable
- **WHEN** a client sends `GET /health` and the pool is `None`
- **THEN** the server responds with status `200` and body `{"status":"ok","db":"unavailable"}`

#### Scenario: Health endpoint does not require authentication
- **WHEN** a client sends `GET /health` without any authentication header
- **THEN** the server responds with status `200` (no `401` or `403`)

---

### Requirement: Health check handler logging
The health check handler SHALL log the database connectivity result at `debug` level using `tracing::debug!`.

#### Scenario: DB connected logged at debug
- **WHEN** a health check runs with a connected database and `RUST_LOG=debug`
- **THEN** a `debug`-level event is emitted indicating DB is connected

#### Scenario: DB unavailable logged at debug
- **WHEN** a health check runs without a database and `RUST_LOG=debug`
- **THEN** a `debug`-level event is emitted indicating DB is unavailable
