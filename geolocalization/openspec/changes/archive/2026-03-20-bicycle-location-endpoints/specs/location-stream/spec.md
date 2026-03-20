## ADDED Requirements

### Requirement: Stream all location events via SSE
The system SHALL expose a GET `/locations/stream` endpoint that returns an SSE (`text/event-stream`) response. Each time a new location is inserted (via POST `/locations` or POST `/locations/batch`), the system SHALL push a JSON-serialized `LocationResponse` as an SSE `data` field to all connected clients. The event name SHALL be `location`.

#### Scenario: Client receives new location events
- **WHEN** a client is connected to GET `/locations/stream` and a new location is inserted via POST `/locations`
- **THEN** the client receives an SSE event with `event: location` and `data` containing the `LocationResponse` JSON

#### Scenario: Client receives batch location events
- **WHEN** a client is connected to GET `/locations/stream` and multiple locations are inserted via POST `/locations/batch`
- **THEN** the client receives one SSE event per inserted location

#### Scenario: No inserts while connected
- **WHEN** a client is connected to GET `/locations/stream` and no locations are inserted
- **THEN** the connection remains open with periodic keep-alive comments and no data events are sent

#### Scenario: Database unavailable
- **WHEN** the client sends GET `/locations/stream` and the database connection is unavailable
- **THEN** the system responds with 503 Service Unavailable

### Requirement: Stream location events for a specific bicycle via SSE
The system SHALL expose a GET `/locations/stream/bicycle/:bicycle_id` endpoint that returns an SSE (`text/event-stream`) response. The system SHALL only push events where the `bicycle_id` matches the path parameter. Events for other bicycles SHALL be silently filtered out.

#### Scenario: Client receives matching events only
- **WHEN** a client is connected to GET `/locations/stream/bicycle/:bicycle_id` and locations are inserted for multiple bicycles
- **THEN** the client receives SSE events only for the bicycle matching `:bicycle_id`

#### Scenario: No matching inserts
- **WHEN** a client is connected to GET `/locations/stream/bicycle/:bicycle_id` and locations are inserted for other bicycles only
- **THEN** the client receives no data events (connection stays open with keep-alive)

#### Scenario: Invalid bicycle ID format
- **WHEN** the client sends GET `/locations/stream/bicycle/:bicycle_id` with a non-UUID string
- **THEN** the system responds with 400 Bad Request

### Requirement: Broadcast channel in AppState
The system SHALL add a `tokio::sync::broadcast::Sender<LocationResponse>` to `AppState`. Write handlers SHALL publish each successfully inserted `LocationResponse` to this channel. SSE handlers SHALL subscribe to this channel to receive events. The channel SHALL have a bounded capacity of 256 messages.

#### Scenario: Write handler publishes to channel
- **WHEN** a location is successfully inserted via POST `/locations`
- **THEN** the `LocationResponse` is sent to the broadcast channel

#### Scenario: Slow client falls behind
- **WHEN** a connected SSE client cannot consume events fast enough and the channel buffer overflows
- **THEN** the lagged messages are dropped for that client and the stream continues from the current point
