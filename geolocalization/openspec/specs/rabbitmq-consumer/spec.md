## ADDED Requirements

### Requirement: RabbitMQ connection from RABBITMQ_URL
The service SHALL attempt to connect to RabbitMQ using the `RABBITMQ_URL` environment variable during startup. If the variable is missing or the connection fails, the service SHALL log a warning and start the HTTP server without the consumer — it MUST NOT exit.

#### Scenario: Valid RABBITMQ_URL at startup
- **WHEN** `RABBITMQ_URL` is set to a reachable AMQP connection string and the service starts
- **THEN** the service connects to RabbitMQ, declares/binds the `bike_events` queue, and begins consuming messages

#### Scenario: Missing RABBITMQ_URL at startup
- **WHEN** `RABBITMQ_URL` is not set in the environment and the service starts
- **THEN** the service logs a warning that no RabbitMQ URL was configured and starts the HTTP server without a consumer

#### Scenario: Unreachable RabbitMQ at startup
- **WHEN** `RABBITMQ_URL` points to an unreachable host and the service starts
- **THEN** the service logs a warning that RabbitMQ is unavailable and starts the HTTP server without a consumer

---

### Requirement: Consume bike_created events
The consumer SHALL process messages from the `bike_events` queue where `event` is `"bike_created"`. Upon receiving such a message, the service SHALL insert one row into `bicycles_location` with the `bicycle_id` from the message and a default location at EAFIT University (latitude: 6.2006, longitude: -75.5783).

#### Scenario: bike_created event received
- **WHEN** a message `{"event": "bike_created", "bike_id": 5}` arrives on the `bike_events` queue
- **THEN** the service inserts a row into `bicycles_location` with `bicycle_id = 5`, latitude `6.2006`, longitude `-75.5783`, and acknowledges the message

#### Scenario: bike_created with database unavailable
- **WHEN** a `bike_created` event arrives and the database pool is `None`
- **THEN** the service logs an error and negatively acknowledges (nack) the message

---

### Requirement: Consume bike_deleted events
The consumer SHALL process messages from the `bike_events` queue where `event` is `"bike_deleted"`. Upon receiving such a message, the service SHALL delete all rows from `bicycles_location` where `bicycle_id` matches the message's `bike_id`.

#### Scenario: bike_deleted event received
- **WHEN** a message `{"event": "bike_deleted", "bike_id": 5}` arrives on the `bike_events` queue
- **THEN** the service deletes all rows from `bicycles_location` where `bicycle_id = 5` and acknowledges the message

#### Scenario: bike_deleted for non-existent bicycle
- **WHEN** a `bike_deleted` event arrives for a `bike_id` with no location rows
- **THEN** the service acknowledges the message without error (no-op delete)

---

### Requirement: Unknown events are logged and acknowledged
The consumer SHALL acknowledge messages with unrecognized `event` values without processing them. A warning-level log MUST be emitted with the unknown event type.

#### Scenario: Unknown event type
- **WHEN** a message `{"event": "bike_updated", "bike_id": 5}` arrives on the `bike_events` queue
- **THEN** the service logs a warning about the unknown event type and acknowledges the message

---

### Requirement: Malformed messages are logged and acknowledged
The consumer SHALL acknowledge messages that fail JSON deserialization. An error-level log MUST be emitted with the raw message body.

#### Scenario: Invalid JSON message
- **WHEN** a message with invalid JSON arrives on the `bike_events` queue
- **THEN** the service logs an error with the raw payload and acknowledges the message

---

### Requirement: Consumer runs as background task
The RabbitMQ consumer SHALL run as a `tokio::spawn` background task sharing the same `PgPool` as the HTTP handlers. The consumer MUST NOT block the HTTP server from starting or accepting requests.

#### Scenario: HTTP server and consumer run concurrently
- **WHEN** the service starts with both a valid `DATABASE_URL` and `RABBITMQ_URL`
- **THEN** the HTTP server accepts requests while the consumer simultaneously processes queue messages

---

### Requirement: Consumer lifecycle logging
The consumer SHALL use structured `tracing` events for all lifecycle and processing events.

#### Scenario: Consumer starts
- **WHEN** the consumer connects and begins consuming
- **THEN** an `info`-level event "RabbitMQ consumer started on queue bike_events" is emitted

#### Scenario: Event processed
- **WHEN** a bike event is successfully processed
- **THEN** a `debug`-level event is emitted with the event type and bike_id

#### Scenario: Consumer connection failure
- **WHEN** the consumer fails to connect to RabbitMQ
- **THEN** a `warn`-level event is emitted with the connection error
