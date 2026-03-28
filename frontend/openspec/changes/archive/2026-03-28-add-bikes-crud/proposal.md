## Why

The frontend currently only supports viewing bike locations on a map but has no way to manage the bike catalog itself. Users need to create, view, update, and delete bikes through the UI, connecting to the existing Bikes microservice running at `localhost:8000`. This closes the gap between the backend CRUD API and the frontend.

## What Changes

- Add a new **Bikes page** with a table listing all bikes (id, marca, tipo, color)
- Add a **Create Bike** form to register new bikes
- Add **Edit Bike** functionality (inline or modal) to update existing bikes
- Add **Delete Bike** action with confirmation
- Add a new `bikes` API service module following the same pattern as `locations.ts`
- Add a `useBikes` hook for fetching and managing bike state
- Add bike-related TypeScript types (`Bike`, `BikeCreate`, `BikeUpdate`)
- Register the new Bikes route in the app navigation
- Configure the Vite dev proxy for `/bikes` to `localhost:8000` (base URL will change when API gateway is added)

## Capabilities

### New Capabilities
- `bikes-api`: API service layer for the Bikes microservice endpoints (CRUD operations)
- `bikes-management`: UI for listing, creating, updating, and deleting bikes (page, components, hook)

### Modified Capabilities
- `routing`: Add the `/bikes` route and navigation entry
- `api-client`: Add proxy configuration for the bikes service base URL

## Impact

- **New files**: `src/api/bikes.ts`, `src/types/bike.ts`, `src/hooks/useBikes.ts`, `src/pages/Bikes.tsx`, plus UI components for the table and forms
- **Modified files**: `src/routes.ts` (new route), `vite.config.ts` (proxy), `.env.example` (bikes API URL)
- **Dependencies**: No new npm packages needed — Axios and React Router are already available
- **API dependency**: Bikes microservice at `localhost:8000` (will move behind API gateway later)
