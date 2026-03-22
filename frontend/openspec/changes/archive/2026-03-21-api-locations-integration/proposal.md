## Why

The frontend needs to consume backend microservices to display real-time bicycle location data. Currently, the map view uses hardcoded data. Establishing an API consumption layer now enables the app to work with live data from the geolocalization microservice, and sets the foundation for integrating additional microservices through a future API gateway.

## What Changes

- Add an Axios-based API client with a configurable base URL via environment variables (`.env`)
- Add TypeScript types for the Locations API request/response shapes
- Add an API service function to call `GET /locations` with the `latest` query parameter
- Add a `.env.example` file documenting required environment variables
- Call the locations endpoint and log the response to the console as a first integration step

## Capabilities

### New Capabilities

- `api-client`: Configurable Axios instance with base URL from environment variables, ready for multi-service gateway migration
- `locations-api`: TypeScript-typed service for consuming the Locations REST API (GET /locations)

### Modified Capabilities

_None — no existing spec-level behavior changes._

## Impact

- **New files**: `.env.example`, `src/api/client.ts`, `src/api/locations.ts`, `src/types/location.ts`
- **Dependencies**: Axios (already installed)
- **Environment**: Requires `VITE_API_BASE_URL` env var (defaults to `http://localhost:8080`)
