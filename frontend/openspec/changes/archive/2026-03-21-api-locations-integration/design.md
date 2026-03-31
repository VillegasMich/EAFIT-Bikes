## Context

The EAFIT-Bikes frontend currently has no API consumption layer. The map view exists but uses no live data. A geolocalization microservice is available at `localhost:8080` exposing a Locations REST API. The project already includes Axios as a dependency. The architecture in `CLAUDE.md` defines the planned data flow as `pages/ → hooks/ → api/ → backend`, with types centralized in `types/`.

In the future, multiple microservices will sit behind an API gateway. The API client design must make switching the base URL trivial.

## Goals / Non-Goals

**Goals:**
- Establish a reusable, configurable Axios client instance with base URL driven by `VITE_API_BASE_URL`
- Type the Locations API response and request shapes in `src/types/`
- Create a service function to call `GET /locations` with optional `latest` query parameter
- Log the API response to the console as a first integration proof
- Provide `.env.example` for developer onboarding

**Non-Goals:**
- Consuming POST endpoints (single or batch location creation)
- Consuming `GET /locations/bicycle/:bicycle_id`
- Error UI handling (errors will only be logged to console for now)
- Authentication or authorization headers
- API gateway integration (future work)
- Caching or retry logic

## Decisions

### 1. Single Axios instance in `src/api/client.ts`

Create one shared Axios instance configured with `baseURL` from `import.meta.env.VITE_API_BASE_URL`. All service modules import this instance.

**Rationale**: When the API gateway is introduced, only the base URL changes — no service code needs modification. A single instance also allows adding interceptors (auth headers, error logging) in one place later.

**Alternative considered**: Passing the URL directly in each API call — rejected because it scatters configuration and makes gateway migration harder.

### 2. Environment variable via Vite's `import.meta.env`

Use `VITE_API_BASE_URL` with a default fallback to `http://localhost:8080`.

**Rationale**: Vite natively exposes `VITE_`-prefixed env vars at build time. No extra tooling needed. The fallback ensures the app works without a `.env` file during local development.

### 3. Types in `src/types/location.ts`

Define `LocationResponse` (API response shape) and `LocationsQueryParams` (query parameters) as TypeScript interfaces.

**Rationale**: Follows the project's existing architecture where types are centralized in `src/types/`. Keeps API layer and components decoupled from raw JSON shapes.

### 4. Console logging as initial integration

The first integration step will call the API in a component/hook and `console.log` the response.

**Rationale**: Validates the full data flow (env → client → service → response) without coupling to UI. Map integration will come in a subsequent change.

## Risks / Trade-offs

- **[CORS]** The backend at `localhost:8080` must allow requests from `localhost:5173`. → Mitigation: This is a backend configuration concern; if blocked, Vite's proxy can be used as a temporary workaround.
- **[No error UI]** API failures will only appear in the console. → Acceptable for this initial integration phase; error handling UI will be added later.
- **[Hardcoded default port]** The fallback `localhost:8080` assumes the default backend port. → Mitigated by `.env` override and `.env.example` documentation.
