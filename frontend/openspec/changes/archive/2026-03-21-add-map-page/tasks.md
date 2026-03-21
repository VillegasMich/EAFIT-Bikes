## 1. Map Page Component

- [x] 1.1 Create `src/pages/Map.tsx` with a Leaflet `MapContainer`, `TileLayer` (OpenStreetMap), centered on EAFIT University (6.2006, -75.5783) at zoom level 15
- [x] 1.2 Style the map container to fill all available vertical space between Navbar and Footer (use `relative flex-1` wrapper with `absolute inset-0` MapContainer)
- [x] 1.3 Add a blue marker at EAFIT University (6.2006, -75.5783) with a popup label ("EAFIT University")
- [x] 1.4 Fix Leaflet default marker icon paths for Vite bundler compatibility

## 2. Routing & Navigation

- [x] 2.1 Add the Map route entry to `src/routes.ts` with `path: "/map"`, `label: "Map"`, `showInNav: true`
- [x] 2.2 Verify the navbar automatically displays the "Map" link with correct active/inactive styling

## 3. Verification

- [x] 3.1 Run `npm run lint` and fix any linting errors
- [x] 3.2 Run `npm run build` and verify no TypeScript or build errors
- [x] 3.3 Update any related documentation affected by the changes
