## MODIFIED Requirements

### Requirement: Health check handler logging
The health check handler SHALL log the database connectivity result at `debug` level using `tracing::debug!`.

#### Scenario: DB connected logged at debug
- **WHEN** a health check runs with a connected database and `RUST_LOG=debug`
- **THEN** a `debug`-level event is emitted indicating DB is connected

#### Scenario: DB unavailable logged at debug
- **WHEN** a health check runs without a database and `RUST_LOG=debug`
- **THEN** a `debug`-level event is emitted indicating DB is unavailable
