## Why

The geolocalization microservice currently has no way to know when bicycles are created or deleted in the Bicycles microservice. We need to consume events from a RabbitMQ queue (`bike_events`) so the service can automatically initialize a default location entry when a bike is created, and clean up location data when a bike is deleted. This also requires changing `bicycle_id` from UUID to integer to match the Bicycles microservice's ID type.

## What Changes

- **BREAKING**: Change `bicycle_id` column type from `UUID` to `INTEGER` across the entire codebase (database schema, API request/response types, query parameters, seed data).
- Add a RabbitMQ consumer that connects to the `bike_events` queue and processes `bike_created` and `bike_deleted` events.
- On `bike_created`: insert a default location row for the bicycle at EAFIT University, Medellin, Colombia (lat: 6.2006, lon: -75.5783).
- On `bike_deleted`: delete all location rows for that bicycle.
- Add `RABBITMQ_URL` environment variable (`amqp://admin:admin123@host.docker.internal:5672/`).

## Capabilities

### New Capabilities
- `rabbitmq-consumer`: RabbitMQ connection and event consumption from the `bike_events` queue, handling `bike_created` and `bike_deleted` events.

### Modified Capabilities
- `database-connection`: `bicycle_id` changes from UUID to INTEGER. **BREAKING**.
- `location-write`: New write path via RabbitMQ events (default location on bike creation, deletion on bike removal).
- `location-read`: Response and query parameter types change from UUID to INTEGER for `bicycle_id`.
- `seed-factory`: Seed data must use integer `bicycle_id` values instead of UUIDs.
- `live-ingestor`: Must use integer `bicycle_id` values instead of UUIDs.

## Impact

- **Database**: Migration needed to alter `bicycle_id` from UUID to INTEGER. Existing data must be migrated or dropped.
- **API**: All endpoints using `bicycle_id` change from UUID to integer path/body parameters. Clients must update.
- **Dependencies**: New Rust crate needed for AMQP (e.g., `lapin`).
- **Docker Compose**: No RabbitMQ container needed (external), but `RABBITMQ_URL` env var must be added.
- **Environment**: New `RABBITMQ_URL` variable required in `.env` and `.env.example`.
