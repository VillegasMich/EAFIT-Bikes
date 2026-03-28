## Context

The geolocalization microservice currently operates independently — bicycles are referenced by UUID, and location data is created only through the REST API or seed tooling. The Bicycles microservice uses integer IDs and publishes lifecycle events (`bike_created`, `bike_deleted`) to a RabbitMQ queue named `bike_events`. This change integrates the geolocalization service with that event stream.

Current state:
- `bicycle_id` is `UUID` throughout the stack (DB, API, models, seeds).
- No message queue dependency exists.
- Location entries are only created via HTTP POST endpoints or the seed binary.

## Goals / Non-Goals

**Goals:**
- Consume `bike_created` and `bike_deleted` events from the `bike_events` RabbitMQ queue.
- On `bike_created`: insert a default location at EAFIT University (lat: 6.2006, lon: -75.5783).
- On `bike_deleted`: delete all location rows for that bicycle.
- Change `bicycle_id` from UUID to INTEGER (i32) across the entire codebase to match the Bicycles microservice.
- Add `RABBITMQ_URL` as a required environment variable.

**Non-Goals:**
- Adding a RabbitMQ container to Docker Compose (it is managed externally).
- Publishing events back to RabbitMQ.
- Handling event replay, ordering guarantees, or dead-letter queues.
- Migrating existing UUID-based data (this is a development-stage service; data can be dropped).

## Decisions

### 1. AMQP client library: `lapin`

Use the `lapin` crate for RabbitMQ connectivity. It is the most mature async AMQP 0-9-1 client for Rust, works well with Tokio, and has widespread adoption.

**Alternatives considered:**
- `amqprs`: newer, fewer real-world deployments.
- Direct TCP with `amqp` crate: lower-level, more boilerplate.

### 2. Consumer runs as a background Tokio task

The RabbitMQ consumer will be spawned as a `tokio::spawn` task during server startup, alongside the HTTP server. Both share the same `PgPool` via `AppState`.

**Alternatives considered:**
- Separate binary for the consumer: adds deployment complexity for no benefit at this stage.
- Blocking thread: incompatible with async pool sharing.

### 3. bicycle_id type: i32

The Bicycles microservice uses integer IDs. We will use Rust `i32` (maps to PostgreSQL `INTEGER`). The JSON events use plain integers.

**Alternatives considered:**
- `i64`/`BIGINT`: overkill for bicycle count, and the source service uses regular integers.

### 4. Database migration: drop and recreate

Since this is a development-stage service with seed data, the migration will drop the existing `bicycles_location` table and recreate it with `bicycle_id INTEGER`. No data migration is needed.

**Alternatives considered:**
- ALTER TABLE with type cast: UUIDs cannot be meaningfully cast to integers; the data has no real-world value yet.

### 5. Default location: EAFIT University coordinates

When a `bike_created` event arrives, the service inserts one row with:
- `bicycle_id`: from the event
- `latitude`: 6.2006
- `longitude`: -75.5783

These are the coordinates of Universidad EAFIT in Medellin, Colombia.

### 6. RabbitMQ connection resilience

The consumer will attempt to connect at startup. If RabbitMQ is unavailable, it will log a warning and the HTTP server will still start (same pattern as the database connection). The consumer task will not retry automatically — a service restart is required.

**Alternatives considered:**
- Retry loop with backoff: adds complexity; acceptable for a development service to just restart.

## Risks / Trade-offs

- **[Breaking change]** All API clients must switch from UUID to integer `bicycle_id`. → Acceptable since this is pre-production.
- **[No retry on RabbitMQ failure]** If RabbitMQ drops mid-operation, events are lost. → Mitigated by service restart; acceptable for development stage.
- **[Tight coupling to event schema]** The consumer assumes a specific JSON shape. → If the Bicycles microservice changes its event format, the consumer will fail to deserialize and log errors.
- **[No dead-letter queue]** Malformed messages are logged and acknowledged (not requeued). → Prevents poison-pill loops.
