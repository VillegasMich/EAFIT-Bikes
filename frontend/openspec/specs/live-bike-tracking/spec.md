## Requirements

### Requirement: Poll locations API every 5 seconds
The system SHALL fetch `GET /locations` with query parameter `latest=true` every 5 seconds using a custom hook (`usePollingLocations`). The hook SHALL start polling on mount and stop on unmount.

#### Scenario: Initial fetch on mount
- **WHEN** the Map page mounts
- **THEN** the hook SHALL immediately fetch `/locations?latest=true` and return the locations

#### Scenario: Recurring poll
- **WHEN** 5 seconds have elapsed since the last fetch
- **THEN** the hook SHALL fetch `/locations?latest=true` again and update the returned locations

#### Scenario: Cleanup on unmount
- **WHEN** the Map page unmounts
- **THEN** the polling interval SHALL be cleared and no further requests SHALL be made

### Requirement: Deduplicate locations by bicycle_id
The hook SHALL return at most one location per `bicycle_id`. If the API response contains multiple entries for the same `bicycle_id`, the hook SHALL keep only the entry with the latest `updated_at`.

#### Scenario: Duplicate bicycle entries
- **WHEN** the API returns two entries with the same `bicycle_id`
- **THEN** only the entry with the most recent `updated_at` SHALL be kept

### Requirement: Render one marker per bicycle
The Map page SHALL render exactly one Leaflet marker for each unique `bicycle_id` returned by the polling hook.

#### Scenario: Multiple bikes returned
- **WHEN** the API returns locations for 3 different bicycles
- **THEN** 3 markers SHALL be displayed on the map

#### Scenario: Bike disappears from response
- **WHEN** a `bicycle_id` that was previously in the response is no longer returned
- **THEN** its marker SHALL be removed from the map

### Requirement: Display bicycle_id as marker label
Each bike marker SHALL display its `bicycle_id` as a visible text label using a Leaflet `DivIcon`.

#### Scenario: Marker label visibility
- **WHEN** a bike marker is rendered on the map
- **THEN** the `bicycle_id` text SHALL be visible on or next to the marker without user interaction

### Requirement: Markers update position on poll
When a bike's latitude or longitude changes between polls, its marker SHALL move to the new position.

#### Scenario: Bike moves
- **WHEN** the API returns a new position for an existing `bicycle_id`
- **THEN** the marker SHALL update to the new `[latitude, longitude]` coordinates
