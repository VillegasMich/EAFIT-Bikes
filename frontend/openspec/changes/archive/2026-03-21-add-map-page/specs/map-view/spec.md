## ADDED Requirements

### Requirement: Map page displays interactive Leaflet map
The application SHALL render an interactive Leaflet map on the `/map` route using OpenStreetMap tiles. The map SHALL be centered on EAFIT University in Medellín, Colombia (latitude 6.2006, longitude -75.5783) at zoom level 15.

#### Scenario: User navigates to map page
- **WHEN** user navigates to `/map`
- **THEN** an interactive Leaflet map is displayed centered on EAFIT University (6.2006, -75.5783) with zoom level 15

#### Scenario: Map tiles load from OpenStreetMap
- **WHEN** the map page renders
- **THEN** map tiles SHALL be loaded from the OpenStreetMap tile server

#### Scenario: Map supports interaction
- **WHEN** user interacts with the map (pan, zoom)
- **THEN** the map SHALL respond to pan and zoom gestures

### Requirement: EAFIT University marker is displayed
The map SHALL display a blue marker at the EAFIT University location with a popup label.

#### Scenario: Marker visible on map load
- **WHEN** the map page renders
- **THEN** a blue marker is displayed at EAFIT University coordinates (6.2006, -75.5783)

#### Scenario: Marker popup shows university name
- **WHEN** user clicks the EAFIT University marker
- **THEN** a popup is displayed with the text "EAFIT University"

### Requirement: Map fills available content area
The map container SHALL expand to fill all available vertical space between the Navbar and Footer components.

#### Scenario: Map uses full content height
- **WHEN** the map page is displayed
- **THEN** the map container fills the entire area between navbar and footer with no extra padding or margins

### Requirement: Map is accessible from navbar
The navbar SHALL include a "Map" link that navigates to the `/map` route. The link SHALL follow the same styling pattern as other navbar links (active/inactive states).

#### Scenario: Map link appears in navbar
- **WHEN** any page is displayed
- **THEN** the navbar contains a "Map" navigation link

#### Scenario: Map link shows active state
- **WHEN** user is on the `/map` page
- **THEN** the "Map" navbar link SHALL display with the active style (font-semibold, text-blue-600)

#### Scenario: Clicking map link navigates to map page
- **WHEN** user clicks the "Map" link in the navbar
- **THEN** the application navigates to `/map` and displays the map page
