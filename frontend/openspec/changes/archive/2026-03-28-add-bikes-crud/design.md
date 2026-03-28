## Context

The frontend currently connects to the Geolocalization microservice (`localhost:8080`) for bike location data. A separate Bikes microservice runs at `localhost:8000` and exposes a REST API for CRUD operations on the bike catalog. The frontend has no UI for managing bikes — only for viewing them on a map.

The existing codebase follows a clean pattern: `pages/` → `hooks/` → `api/` → backend, with types in `types/`. The Bikes feature will replicate this pattern exactly.

## Goals / Non-Goals

**Goals:**
- Full CRUD UI for bikes: list (table), create, update, delete
- Follow existing architectural patterns (API module, custom hook, page component)
- Keep the bikes API base URL configurable for future API gateway migration
- Integrate into existing navigation

**Non-Goals:**
- Bike availability/reservation status (owned by reservations microservice)
- Real-time updates or polling for the bikes list (simple fetch-on-load + refetch after mutations)
- Authentication or authorization
- Pagination or filtering of the bikes table (can be added later)

## Decisions

### 1. Separate environment variable for Bikes API

The Bikes service runs on a different port (`8000`) than the Geolocalization service (`8080`). Rather than routing both through a single base URL, we'll add `VITE_BIKES_API_BASE_URL` and a second Axios instance or use the Vite dev proxy to route `/bikes` to `localhost:8000`.

**Decision**: Use the Vite dev proxy to forward `/bikes` requests to `localhost:8000`. The existing Axios client (with empty base URL) will work for both services in dev since the proxy handles routing. Add `VITE_BIKES_API_BASE_URL` to `.env.example` for documentation but primarily rely on the proxy during development.

**Rationale**: This mirrors how `/locations` is already proxied. When the API gateway arrives, only the proxy/env config changes — no code changes needed.

### 2. State management approach

**Decision**: A `useBikes` custom hook that fetches the bike list on mount and exposes mutation functions (`createBike`, `updateBike`, `deleteBike`) that refetch the list after success.

**Rationale**: This matches the `usePollingLocations` pattern. No polling needed here since bikes change infrequently — just fetch on mount and refetch after mutations.

### 3. UI layout for CRUD operations

**Decision**: Single Bikes page with a table and action buttons. Create/Edit via a modal or inline form above the table. Delete via a confirmation dialog.

**Rationale**: Keeps all bike management in one place. No need for separate routes per operation given the small data model (4 fields).

### 4. Bike type enum handling

**Decision**: Define the `BikeType` enum (`Cross`, `Mountain bike`, `Ruta`) in TypeScript types and use a `<select>` dropdown in forms.

**Rationale**: The backend enforces these values; the frontend should match them exactly.

## Risks / Trade-offs

- **[Different base URLs]** → Mitigated by Vite proxy in dev; API gateway will unify in production.
- **[No optimistic updates]** → Mutations refetch the full list. Acceptable for the small dataset size expected.
- **[No pagination]** → If the bike catalog grows large, the table will need pagination. Acceptable for MVP; can be added as a separate change.
