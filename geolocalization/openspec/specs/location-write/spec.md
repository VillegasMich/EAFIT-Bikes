## ADDED Requirements

### Requirement: Create a single bicycle location
The system SHALL expose a POST `/locations` endpoint that accepts a JSON body matching `CreateLocationRequest` and inserts a new row into `bicycles_location`. On success the system SHALL return 201 with the inserted row as a `LocationResponse`.

#### Scenario: Valid single location creation
- **WHEN** the client sends POST `/locations` with a valid `CreateLocationRequest` body containing `bicycle_id` (integer), `latitude`, and `longitude`
- **THEN** the system inserts the record and responds with 201 and the created `LocationResponse`

#### Scenario: Invalid coordinates in single creation
- **WHEN** the client sends POST `/locations` with latitude outside [-90, 90] or longitude outside [-180, 180]
- **THEN** the system responds with 422 Unprocessable Entity and a descriptive error message

#### Scenario: Missing required fields
- **WHEN** the client sends POST `/locations` with a JSON body missing `bicycle_id`, `latitude`, or `longitude`
- **THEN** the system responds with 422 Unprocessable Entity

#### Scenario: Database unavailable during single creation
- **WHEN** the client sends POST `/locations` and the database connection is unavailable
- **THEN** the system responds with 503 Service Unavailable

### Requirement: Create multiple bicycle locations in batch
The system SHALL expose a POST `/locations/batch` endpoint that accepts a JSON body matching `CreateLocationBatchRequest` (containing a `locations` array of `CreateLocationRequest` items) and inserts all rows in a single database operation. On success the system SHALL return 201 with a JSON array of `LocationResponse` objects for all inserted rows.

#### Scenario: Valid batch location creation
- **WHEN** the client sends POST `/locations/batch` with a valid `CreateLocationBatchRequest` containing multiple entries with integer `bicycle_id` values
- **THEN** the system inserts all records in one operation and responds with 201 and a JSON array of `LocationResponse` objects

#### Scenario: One entry in batch has invalid coordinates
- **WHEN** the client sends POST `/locations/batch` and any entry has latitude outside [-90, 90] or longitude outside [-180, 180]
- **THEN** the system rejects the entire batch and responds with 422 Unprocessable Entity indicating which entry is invalid

#### Scenario: Empty batch array
- **WHEN** the client sends POST `/locations/batch` with an empty `locations` array
- **THEN** the system responds with 422 Unprocessable Entity indicating the batch must not be empty

#### Scenario: Database unavailable during batch creation
- **WHEN** the client sends POST `/locations/batch` and the database connection is unavailable
- **THEN** the system responds with 503 Service Unavailable

### Requirement: CreateLocationRequest struct
The system SHALL define a `CreateLocationRequest` struct with fields: `bicycle_id` (i32), `latitude` (f64), `longitude` (f64). The struct SHALL derive `Deserialize`. The struct SHALL have `///` documentation comments.

#### Scenario: Deserialization from valid JSON
- **WHEN** a JSON object with `bicycle_id` (integer), `latitude` (number), and `longitude` (number) is deserialized
- **THEN** a valid `CreateLocationRequest` is produced

### Requirement: CreateLocationBatchRequest struct
The system SHALL define a `CreateLocationBatchRequest` struct with a single field `locations` of type `Vec<CreateLocationRequest>`. The struct SHALL derive `Deserialize`. The struct SHALL have `///` documentation comments.

#### Scenario: Deserialization from valid JSON
- **WHEN** a JSON object with a `locations` array of valid location entries with integer `bicycle_id` values is deserialized
- **THEN** a valid `CreateLocationBatchRequest` is produced with all entries parsed
