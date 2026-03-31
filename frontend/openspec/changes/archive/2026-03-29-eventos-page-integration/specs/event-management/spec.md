## ADDED Requirements

### Requirement: Event type definitions
The system SHALL define TypeScript interfaces for Event and related types in `src/types/event.ts`, matching the eventos microservice schema exactly.

#### Scenario: Event type covers all fields
- **WHEN** a developer imports from `src/types/event.ts`
- **THEN** they SHALL have access to `Event`, `EventCreate`, `EventUpdate`, `EventType` (union of "competencia" | "ciclovia" | "ruta_recreativa"), and `EventStatus` (union of "activo" | "finalizado" | "cancelado")

### Requirement: Events API service
The system SHALL provide an API module at `src/api/events.ts` with functions for all event CRUD operations, using a dedicated axios client pointed at `VITE_EVENTS_API_URL`.

#### Scenario: List events
- **WHEN** `getEvents(filters?)` is called with optional `{ tipo, estado, fecha_inicio }` query params
- **THEN** it SHALL return `Promise<Event[]>` from `GET /events`

#### Scenario: Get single event
- **WHEN** `getEvent(id: number)` is called
- **THEN** it SHALL return `Promise<Event>` from `GET /events/:id`

#### Scenario: Create event
- **WHEN** `createEvent(data: EventCreate)` is called
- **THEN** it SHALL POST to `/events` and return `Promise<Event>`

#### Scenario: Update event
- **WHEN** `updateEvent(id: number, data: EventUpdate)` is called
- **THEN** it SHALL PUT to `/events/:id` and return `Promise<Event>`

#### Scenario: Delete event
- **WHEN** `deleteEvent(id: number)` is called
- **THEN** it SHALL DELETE `/events/:id` and return `Promise<void>`

### Requirement: useEvents hook
The system SHALL provide a `useEvents` custom hook at `src/hooks/useEvents.ts` that manages event list state, loading, and error, and exposes CRUD operations.

#### Scenario: Auto-fetch on mount
- **WHEN** a component mounts and uses `useEvents()`
- **THEN** the hook SHALL fetch all events automatically and populate the `events` array

#### Scenario: Create event via hook
- **WHEN** `createEvent(data)` from the hook is called
- **THEN** it SHALL call the API, then refresh the event list, and notify the caller of success or failure

#### Scenario: Update event via hook
- **WHEN** `updateEvent(id, data)` from the hook is called
- **THEN** it SHALL call the API, then refresh the event list

#### Scenario: Delete event via hook
- **WHEN** `deleteEvent(id)` from the hook is called
- **THEN** it SHALL call the API, then refresh the event list

### Requirement: Events page with listing and filtering
The system SHALL provide an Events page at `src/pages/Events.tsx`, accessible at the `/events` route, that displays all events and supports filtering by type and status.

#### Scenario: View event list
- **WHEN** a user navigates to `/events`
- **THEN** the page SHALL display all events with their name, type, status, start date, end date, location, and capacity

#### Scenario: Filter by event type
- **WHEN** a user selects a type filter tab (All / Competencia / Ciclovia / Ruta Recreativa)
- **THEN** only events matching that type SHALL be shown

#### Scenario: Filter by event status
- **WHEN** a user selects a status filter (All / Activo / Finalizado / Cancelado)
- **THEN** only events matching that status SHALL be shown

#### Scenario: Loading state
- **WHEN** events are being fetched
- **THEN** the page SHALL display a loading indicator

#### Scenario: Error state
- **WHEN** the fetch fails
- **THEN** the page SHALL display an error message

### Requirement: Create event form
The Events page SHALL include an inline form to create a new event.

#### Scenario: Submit valid create form
- **WHEN** a user fills in all required fields (nombre, tipo, fecha_inicio, fecha_fin, capacidad_maxima) and submits
- **THEN** the event SHALL be created via the API and appear in the list

#### Scenario: Reject invalid dates
- **WHEN** fecha_fin is before or equal to fecha_inicio
- **THEN** the form SHALL show a validation error and SHALL NOT submit

### Requirement: Edit event inline
The Events page SHALL allow editing an existing event in-place using the same form.

#### Scenario: Populate form for edit
- **WHEN** a user clicks the edit button on an event
- **THEN** the form SHALL populate with the event's current values

#### Scenario: Submit valid edit
- **WHEN** a user modifies fields and submits the edit form
- **THEN** the event SHALL be updated via the API and the list SHALL reflect the changes

### Requirement: Delete event with confirmation
The Events page SHALL require confirmation before deleting an event.

#### Scenario: Confirm delete
- **WHEN** a user clicks delete and confirms
- **THEN** the event SHALL be removed via the API and disappear from the list

#### Scenario: Cancel delete
- **WHEN** a user clicks delete but cancels
- **THEN** no deletion SHALL occur and the list SHALL remain unchanged

### Requirement: Route and navigation registration
The `/events` route SHALL be registered in the application router, and a navigation link SHALL be added so users can reach the page.

#### Scenario: Navigate to events
- **WHEN** a user clicks the Events navigation link
- **THEN** they SHALL be taken to `/events` and see the Events page
