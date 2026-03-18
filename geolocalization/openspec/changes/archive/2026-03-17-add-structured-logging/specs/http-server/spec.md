## MODIFIED Requirements

### Requirement: HTTP request tracing
The HTTP server SHALL include `tower-http`'s `TraceLayer` middleware on the router. The layer SHALL create a tracing span for each inbound request containing the HTTP method and URI. Request completion SHALL be logged at `debug` level with the response status code.

#### Scenario: Request span logged at debug level
- **WHEN** a client sends `GET /health` and `RUST_LOG=debug`
- **THEN** a log line is emitted containing the method, path, and response status

#### Scenario: Request logging silent at error level
- **WHEN** a client sends `GET /health` and `RUST_LOG=error`
- **THEN** no request/response log line is emitted
