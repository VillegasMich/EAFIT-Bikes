## 1. Types and API Layer

- [x] 1.1 Create `src/types/bike.ts` with `BikeType`, `Bike`, `BikeCreate`, and `BikeUpdate` type definitions
- [x] 1.2 Create `src/api/bikes.ts` with `getBikes`, `getBike`, `createBike`, `updateBike`, and `deleteBike` functions using the shared Axios client

## 2. Configuration

- [x] 2.1 Add Vite dev proxy rule for `/bikes` → `http://localhost:8000` in `vite.config.ts`
- [x] 2.2 Add `VITE_BIKES_API_BASE_URL=http://localhost:8000` to `.env.example`

## 3. Custom Hook

- [x] 3.1 Create `src/hooks/useBikes.ts` hook that fetches bikes on mount and exposes `bikes`, `loading`, `error`, `createBike`, `updateBike`, `deleteBike`, and `refreshBikes`

## 4. UI Components and Page

- [x] 4.1 Create the Bikes page component (`src/pages/Bikes.tsx`) with a table displaying all bikes (ID, Marca, Tipo, Color, Actions)
- [x] 4.2 Add create bike form with Marca (text), Tipo (select dropdown), Color (text) fields and submit/cancel actions
- [x] 4.3 Add edit bike functionality with pre-populated form and save/cancel actions
- [x] 4.4 Add delete bike action with confirmation dialog

## 5. Routing Integration

- [x] 5.1 Add `/bikes` route entry to `src/routes.ts` with `showInNav: true` and import the Bikes page

## 6. Verification and Documentation

- [x] 6.1 Run `npm run lint` and `npm run build` to verify no type or lint errors
- [x] 6.2 Update `.env.example` documentation if not already done in task 2.2
