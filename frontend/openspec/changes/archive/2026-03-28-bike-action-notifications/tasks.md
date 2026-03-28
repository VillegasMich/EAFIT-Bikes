## 1. Notification System Core

- [x] 1.1 Create notification types in `src/types/notification.ts` (id, message, type: success/error/info, timestamp)
- [x] 1.2 Create `NotificationContext` and `NotificationProvider` in `src/components/NotificationProvider.tsx` with `addNotification` and `removeNotification` functions
- [x] 1.3 Create `Toast` component in `src/components/Toast.tsx` with Tailwind styling for success (green), error (red), and info (blue) variants, close button, and auto-dismiss logic

## 2. App Integration

- [x] 2.1 Wrap the app root with `NotificationProvider` in `src/App.tsx` (or main layout)
- [x] 2.2 Render the toast container via a portal in the `NotificationProvider`, positioned top-right with vertical stacking

## 3. Bike CRUD Notifications

- [x] 3.1 Add success notification after bike creation in `Bikes.tsx` ("Bike created successfully")
- [x] 3.2 Add success notification after bike update in `Bikes.tsx` ("Bike updated successfully")
- [x] 3.3 Add success notification after bike deletion in `Bikes.tsx` ("Bike deleted successfully")
- [x] 3.4 Add error notifications for failed create/update/delete operations in `Bikes.tsx`

## 4. Polish and Verification

- [x] 4.1 Ensure error toasts persist until manually dismissed while success toasts auto-dismiss after 4 seconds
- [x] 4.2 Enforce max 5 visible toasts (remove oldest first)
- [x] 4.3 Run `npm run lint` and fix any lint errors
- [x] 4.4 Update any related documentation affected by the changes
