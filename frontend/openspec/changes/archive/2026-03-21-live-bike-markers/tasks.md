## 1. Polling Hook

- [x] 1.1 Create `src/hooks/usePollingLocations.ts` that calls `getLocations({ latest: true })` immediately on mount and every 5 seconds, returning the deduplicated locations array (one per `bicycle_id`, keeping latest `updated_at`)
- [x] 1.2 Ensure the hook clears the interval on unmount and exposes a loading/error state

## 2. Bike Marker Rendering

- [x] 2.1 Create a `BikeMarker` component (or inline in Map) using React-Leaflet `<Marker>` with a `DivIcon` that displays the `bicycle_id` as visible text
- [x] 2.2 Update `src/pages/Map.tsx` to use `usePollingLocations` and render one `<Marker>` per location, keyed by `bicycle_id`
- [x] 2.3 Remove the existing `console.log`-only `useEffect` fetch from `Map.tsx`

## 3. Verification

- [x] 3.1 Run `npm run lint` and fix any lint errors
- [x] 3.2 Run `npm run build` and verify no TypeScript errors

## 4. Documentation

- [x] 4.1 Update any related documentation affected by the changes (e.g., spec files in `openspec/specs/`)
