## ADDED Requirements

### Requirement: Server binds and listens on configured port
The service SHALL read `APP_PORT` from the environment (default `8080`) and bind the Axum HTTP server to `0.0.0.0:<APP_PORT>` on startup.

#### Scenario: Server starts with valid APP_PORT
- **WHEN** `APP_PORT=9000` is set in the environment and the service starts
- **THEN** the server accepts TCP connections on port `9000`

#### Scenario: Server starts with default port when APP_PORT is absent
- **WHEN** `APP_PORT` is not set in the environment and the service starts
- **THEN** the server accepts TCP connections on port `8080`

---

### Requirement: Graceful shutdown on OS signal
The service SHALL complete all in-flight requests and then exit cleanly when it receives `SIGINT` or `SIGTERM`.

#### Scenario: SIGINT triggers graceful shutdown
- **WHEN** the running server receives `SIGINT`
- **THEN** the server stops accepting new connections, waits for in-flight requests to finish, and the process exits with code `0`

#### Scenario: SIGTERM triggers graceful shutdown
- **WHEN** the running server receives `SIGTERM`
- **THEN** the server stops accepting new connections, waits for in-flight requests to finish, and the process exits with code `0`
