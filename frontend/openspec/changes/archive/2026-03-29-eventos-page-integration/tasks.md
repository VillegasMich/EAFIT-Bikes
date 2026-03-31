## 1. Types and Environment

- [x] 1.1 Add `VITE_EVENTS_API_URL` to `.env.example` with default `http://localhost:3000`
- [x] 1.2 Create `src/types/event.ts` with `EventType`, `EventStatus`, `Event`, `EventCreate`, `EventUpdate`, `Enrollment`, `EnrollmentCreate` interfaces

## 2. API Layer

- [x] 2.1 Create `src/api/eventsClient.ts` — axios instance using `VITE_EVENTS_API_URL`
- [x] 2.2 Create `src/api/events.ts` with `getEvents`, `getEvent`, `createEvent`, `updateEvent`, `deleteEvent` functions
- [x] 2.3 Add `getEnrollments`, `createEnrollment`, `cancelEnrollment` functions to `src/api/events.ts`

## 3. Custom Hooks

- [x] 3.1 Create `src/hooks/useEvents.ts` — manages `events[]`, `loading`, `error`, and exposes `createEvent`, `updateEvent`, `deleteEvent`, `refreshEvents`
- [x] 3.2 Create `src/hooks/useEnrollments.ts` — accepts `eventId: number | null`, manages `enrollments[]`, `loading`, `error`, and exposes `enroll`, `cancel`

## 4. Events Page

- [x] 4.1 Create `src/pages/Events.tsx` with event list table showing nombre, tipo, estado, fecha_inicio, fecha_fin, ubicacion, and capacity count
- [x] 4.2 Add type filter tabs (All / Competencia / Ciclovia / Ruta Recreativa) and status filter to the Events page
- [x] 4.3 Add create/edit inline form with fields: nombre, descripcion, tipo, fecha_inicio, fecha_fin, ubicacion, capacidad_maxima; include client-side date validation
- [x] 4.4 Add delete button with confirmation dialog on each event row
- [x] 4.5 Add expandable enrollment panel per event row: list confirmed enrollments, Enroll button (uses Firebase UID), Cancel button per enrollment row
- [x] 4.6 Wire enrollment error messages to the notification system for "event full", "already enrolled", and "event inactive" cases

## 5. Routing and Navigation

- [x] 5.1 Register `/events` route in the application router pointing to `Events.tsx`
- [x] 5.2 Add "Events" navigation link in the nav component alongside existing Bikes/Map links

## 6. Verification and Documentation

- [x] 6.1 Run `npm run lint` and fix any TypeScript/ESLint errors
- [x] 6.2 Update `.env.example` comments to document the three service env vars together
