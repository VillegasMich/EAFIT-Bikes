## 1. Database Migration: UUID to INTEGER

- [x] 1.1 Create a new SQLx migration that drops the `bicycles_location` table and recreates it with `bicycle_id INTEGER NOT NULL` (replacing UUID)
- [x] 1.2 Update the `BicycleLocation` model struct to use `i32` for `bicycle_id` instead of `Uuid`
- [x] 1.3 Update `LocationResponse` struct to use `i32` for `bicycle_id`
- [x] 1.4 Update `CreateLocationRequest` struct to use `i32` for `bicycle_id`

## 2. Update API Handlers for Integer bicycle_id

- [x] 2.1 Update GET `/locations/bicycle/:bicycle_id` handler to parse `bicycle_id` as `i32` instead of `Uuid`
- [x] 2.2 Update all SQL queries to use `$1::INTEGER` binding for `bicycle_id` parameters
- [x] 2.3 Update POST `/locations` and POST `/locations/batch` handlers for integer `bicycle_id`
- [x] 2.4 Verify existing tests compile and pass with integer `bicycle_id`

## 3. Add RabbitMQ Dependency and Connection

- [x] 3.1 Add `lapin` crate to `Cargo.toml` dependencies
- [x] 3.2 Add `RABBITMQ_URL` to `.env.example` with value `amqp://admin:admin123@host.docker.internal:5672/`
- [x] 3.3 Add `RABBITMQ_URL` environment variable to `docker-compose.yml` for the service container
- [x] 3.4 Implement RabbitMQ connection logic: read `RABBITMQ_URL`, connect, log warning if unavailable

## 4. Implement RabbitMQ Consumer

- [x] 4.1 Define the `BikeEvent` struct for deserializing queue messages (`event: String`, `bike_id: i32`)
- [x] 4.2 Implement the consumer as a `tokio::spawn` background task that declares/consumes from the `bike_events` queue
- [x] 4.3 Implement `bike_created` handler: insert default location (lat: 6.2006, lon: -75.5783) into `bicycles_location`
- [x] 4.4 Implement `bike_deleted` handler: delete all location rows for the given `bicycle_id`
- [x] 4.5 Handle unknown events (log warning + ack) and malformed messages (log error + ack)
- [x] 4.6 Add structured `tracing` logging for consumer lifecycle and event processing

## 5. Wire Consumer into Application Startup

- [x] 5.1 Integrate RabbitMQ connection into `main.rs` startup flow (after DB pool, before server bind)
- [x] 5.2 Spawn the consumer task with a clone of the `PgPool`, ensuring the HTTP server starts regardless of RabbitMQ status

## 6. Update Seed and Live Ingestor

- [x] 6.1 Update the seed binary to use integer `bicycle_id` values (1, 2, 3, 4) instead of UUIDs
- [x] 6.2 Update the live ingestor to use integer `bicycle_id` values
- [x] 6.3 Update all seed SQL queries for integer `bicycle_id` bindings

## 7. Testing

- [x] 7.1 Run `cargo check` to verify compilation
- [x] 7.2 Run `cargo test` to verify all tests pass
- [x] 7.3 Run `cargo clippy` and resolve any warnings
- [x] 7.4 Run `cargo fmt` to ensure consistent formatting

## 8. Documentation

- [x] 8.1 Update CLAUDE.md: add `RABBITMQ_URL` to Environment Variables table, update API Contract if needed, update Database schema section for integer `bicycle_id`
- [x] 8.2 Update README.md to reflect integer `bicycle_id`, new `RABBITMQ_URL` env var, and RabbitMQ consumer functionality
- [x] 8.3 Create or update `docs/locations.md` with updated endpoint documentation reflecting integer `bicycle_id`
