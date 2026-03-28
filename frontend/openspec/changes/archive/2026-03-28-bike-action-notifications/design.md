## Context

The Bikes page (`src/pages/Bikes.tsx`) currently shows errors as inline red text and provides no success feedback after create, update, or delete operations. The `useBikes` hook handles CRUD state but has no notification mechanism. The app uses React 19, Tailwind CSS 4, and has no existing toast/notification library.

## Goals / Non-Goals

**Goals:**
- Provide clear, non-intrusive success and error notifications after bike CRUD operations.
- Build a reusable notification system that can be used across the app in the future.
- Keep the implementation lightweight with zero new dependencies.

**Non-Goals:**
- Replacing all existing error handling patterns app-wide (only bikes page for now).
- Persistent notification history or a notification center.
- Server-sent or push notifications.

## Decisions

### 1. React Context + Portal approach

Use a `NotificationProvider` context at the app root that exposes an `addNotification` function. Toasts render via a portal to `document.body` so they overlay all content.

**Why over alternatives:**
- **vs. a library (react-toastify, sonner):** No new dependency for a simple use case. The app is small and a context-based solution is ~50 lines.
- **vs. component-local state:** Would not be reusable across pages and would couple notification UI to each page.

### 2. Auto-dismiss with manual close

Toasts auto-dismiss after 4 seconds but include a close button. Success toasts auto-dismiss; error toasts persist until manually closed (errors need user attention).

### 3. Notification triggered at the page level

The `Bikes.tsx` page (not the `useBikes` hook) will call `addNotification` after successful operations. This keeps the hook UI-agnostic and avoids coupling data-fetching logic to presentation concerns.

### 4. Styling with Tailwind

Toast styles use Tailwind utility classes with fixed positioning at the top-right corner. Variants: `success` (green), `error` (red), `info` (blue).

## Risks / Trade-offs

- **Multiple toasts stacking** → Stack vertically with a gap; limit to 5 visible at once (oldest dismissed first).
- **No animation library** → Use Tailwind's built-in transition utilities for enter/exit. Simpler but less polished than framer-motion.
- **Context re-renders** → Memoize the context value and use `useCallback` for `addNotification` to prevent unnecessary re-renders of consumers.
