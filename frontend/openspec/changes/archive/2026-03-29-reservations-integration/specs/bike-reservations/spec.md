## ADDED Requirements

### Requirement: useReservations custom hook
The system SHALL provide a `useReservations` hook in `src/hooks/useReservations.ts` that fetches all reservations and exposes derived state and operations.

#### Scenario: Hook provides reservation data and operations
- **WHEN** a component calls `useReservations()`
- **THEN** it SHALL return `{ reservations, loading, error, refreshReservations, createReservation, isbikeReserved }`

#### Scenario: Initial fetch on mount
- **WHEN** the hook mounts
- **THEN** it SHALL fetch all reservations from the API via `getReservations()`

#### Scenario: isBikeReserved returns true for active reservation
- **WHEN** `isBikeReserved(bikeId)` is called and the bike has a reservation whose `start_date` is in the past and `end_date` is in the future
- **THEN** it SHALL return `true`

#### Scenario: isBikeReserved returns false for no active reservation
- **WHEN** `isBikeReserved(bikeId)` is called and the bike has no reservation overlapping the current time
- **THEN** it SHALL return `false`

#### Scenario: Refresh after create
- **WHEN** `createReservation(data)` is called via the hook and succeeds
- **THEN** the hook SHALL automatically refetch the reservations list

### Requirement: Reservation modal component
The system SHALL provide a `ReservationModal` component in `src/components/ReservationModal.tsx` that allows a user to create a reservation for a specific bike.

#### Scenario: Modal pre-fills bike ID
- **WHEN** the modal is opened with a `bikeId` prop
- **THEN** the bike ID field SHALL be displayed (read-only) and pre-filled with that value

#### Scenario: User selects start and end datetime
- **WHEN** the modal is open
- **THEN** it SHALL display datetime-local input fields for start date and end date

#### Scenario: Successful reservation creation
- **WHEN** the user fills valid start/end dates and submits the form
- **THEN** the system SHALL call `createReservation`, show a success toast, and call `onSuccess` to trigger a parent refresh

#### Scenario: Conflict error display
- **WHEN** the API returns a 409 conflict response
- **THEN** the modal SHALL display an error toast indicating the bike is already reserved in that time range and SHALL NOT close

#### Scenario: Validation prevents submission
- **WHEN** the user submits the form with an end date that is not after the start date
- **THEN** the form SHALL prevent submission and display a validation message

#### Scenario: Closing the modal
- **WHEN** the user clicks Cancel or the close button
- **THEN** the modal SHALL close without making any API calls
