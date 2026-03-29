## Why

The reservations microservice is now available and the bikes management page has no way for users to reserve bikes or see which bikes are currently reserved. This change connects the frontend to the reservations API so users can create reservations and track availability at a glance.

## What Changes

- Add a `reservations` API service module mirroring the pattern of `src/api/bikes.ts`
- Add TypeScript types for `Reservation`, `ReservationCreate`, `ReservationUpdate`, and conflict/error responses
- Add a `useReservations` hook for fetching and managing reservation state
- Add a "Reserve" button per bike row in the Bikes page table
- Add a reservation modal/form (bike_id pre-filled, user selects start/end dates)
- Mark bikes that have an active/upcoming reservation with a visual indicator in the table
- Add filter tabs to the Bikes table: **All** | **Reserved** | **Available** so users can quickly filter the list

## Capabilities

### New Capabilities

- `reservations-api`: API service layer for the reservations microservice — fetch all reservations, fetch by bike, fetch by user, create, and update reservations
- `bike-reservations`: UI on the Bikes page — reserve button, reservation form modal, reserved/available badge per bike, and filter tabs

### Modified Capabilities

- `bikes-management`: The Bikes table gains a status badge column, a "Reserve" action button per row, and filter tabs (All / Reserved / Available) — requirements for the table structure and available actions change

## Impact

- New file: `src/api/reservations.ts`
- New file: `src/types/reservation.ts`
- New file: `src/hooks/useReservations.ts`
- New component: `src/components/ReservationModal.tsx`
- Modified: `src/pages/Bikes.tsx` — adds tab bar, status badge column, and reserve button
- New environment variable: `VITE_RESERVATIONS_API_URL` (reservations service runs on a separate port/host from the main backend)
