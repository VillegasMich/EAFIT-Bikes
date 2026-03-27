## MODIFIED Requirements

### Requirement: List locations by bicycle ID
The system SHALL expose a GET `/locations/bicycle/:bicycle_id` endpoint that returns all location records for the given `bicycle_id` as a JSON array of `LocationResponse` objects. The `bicycle_id` path parameter SHALL be parsed as an integer. The endpoint SHALL accept an optional query parameter `latest` (boolean, defaults to `false`). When `latest=true`, the endpoint SHALL return only the single most recent location for that bicycle. The response status SHALL be 200. If no records exist for the given bicycle ID, the system SHALL return 200 with an empty array.

#### Scenario: Bicycle has location records (all history)
- **WHEN** the client sends GET `/locations/bicycle/:bicycle_id` with a valid integer that has stored locations and no `latest` parameter
- **THEN** the system responds with 200 and a JSON array containing all `LocationResponse` objects matching that bicycle ID

#### Scenario: Bicycle has location records (latest only)
- **WHEN** the client sends GET `/locations/bicycle/:bicycle_id?latest=true` with a valid integer that has multiple stored locations
- **THEN** the system responds with 200 and a JSON array containing only the single most recent `LocationResponse` for that bicycle

#### Scenario: Bicycle has no location records
- **WHEN** the client sends GET `/locations/bicycle/:bicycle_id` with a valid integer that has no stored locations
- **THEN** the system responds with 200 and an empty JSON array `[]`

#### Scenario: Invalid bicycle ID format
- **WHEN** the client sends GET `/locations/bicycle/:bicycle_id` with a non-integer string
- **THEN** the system responds with 400 Bad Request

### Requirement: LocationResponse struct
The system SHALL define a `LocationResponse` struct with the following fields: `id` (UUID), `bicycle_id` (i32), `latitude` (f64), `longitude` (f64), `updated_at` (DateTime<Utc>). The struct SHALL derive `Serialize` and `Deserialize`. The struct SHALL have `///` documentation comments describing its purpose and fields.

#### Scenario: Serialization matches expected JSON shape
- **WHEN** a `LocationResponse` is serialized to JSON
- **THEN** the output contains keys `id`, `bicycle_id`, `latitude`, `longitude`, `updated_at` with appropriate JSON types (string for UUID/datetime, number for bicycle_id and coordinates)

### Requirement: List all bicycle locations
The system SHALL expose a GET `/locations` endpoint that returns rows from `bicycles_location` as a JSON array of `LocationResponse` objects. Each object SHALL contain `id`, `bicycle_id` (integer), `latitude`, `longitude`, and `updated_at`. The endpoint SHALL accept an optional query parameter `latest` (boolean, defaults to `false`). When `latest=true`, the endpoint SHALL return only the most recent location per bicycle (by `updated_at`). The response status SHALL be 200.

#### Scenario: Locations exist in the database (all history)
- **WHEN** the client sends GET `/locations` without the `latest` query parameter
- **THEN** the system responds with 200 and a JSON array of all `LocationResponse` objects

#### Scenario: Locations exist in the database (latest only)
- **WHEN** the client sends GET `/locations?latest=true` and the database contains multiple location records per bicycle
- **THEN** the system responds with 200 and a JSON array containing only one `LocationResponse` per bicycle (the one with the most recent `updated_at`)

#### Scenario: No locations in the database
- **WHEN** the client sends GET `/locations` and the database contains no location records
- **THEN** the system responds with 200 and an empty JSON array `[]`

#### Scenario: Database unavailable
- **WHEN** the client sends GET `/locations` and the database connection is unavailable
- **THEN** the system responds with 503 Service Unavailable
