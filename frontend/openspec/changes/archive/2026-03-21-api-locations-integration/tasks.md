## 1. Environment Configuration

- [x] 1.1 Create `.env.example` file with `VITE_API_BASE_URL=http://localhost:8080` and a descriptive comment

## 2. API Client Setup

- [x] 2.1 Create `src/api/client.ts` with a shared Axios instance configured with `baseURL` from `import.meta.env.VITE_API_BASE_URL`, defaulting to `http://localhost:8080`

## 3. Type Definitions

- [x] 3.1 Create `src/types/location.ts` with `LocationResponse` interface (`id`, `bicycle_id`, `latitude`, `longitude`, `updated_at`)
- [x] 3.2 Add `LocationsQueryParams` interface with optional `latest` boolean field

## 4. Locations API Service

- [x] 4.1 Create `src/api/locations.ts` with an async `getLocations(params?: LocationsQueryParams)` function that calls `GET /locations` using the shared client and returns `LocationResponse[]`

## 5. Console Integration

- [x] 5.1 Call `getLocations()` from an existing page or hook and `console.log` the response to verify the integration

## 6. Verification & Documentation

- [x] 6.1 Run `npm run lint` to verify no TypeScript or linting errors
- [x] 6.2 Update `CLAUDE.md` if any new commands or architecture notes are needed
