## ADDED Requirements

### Requirement: Persistent layout shell
The application SHALL render a Navbar at the top, a content area in the middle, and a Footer at the bottom on every page. The content area SHALL display the active page's component.

#### Scenario: User visits any page
- **WHEN** the user navigates to any route in the application
- **THEN** the Navbar, page content, and Footer are all visible on screen

### Requirement: Navbar displays app branding
The Navbar SHALL display the text "EAFIT Bikes" as the application name. Clicking the app name SHALL navigate to the home page.

#### Scenario: User clicks app name
- **WHEN** the user clicks "EAFIT Bikes" in the Navbar
- **THEN** the application navigates to the home page (`/`)

### Requirement: Navbar renders navigation links
The Navbar SHALL render a horizontal list of navigation links derived from the centralized route configuration. The currently active link SHALL be visually distinguished from inactive links.

#### Scenario: Active page is highlighted
- **WHEN** the user is on the Home page
- **THEN** the Home link in the Navbar has a distinct visual style indicating it is active

#### Scenario: Navigation between pages
- **WHEN** the user clicks a navigation link in the Navbar
- **THEN** the page content updates to show the target page without a full browser reload

### Requirement: Navbar includes Login/Register button
The Navbar SHALL display a "Login / Register" button. The button SHALL be visually distinct from navigation links (e.g., styled as a primary button).

#### Scenario: Login button is visible
- **WHEN** the user views any page
- **THEN** a "Login / Register" button is visible in the Navbar

### Requirement: Footer displays branding
The Footer SHALL display copyright text including "EAFIT Bikes" and the current year.

#### Scenario: Footer is visible
- **WHEN** the user views any page
- **THEN** a Footer with copyright information is visible at the bottom of the page
