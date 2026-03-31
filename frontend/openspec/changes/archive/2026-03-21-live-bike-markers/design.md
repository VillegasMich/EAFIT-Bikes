## Context

The Map page (`src/pages/Map.tsx`) currently fetches `GET /locations?latest=true` once on mount and logs the response to the console. The existing `LocationResponse` type includes `bicycle_id`, `latitude`, `longitude`, and `updated_at`. React-Leaflet is already set up with a static EAFIT marker. The goal is to render live bike markers that update every 5 seconds.

## Goals / Non-Goals

**Goals:**
- Poll `/locations?latest=true` every 5 seconds and render bike markers on the map
- Show one marker per `bicycle_id` with the ID as a visible label
- Markers reposition when a bike moves between polls

**Non-Goals:**
- WebSocket or server-sent events (polling is sufficient for now)
- Marker clustering or performance optimization for large fleets
- Click interactions or detailed bike info popups
- Offline support or caching

## Decisions

### 1. Custom `usePollingLocations` hook
Extract polling logic into `src/hooks/usePollingLocations.ts`. This separates data-fetching concerns from rendering and follows the planned `pages/ → hooks/ → api/` data flow.

**Alternative considered**: Polling directly in `Map.tsx` with `setInterval` inside `useEffect` — rejected because it mixes concerns and is harder to test or reuse.

### 2. Use Leaflet `DivIcon` for labeled markers
Use React-Leaflet `<Marker>` with a `DivIcon` to display the `bicycle_id` as text on or next to the marker. This avoids needing a custom image per bike.

**Alternative considered**: Using `<Tooltip permanent>` on standard markers — viable but `DivIcon` gives more styling control and keeps the label always visible without extra layers.

### 3. Key markers by `bicycle_id`
React-Leaflet markers keyed by `bicycle_id` ensure React reconciles correctly — one marker per bike, position updates in place, removed bikes disappear.

### 4. Deduplication by `bicycle_id` in the hook
If the API returns multiple entries per bike (shouldn't with `latest=true`, but defensively), the hook keeps only the most recent entry per `bicycle_id` based on `updated_at`.

## Risks / Trade-offs

- **5-second polling creates steady network load** → Acceptable for a campus-scale app with few bikes. Can increase interval later if needed.
- **Stale markers if API is down** → The hook continues showing last successful response. No error indicator planned (non-goal), but the hook exposes an error state for future use.
- **No cleanup of bikes that stop reporting** → The API's `latest=true` response is the source of truth. If a bike is no longer in the response, its marker disappears.
