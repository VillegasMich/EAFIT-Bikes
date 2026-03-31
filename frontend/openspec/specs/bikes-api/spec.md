### Requirement: Bikes API service module
The system SHALL provide a `src/api/bikes.ts` module that exports functions for all Bikes microservice CRUD operations. All functions MUST use the shared Axios instance from `src/api/client.ts`.

#### Scenario: Module exports all CRUD functions
- **WHEN** a developer imports from `src/api/bikes.ts`
- **THEN** the following functions SHALL be available: `getBikes`, `getBike`, `createBike`, `updateBike`, `deleteBike`

### Requirement: List all bikes
The system SHALL export a `getBikes()` function that sends a `GET` request to `/bikes` and returns an array of `Bike` objects.

#### Scenario: Fetching all bikes successfully
- **WHEN** `getBikes()` is called
- **THEN** it SHALL send a GET request to `/bikes` and return the response data as `Bike[]`

### Requirement: Get a single bike
The system SHALL export a `getBike(id: number)` function that sends a `GET` request to `/bikes/{id}` and returns a single `Bike` object.

#### Scenario: Fetching a bike by ID
- **WHEN** `getBike(3)` is called
- **THEN** it SHALL send a GET request to `/bikes/3` and return the response data as `Bike`

### Requirement: Create a bike
The system SHALL export a `createBike(data: BikeCreate)` function that sends a `POST` request to `/bikes` with the bike data as the request body and returns the created `Bike`.

#### Scenario: Creating a new bike
- **WHEN** `createBike({ marca: "Trek", tipo: "Ruta", color: "Red" })` is called
- **THEN** it SHALL send a POST request to `/bikes` with the provided data and return the created `Bike`

### Requirement: Update a bike
The system SHALL export an `updateBike(id: number, data: BikeUpdate)` function that sends a `PUT` request to `/bikes/{id}` with the updated data and returns the updated `Bike`.

#### Scenario: Updating an existing bike
- **WHEN** `updateBike(3, { color: "Blue" })` is called
- **THEN** it SHALL send a PUT request to `/bikes/3` with the provided data and return the updated `Bike`

### Requirement: Delete a bike
The system SHALL export a `deleteBike(id: number)` function that sends a `DELETE` request to `/bikes/{id}`.

#### Scenario: Deleting a bike
- **WHEN** `deleteBike(3)` is called
- **THEN** it SHALL send a DELETE request to `/bikes/3`

### Requirement: Bike TypeScript types
The system SHALL define the following types in `src/types/bike.ts`:
- `BikeType`: enum or union type with values `"Cross"`, `"Mountain bike"`, `"Ruta"`
- `Bike`: object with fields `id` (number), `marca` (string), `tipo` (BikeType), `color` (string)
- `BikeCreate`: object with fields `marca` (string), `tipo` (BikeType), `color` (string)
- `BikeUpdate`: partial object with optional fields `marca`, `tipo`, `color`

#### Scenario: Type definitions are importable
- **WHEN** a developer imports `Bike`, `BikeCreate`, `BikeUpdate`, `BikeType` from `src/types/bike.ts`
- **THEN** all types SHALL be available and enforce the correct field shapes
