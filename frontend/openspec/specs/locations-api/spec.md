## ADDED Requirements

### Requirement: LocationResponse type definition
The system SHALL define a `LocationResponse` TypeScript interface in `src/types/location.ts` matching the API response shape with fields: `id` (string), `bicycle_id` (string), `latitude` (number), `longitude` (number), and `updated_at` (string).

#### Scenario: Type matches API response
- **WHEN** the API returns a location object
- **THEN** it SHALL conform to the `LocationResponse` interface with all five fields

### Requirement: LocationsQueryParams type definition
The system SHALL define a `LocationsQueryParams` TypeScript interface in `src/types/location.ts` with an optional `latest` boolean field.

#### Scenario: Query params typing
- **WHEN** calling the locations service function
- **THEN** the caller MAY pass `{ latest: true }` conforming to `LocationsQueryParams`

### Requirement: GET /locations service function
The system SHALL export an async function from `src/api/locations.ts` that calls `GET /locations` using the shared Axios client and returns a typed array of `LocationResponse`.

#### Scenario: Fetch all locations
- **WHEN** the function is called without parameters
- **THEN** it SHALL send `GET /locations` and return the response data as `LocationResponse[]`

#### Scenario: Fetch latest locations only
- **WHEN** the function is called with `{ latest: true }`
- **THEN** it SHALL send `GET /locations?latest=true` and return the response data as `LocationResponse[]`

### Requirement: Console logging of response
The system SHALL call the `GET /locations` endpoint and log the response to the browser console using `console.log`.

#### Scenario: Response logged to console
- **WHEN** the locations API call completes successfully
- **THEN** the response data SHALL be printed to the browser console
