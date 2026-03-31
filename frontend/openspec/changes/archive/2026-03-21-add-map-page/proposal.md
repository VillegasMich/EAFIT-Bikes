## Why

The application needs a map view to visualize bike station locations on an interactive map. Leaflet and React-Leaflet are already installed but unused. Adding a map page now establishes the foundation for future features like station markers, route visualization, and real-time bike availability overlays.

## What Changes

- Add a new "Map" page component displaying an interactive Leaflet map centered on EAFIT University (Medellín, Colombia)
- Display a blue marker at EAFIT University with a popup label ("EAFIT University")
- Add a "Map" entry to the navbar navigation menu
- Register a new `/map` route in the routing configuration
- The page follows the same layout and styling patterns as existing pages (Home, NotFound)

## Capabilities

### New Capabilities
- `map-view`: Interactive Leaflet map page centered on EAFIT University with OpenStreetMap tiles, a blue marker with popup label at EAFIT University, accessible from the navbar

### Modified Capabilities
<!-- No existing capabilities are being modified -->

## Impact

- **Code**: New page component (`src/pages/Map.tsx`), updated route config (`src/routes.ts`)
- **Dependencies**: Uses already-installed `leaflet` and `react-leaflet` packages — no new dependencies
- **APIs**: OpenStreetMap tile server (public, no API key required)
