## ADDED Requirements

### Requirement: Enrollment type definitions
The system SHALL extend `src/types/event.ts` with TypeScript interfaces for Enrollment, matching the eventos microservice schema.

#### Scenario: Enrollment type covers all fields
- **WHEN** a developer imports `Enrollment` and `EnrollmentCreate` from `src/types/event.ts`
- **THEN** they SHALL have access to all fields: `id`, `event_id`, `user_id`, `fecha_inscripcion`, `estado` ("confirmado" | "cancelado"), `createdAt`, `updatedAt`

### Requirement: Enrollments API service
The system SHALL add enrollment functions to `src/api/events.ts` for listing, creating, and cancelling enrollments.

#### Scenario: List enrollments for an event
- **WHEN** `getEnrollments(eventId: number)` is called
- **THEN** it SHALL return `Promise<Enrollment[]>` from `GET /events/:eventId/enrollments`

#### Scenario: Enroll a user
- **WHEN** `createEnrollment(eventId: number, data: EnrollmentCreate)` is called with `{ user_id }`
- **THEN** it SHALL POST to `/events/:eventId/enrollments` and return `Promise<Enrollment>`

#### Scenario: Cancel an enrollment
- **WHEN** `cancelEnrollment(eventId: number, enrollmentId: number)` is called
- **THEN** it SHALL DELETE `/events/:eventId/enrollments/:id` and return `Promise<Enrollment>`

### Requirement: useEnrollments hook
The system SHALL provide a `useEnrollments(eventId: number | null)` hook at `src/hooks/useEnrollments.ts` that fetches enrollments only when an event is selected.

#### Scenario: Fetch on event selection
- **WHEN** `eventId` is a non-null number
- **THEN** the hook SHALL fetch enrollments for that event automatically

#### Scenario: No fetch when no event selected
- **WHEN** `eventId` is null
- **THEN** the hook SHALL NOT make any API call and `enrollments` SHALL be an empty array

#### Scenario: Enroll user via hook
- **WHEN** `enroll(userId: string)` is called on the hook
- **THEN** it SHALL call the API with the current `eventId` and refresh the enrollment list

#### Scenario: Cancel enrollment via hook
- **WHEN** `cancel(enrollmentId: number)` is called on the hook
- **THEN** it SHALL call the API and refresh the enrollment list

### Requirement: Enrollment panel in Events page
The Events page SHALL display an expandable enrollment section for each event row, showing current enrollments and an enroll/cancel UI.

#### Scenario: Expand enrollment panel
- **WHEN** a user clicks "View Enrollments" on an event row
- **THEN** an enrollment panel SHALL expand inline showing the list of confirmed enrollments for that event

#### Scenario: Enroll current user
- **WHEN** a user clicks "Enroll" in the enrollment panel
- **THEN** the system SHALL call the enroll API using the current user's Firebase UID as `user_id` and the enrollment SHALL appear in the list

#### Scenario: Cancel enrollment
- **WHEN** a user clicks "Cancel" on an enrollment row
- **THEN** the enrollment SHALL be cancelled via the API and the row SHALL update its status

#### Scenario: Handle enrollment errors
- **WHEN** enrollment fails (event full, already enrolled, event inactive)
- **THEN** the page SHALL show an error notification with a human-readable message

#### Scenario: Capacity display
- **WHEN** viewing an event
- **THEN** the page SHALL show current confirmed enrollment count vs. `capacidad_maxima`
