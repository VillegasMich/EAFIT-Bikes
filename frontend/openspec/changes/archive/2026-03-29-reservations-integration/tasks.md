## 1. Environment & Client Setup

- [x] 1.1 Add `VITE_RESERVATIONS_API_URL` to `.env.example` with value `http://localhost:8000`
- [x] 1.2 Create `src/api/reservationsClient.ts` — Axios instance using `VITE_RESERVATIONS_API_URL`, defaulting to `http://localhost:8000`

## 2. Types

- [x] 2.1 Create `src/types/reservation.ts` with types: `ReservationResponse`, `ReservationCreate`, `ReservationUpdate`, `ConflictResponse`

## 3. API Service

- [x] 3.1 Create `src/api/reservations.ts` with functions: `getReservations()`, `getReservationsByBike(bikeId)`, `createReservation(data)`
- [x] 3.2 Handle 409 conflict responses in `createReservation` — extract and re-throw with conflict details

## 4. Hook

- [x] 4.1 Create `src/hooks/useReservations.ts` — fetches all reservations on mount, exposes `reservations`, `loading`, `error`, `refreshReservations`, `createReservation`, `isBikeReserved(bikeId)`
- [x] 4.2 Implement `isBikeReserved(bikeId)` — returns `true` if any reservation for that bike has `start_date ≤ now ≤ end_date`

## 5. Reservation Modal Component

- [x] 5.1 Create `src/components/ReservationModal.tsx` — accepts `bikeId`, `userId`, `onClose`, `onSuccess` props
- [x] 5.2 Add read-only bike ID display, datetime-local inputs for start/end date
- [x] 5.3 Add client-side validation: end date must be after start date
- [x] 5.4 On submit: call `createReservation`, show success toast and call `onSuccess`, or show error toast on 409/other errors without closing

## 6. Bikes Page Updates

- [x] 6.1 Import and call `useReservations()` in `src/pages/Bikes.tsx`
- [x] 6.2 Add `Status` column to the bikes table — render "Reserved" or "Available" badge per row using `isBikeReserved(bike.id)`
- [x] 6.3 Add "Reserve" button in the Actions column per row — clicking opens `ReservationModal` with that bike's ID
- [x] 6.4 Add filter tab bar above the table with tabs: All / Reserved / Available — wire to local state and filter displayed bikes
- [x] 6.5 After successful reservation in modal (`onSuccess`), call `refreshReservations()` to update status badges

## 7. Documentation

- [x] 7.1 Add `VITE_RESERVATIONS_API_URL` entry to the Environment Variables section in `CLAUDE.md`
