## Why

The locations API is already integrated and responses are logged to the console, but bike positions are not yet visualized on the map. Users need to see real-time bike positions to locate available bikes. Polling every 5 seconds enables near-real-time tracking as bikes move.

## What Changes

- Fetch `/locations?latest=true` every 5 seconds using a polling hook
- Render a marker on the map for each unique `bicycle_id` from the response
- Display the `bicycle_id` as the marker label/tooltip
- Markers update position when a bike moves (one marker per bike, no duplicates)
- Remove the current console.log-only integration in `Map.tsx`

## Capabilities

### New Capabilities
- `live-bike-tracking`: Polling-based real-time bike location display on the Leaflet map with labeled markers per bicycle

### Modified Capabilities
- `map-view`: Add dynamic bike markers alongside the existing static EAFIT marker

## Impact

- **Code**: `src/pages/Map.tsx` (marker rendering), new hook in `src/hooks/`, possibly new marker component in `src/components/`
- **API**: No backend changes — uses existing `GET /locations?latest=true`
- **Dependencies**: No new dependencies — React-Leaflet already supports dynamic markers
