## Why

The application currently shows the default Vite starter page with no navigation, layout, or routing. Before building any feature (stations map, bike management, user accounts), we need a foundational layout shell — navbar, footer, and page routing — so that every future page slots in consistently and users can navigate the app.

## What Changes

- Replace the Vite boilerplate `App.tsx` with a layout shell containing a **Navbar** and **Footer**.
- Set up **React Router** with a root layout route that wraps all pages.
- The Navbar displays the app name **"EAFIT Bikes"**, renders navigation links dynamically from a route configuration, and includes a **Login / Register** button.
- The Footer shows basic branding / copyright info.
- Create a **Home** page as the default landing route.
- Introduce a centralized route configuration array so new pages can be added by appending a single entry.

## Capabilities

### New Capabilities
- `app-shell`: Layout shell (Navbar + Footer + content area) that wraps all pages via React Router's outlet.
- `routing`: Centralized route configuration with React Router, designed for easy extensibility.

### Modified Capabilities
_(none — no existing specs)_

## Impact

- **Code**: `src/App.tsx`, `src/main.tsx`, new files in `src/components/` and `src/pages/`.
- **Dependencies**: Uses already-installed `react-router` (v7). No new dependencies needed.
- **Styles**: New Tailwind CSS classes; existing `App.css` will be largely replaced.
