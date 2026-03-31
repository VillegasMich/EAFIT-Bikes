### Requirement: Reservations Axios client
The system SHALL provide a dedicated Axios instance for the reservations microservice, configured from the `VITE_RESERVATIONS_API_URL` environment variable, defaulting to `http://localhost:8000`.

#### Scenario: Client uses correct base URL
- **WHEN** `VITE_RESERVATIONS_API_URL` is set in the environment
- **THEN** all reservations API calls SHALL use that value as the base URL

#### Scenario: Client falls back to default
- **WHEN** `VITE_RESERVATIONS_API_URL` is not set
- **THEN** all reservations API calls SHALL use `http://localhost:8000` as the base URL

### Requirement: Reservation TypeScript types
The system SHALL define TypeScript types in `src/types/reservation.ts` for all reservation-related data shapes used by the API.

#### Scenario: ReservationResponse type covers all API fields
- **WHEN** the reservations API returns a reservation object
- **THEN** it SHALL be assignable to `ReservationResponse` which includes `id`, `bike_id`, `user_id`, `start_date`, `end_date`, `created_at`, and `updated_at`

#### Scenario: ReservationCreate type covers required create fields
- **WHEN** a component calls the create reservation function
- **THEN** the payload SHALL conform to `ReservationCreate` which requires `bike_id`, `user_id`, `start_date`, and `end_date`

#### Scenario: ConflictResponse type covers 409 response shape
- **WHEN** the API returns a 409 conflict response
- **THEN** it SHALL be assignable to `ConflictResponse` which includes `status`, `message`, `bike_id`, `requested_start`, `requested_end`, and `conflicting_reservations`

### Requirement: Reservations API service functions
The system SHALL provide `src/api/reservations.ts` with service functions for all required reservation operations, using the reservations Axios client.

#### Scenario: Get all reservations
- **WHEN** `getReservations()` is called
- **THEN** it SHALL make a GET request to `/reservations` and return an array of `ReservationResponse`

#### Scenario: Get reservations by bike
- **WHEN** `getReservationsByBike(bikeId)` is called
- **THEN** it SHALL make a GET request to `/reservations/bike/{bikeId}` and return an array of `ReservationResponse`

#### Scenario: Create a reservation
- **WHEN** `createReservation(data)` is called with a valid `ReservationCreate` payload
- **THEN** it SHALL make a POST request to `/reservations` and return the created `ReservationResponse`

#### Scenario: Create reservation conflict
- **WHEN** `createReservation(data)` is called and the server responds with 409
- **THEN** the function SHALL throw an error that includes the conflict details so the caller can display them
