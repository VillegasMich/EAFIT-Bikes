# EAFIT Bikes — Frontend

A bike-sharing management application built with React, TypeScript, and Vite.

## Getting Started

```bash
npm install
npm run dev      # Start dev server at http://localhost:5173
```

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start development server with HMR    |
| `npm run build`    | Type-check and build for production  |
| `npm run lint`     | Run ESLint                           |
| `npm run preview`  | Preview the production build locally |

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** — build tool
- **React Router 7** — client-side routing
- **Tailwind CSS 4** — utility-first styling
- **Leaflet / React-Leaflet** — map visualization
- **Axios** — HTTP client

## Project Structure

```
src/
├── api/          # Axios-based API service layer
├── components/   # Reusable components (Navbar, Footer, …)
├── hooks/        # Custom React hooks
├── pages/        # Page-level components (Home, NotFound, …)
├── types/        # Shared TypeScript type definitions
├── routes.ts     # Centralized route configuration
├── App.tsx       # Layout shell (Navbar + Outlet + Footer)
└── main.tsx      # Router provider and app entry point
```

Data flow: `pages/` → `hooks/` → `api/` → backend.

Routes are defined in `src/routes.ts`. Adding a new page means adding one entry to the config array — the Navbar picks it up automatically.
