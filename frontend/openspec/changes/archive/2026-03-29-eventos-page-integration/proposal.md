## Why

The eventos microservice exposes a full events and enrollments API, but the frontend has no UI for it. Users cannot view, create, update, or delete cycling events, nor enroll in them, making the feature invisible despite the backend being ready.

## What Changes

- Add `src/types/event.ts` — TypeScript types for Event and Enrollment models
- Add `src/api/events.ts` — Axios-based API service for all events and enrollments endpoints
- Add `src/hooks/useEvents.ts` — Custom hook for event CRUD state management
- Add `src/hooks/useEnrollments.ts` — Custom hook for enrollment state management
- Add `src/pages/Events.tsx` — Full page with event listing, filtering, and CRUD form
- Update `src/App.tsx` (or router config) — Register the new `/events` route and add nav link

## Capabilities

### New Capabilities
- `event-management`: CRUD operations for cycling events (list, create, update, delete) with type/status filtering
- `event-enrollment`: View enrollments per event, enroll a user, and cancel an enrollment

### Modified Capabilities
<!-- None -->

## Impact

- **New env variable**: `VITE_EVENTS_API_URL` for the eventos microservice base URL (defaults to `http://localhost:3000`)
- **New files**: `src/types/event.ts`, `src/api/events.ts`, `src/hooks/useEvents.ts`, `src/hooks/useEnrollments.ts`, `src/pages/Events.tsx`
- **Modified files**: Router config and navigation component to expose the new page
- **No breaking changes** to existing bikes or reservations features
