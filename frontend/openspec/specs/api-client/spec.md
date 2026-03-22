## ADDED Requirements

### Requirement: Configurable API base URL
The system SHALL read the API base URL from the `VITE_API_BASE_URL` environment variable. If the variable is not set, the system SHALL default to `http://localhost:8080`.

#### Scenario: Custom base URL via environment variable
- **WHEN** `VITE_API_BASE_URL` is set to `http://api.example.com`
- **THEN** all API requests SHALL use `http://api.example.com` as the base URL

#### Scenario: Default base URL when env var is absent
- **WHEN** `VITE_API_BASE_URL` is not set
- **THEN** all API requests SHALL use `http://localhost:8080` as the base URL

### Requirement: Shared Axios instance
The system SHALL export a single, pre-configured Axios instance from `src/api/client.ts`. All API service modules MUST use this shared instance for HTTP requests.

#### Scenario: Service modules use shared client
- **WHEN** a service module makes an API call
- **THEN** it SHALL use the exported Axios instance from `src/api/client.ts`

### Requirement: Environment variable documentation
The repository SHALL include a `.env.example` file listing `VITE_API_BASE_URL` with a descriptive comment and default value.

#### Scenario: Developer onboarding
- **WHEN** a new developer clones the repository
- **THEN** they SHALL find a `.env.example` file documenting `VITE_API_BASE_URL=http://localhost:8080`
