## Context

The frontend already integrates two backend services (bikes via `VITE_API_BASE_URL` and reservations via `VITE_RESERVATIONS_API_URL`), each with their own axios client, typed API module, custom hook, and page component. The eventos microservice runs separately at its own port with a REST API at `/events`. The pattern is established and consistent enough to replicate directly.

## Goals / Non-Goals

**Goals:**
- Introduce a dedicated axios client for the eventos service (separate base URL)
- Provide full CRUD for events matching the pattern of `bikes.ts` / `useBikes.ts` / `Bikes.tsx`
- Expose enrollment actions (list, enroll, cancel) accessible from the events page
- Add a `/events` route and navigation entry

**Non-Goals:**
- Authentication/authorization on the events service (not implemented in the microservice)
- Pagination (the API returns full arrays; no pagination contract exists)
- Real-time updates or polling for events
- Conflict resolution UI beyond what bikes page already does for reservations

## Decisions

### 1. Separate axios client for eventos
**Decision:** Add `src/api/eventsClient.ts` with `VITE_EVENTS_API_URL` (default `http://localhost:3000`), mirroring `reservationsClient.ts`.
**Why:** The eventos service runs on a different port/host than the main API gateway. A shared client would require routing config changes; a separate client is simpler and consistent with the reservations pattern.
**Alternative considered:** Route through the main API gateway — rejected because no gateway proxy is configured yet and would add infra scope.

### 2. Single page for events + inline enrollment panel
**Decision:** `Events.tsx` shows the event list with an expandable enrollment panel per event row, rather than a separate `/events/:id/enrollments` route.
**Why:** The bikes page uses inline modals for reservations. Staying consistent reduces navigation complexity for a student project. Enrollment data is small (no pagination needed).
**Alternative considered:** Separate enrollment page at `/events/:id` — rejected as over-engineering for current scope.

### 3. Two hooks: `useEvents` and `useEnrollments`
**Decision:** Split state management into two hooks, where `useEnrollments(eventId)` is scoped to a single event.
**Why:** Event CRUD and per-event enrollment are independent concerns. A single monolithic hook would be hard to reuse. `useEnrollments` accepts an `eventId` param and fetches only when an event is selected, avoiding N+1 fetches on page load.

### 4. Hardcode `user_id` as a static UUID for enrollment
**Decision:** For enrollment creation, use the authenticated user's Firebase UID from `useAuth()`.
**Why:** The enrollment schema requires `user_id: string (UUID format)`. Firebase UIDs are string identifiers and available through the existing auth context — no extra work needed.

## Risks / Trade-offs

- **Port mismatch at runtime** → The default `http://localhost:3000` may conflict with other local services. Mitigation: document in `.env.example` and let developers override via `VITE_EVENTS_API_URL`.
- **No optimistic updates** → Create/update/delete waits for server confirmation before re-fetching. UX feels slightly slower but avoids stale state bugs. Acceptable given project scope.
- **Enrollment uniqueness enforced server-side only** → If a user double-clicks "Enroll", two requests may fire. Mitigation: disable the enroll button during submission (same pattern as bikes page).
