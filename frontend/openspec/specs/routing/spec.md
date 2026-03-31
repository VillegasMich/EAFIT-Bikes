### Requirement: Centralized route configuration
The application SHALL define all routes in a single configuration array. Each route entry SHALL include a path, a display label, and the page component to render. The route configuration SHALL include an entry for the Bikes page at `/bikes` with `showInNav: true`.

#### Scenario: Adding a new page
- **WHEN** a developer adds a new entry to the route configuration array
- **THEN** the new page is accessible at the specified path and a corresponding link appears in the Navbar automatically

#### Scenario: Bikes route is registered
- **WHEN** the application starts
- **THEN** the route configuration SHALL include an entry for `/bikes` labeled "Bikes" that renders the Bikes page component

### Requirement: Client-side routing
The application SHALL use React Router for client-side navigation. Page transitions SHALL NOT trigger full browser reloads.

#### Scenario: Client-side navigation
- **WHEN** the user clicks a Navbar link
- **THEN** the URL updates and the page content changes without a full page reload

### Requirement: Home page as default route
The application SHALL render the Home page component when the user navigates to the root path (`/`).

#### Scenario: Root path loads Home
- **WHEN** the user navigates to `/`
- **THEN** the Home page is displayed

### Requirement: Unknown routes handled gracefully
The application SHALL display a fallback message or redirect when the user navigates to an undefined route.

#### Scenario: User visits unknown path
- **WHEN** the user navigates to a path not defined in the route configuration
- **THEN** the application displays a "Page not found" message within the layout shell
