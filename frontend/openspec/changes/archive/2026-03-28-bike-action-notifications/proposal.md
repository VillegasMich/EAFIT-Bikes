## Why

The bikes service currently provides no feedback to the user when a create, update, or delete operation completes successfully. Users only see error messages (as inline red text) but have no confirmation that their action was applied. Adding toast notifications improves UX by giving clear, non-intrusive feedback after important actions.

## What Changes

- Introduce a lightweight toast/notification component that displays success (and error) messages.
- Hook into bike create, update, and delete operations to trigger notifications on completion.
- Replace inline error text in the bikes page with the new notification system for consistency.

## Capabilities

### New Capabilities
- `toast-notifications`: A reusable toast/notification system (component + context) that can display timed, dismissible messages for success, error, and info states.

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Components**: New `Toast` component and `NotificationProvider` context added under `src/components/`.
- **Hooks**: `useBikes` hook or the Bikes page will call notification triggers after successful CRUD operations.
- **Dependencies**: None — built with plain React (context + state). No new packages required.
- **Pages**: `Bikes.tsx` updated to show toast notifications instead of (or in addition to) inline error messages.
