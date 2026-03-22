## MODIFIED Requirements

### Requirement: Interactive Leaflet map centered on EAFIT
The Map page SHALL display an interactive Leaflet map centered on EAFIT University (6.2006, -75.5783) with OpenStreetMap tiles. The map SHALL display the static EAFIT marker AND dynamic bike markers from the polling hook.

#### Scenario: Map displays both static and dynamic markers
- **WHEN** the Map page loads and the polling hook returns bike locations
- **THEN** the map SHALL show the EAFIT University marker AND one marker per bike at its reported coordinates

#### Scenario: Map with no bike data
- **WHEN** the polling hook has not yet returned data or returns an empty array
- **THEN** the map SHALL still display the EAFIT University marker
