## Context

The frontend already integrates with a bikes microservice (`src/api/bikes.ts`, `src/api/client.ts`). A new, separate reservations microservice is available at a different base URL. The reservations service manages time-slot reservations per bike and exposes REST endpoints documented in the reservations README. The Bikes page (`src/pages/Bikes.tsx`) currently shows a plain table with CRUD actions; it has no concept of availability or reservation state.

## Goals / Non-Goals

**Goals:**
- Add a dedicated Axios client / API module for the reservations microservice
- Add TypeScript types for all reservation response and request shapes
- Add a `useReservations` hook to fetch and cross-reference reservation data with bikes
- Extend the Bikes page table with a status badge (Reserved / Available), a "Reserve" action button, filter tabs (All / Reserved / Available), and a reservation modal
- Surface conflict and validation errors from the reservations API as toast notifications

**Non-Goals:**
- Viewing or editing existing reservations for a user (no My Reservations page in this change)
- Admin-level reservation management (cancel / delete reservations)
- Real-time polling of reservation state (one-time fetch on page load + refresh after create is sufficient)

## Decisions

### 1. Separate Axios client for reservations service

**Decision:** Add a `VITE_RESERVATIONS_API_URL` env var and create `src/api/reservationsClient.ts` (similar to `src/api/client.ts`).

**Rationale:** The reservations service runs on a different host/port than the main backend. Reusing the existing `client.ts` would require parameterising the base URL or adding a second instance anyway; a dedicated, small client file is cleaner and consistent with how `client.ts` is currently used.

**Alternative considered:** Single client with dynamic base URL per request — rejected because it muddies the abstraction and makes it harder to add per-service auth headers later.

### 2. Derive "reserved" status on the frontend by comparing dates

**Decision:** Fetch all reservations for all visible bikes via `GET /reservations` (or per-bike calls), then compute "currently reserved" on the client: a bike is *reserved* if any of its reservations has `start_date ≤ now ≤ end_date`.

**Rationale:** The API does not expose a `/bikes/available` convenience endpoint; querying `GET /reservations` once is simpler than N per-bike calls and avoids waterfall loading.

**Alternative considered:** `GET /reservations/bike/{bike_id}` per bike — rejected because it creates N parallel fetches; a single `GET /reservations` is cheaper.

### 3. ReservationModal as a controlled component

**Decision:** `ReservationModal` receives `bikeId`, `userId`, `onClose`, and `onSuccess` props. It owns its own form state and calls `createReservation` directly, then calls `onSuccess` so the parent can trigger a refresh.

**Rationale:** Keeps the modal self-contained and testable without needing to lift all form state into the Bikes page, consistent with how the edit/create form is handled today.

### 4. `user_id` sourced from Firebase auth

**Decision:** Read `user.uid` from `AuthContext` and pass it as `user_id` when creating reservations.

**Rationale:** Consistent with how other parts of the app identify the current user. No additional user-profile API is needed.

### 5. Filter tabs implemented as local state, not URL params

**Decision:** Active tab (`All` / `Reserved` / `Available`) is component-level state in `Bikes.tsx`, not reflected in the URL.

**Rationale:** The Bikes page doesn't currently use URL search params anywhere; adding them just for tabs is disproportionate scope for this change.

## Risks / Trade-offs

- **Stale reservation data** → Mitigation: Refresh reservation list after every successful create; add a manual refresh button if needed in a future change.
- **VITE_RESERVATIONS_API_URL not set** → Mitigation: Default to `http://localhost:8000` (the reservations service default port) with a console warning on startup.
- **Conflict (409) response shape differs from other errors** → Mitigation: Handle the 409 case explicitly in `createReservation` and surface the `conflicting_reservations` count in the toast message.
- **Bikes table grows wide** → Mitigation: The new Status column uses a compact badge; Reserve button reuses the existing Actions column space.

## Migration Plan

1. Add `VITE_RESERVATIONS_API_URL` to `.env.example` (no breaking change — old deployments fall back to default)
2. Ship new files (`reservationsClient.ts`, `reservations.ts`, `reservation.ts`, `useReservations.ts`, `ReservationModal.tsx`)
3. Update `Bikes.tsx` — additive changes only (new column, new tab bar, new modal)
4. No database migrations or backend changes required

## Open Questions

- Should the filter tabs also account for *past* reservations (e.g., a bike with only historical reservations would show as Available)? **Assumption:** yes — only active/future reservations count for the "Reserved" status.
- Does `user_id` in the reservations service match Firebase UID? **Assumption:** yes, consistent with existing auth sync pattern.
