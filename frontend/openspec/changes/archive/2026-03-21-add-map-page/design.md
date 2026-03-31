## Context

The EAFIT-Bikes frontend has Leaflet and React-Leaflet already installed with CSS imported, but no map components exist yet. The app uses a configuration-driven routing system (`routes.ts`) and a shared layout with Navbar, content area, and Footer. Pages follow a consistent Tailwind styling pattern.

EAFIT University coordinates: approximately **6.2006° N, 75.5783° W** (Medellín, Colombia).

## Goals / Non-Goals

**Goals:**
- Display a full-page interactive Leaflet map centered on EAFIT University
- Show a blue marker at EAFIT University with a popup label
- Add a "Map" link in the navbar using the existing route configuration pattern
- Follow existing page structure and styling conventions
- Use OpenStreetMap tiles (free, no API key)
- Set an appropriate default zoom level to show the campus area

**Non-Goals:**
- Dynamic station markers or data overlays (future work)
- Backend API integration for map data (future work)
- Custom map controls or UI overlays
- Mobile-specific map interactions
- Offline tile caching

## Decisions

**1. Map component lives in `src/pages/Map.tsx`**
- Rationale: It's a route-level view, consistent with `Home.tsx` and `NotFound.tsx`. When map sub-components are needed later, they go in `src/components/`.

**2. Use OpenStreetMap tile layer**
- Rationale: Free, no API key required, good coverage for Medellín. Alternative (Mapbox) requires API key and account setup — unnecessary at this stage.

**3. Map fills the available content area**
- Rationale: Maps work best at full width/height. The map wrapper uses `relative flex-1` and the MapContainer is positioned with `absolute inset-0` to get a concrete pixel height — Leaflet requires explicit dimensions and `height: 100%` doesn't resolve reliably through flex containers.

**4. Default zoom level ~15**
- Rationale: Zoom 15 shows the EAFIT campus and immediate surroundings clearly — enough context without losing detail. Can be adjusted later.

**5. Route registered via `routes.ts` config**
- Rationale: The app already uses a configuration-driven approach. Adding `{ path: "/map", label: "Map", element: Map, showInNav: true }` follows the established pattern and automatically adds the navbar link.

## Risks / Trade-offs

- **[Tile loading depends on external CDN]** → OpenStreetMap is reliable and widely used; acceptable for a university project. No mitigation needed now.
- **[Map container height]** → Leaflet requires an explicit height on its container. Solved by using `absolute inset-0` positioning inside a `relative flex-1` wrapper, which gives Leaflet a concrete pixel height.
- **[Default marker icon paths]** → Leaflet's default marker icons break with bundlers (Vite) because the image paths aren't resolved correctly. Fixed by explicitly importing the icon assets and calling `L.Icon.Default.mergeOptions()`.
