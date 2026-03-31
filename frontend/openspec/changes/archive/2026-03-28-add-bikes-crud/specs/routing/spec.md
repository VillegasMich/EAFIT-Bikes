## MODIFIED Requirements

### Requirement: Centralized route configuration
The application SHALL define all routes in a single configuration array. Each route entry SHALL include a path, a display label, and the page component to render. The route configuration SHALL include an entry for the Bikes page at `/bikes` with `showInNav: true`.

#### Scenario: Adding a new page
- **WHEN** a developer adds a new entry to the route configuration array
- **THEN** the new page is accessible at the specified path and a corresponding link appears in the Navbar automatically

#### Scenario: Bikes route is registered
- **WHEN** the application starts
- **THEN** the route configuration SHALL include an entry for `/bikes` labeled "Bikes" that renders the Bikes page component
