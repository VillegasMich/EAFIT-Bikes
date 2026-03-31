## MODIFIED Requirements

### Requirement: Environment variable documentation
The repository SHALL include a `.env.example` file listing `VITE_API_BASE_URL` with a descriptive comment and default value. The `.env.example` file SHALL also document `VITE_BIKES_API_BASE_URL` with a default value of `http://localhost:8000`.

#### Scenario: Developer onboarding
- **WHEN** a new developer clones the repository
- **THEN** they SHALL find a `.env.example` file documenting `VITE_API_BASE_URL=http://localhost:8080` and `VITE_BIKES_API_BASE_URL=http://localhost:8000`

## ADDED Requirements

### Requirement: Vite dev proxy for bikes service
The Vite dev server SHALL proxy requests matching `/bikes` to the Bikes microservice base URL (default `http://localhost:8000`).

#### Scenario: Proxying bikes API requests in development
- **WHEN** the dev server receives a request to `/bikes` or `/bikes/{id}`
- **THEN** it SHALL forward the request to `http://localhost:8000` (or the configured bikes base URL)
