# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EAFIT-Bikes is a bike-sharing management application.

## Commands

All commands run from this directory (`frontend/`):

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Type-check and build for production (tsc -b && vite build)
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Tech Stack

- **React 19** + **TypeScript** (strict mode, ES2023 target)
- **Vite 8** — build tool with HMR
- **React Router 7** — client-side routing
- **Tailwind CSS 4** — via `@tailwindcss/vite` plugin (no PostCSS config needed)
- **Leaflet / React-Leaflet** — map visualization for bike stations
- **Axios** — HTTP client for backend API calls

## Architecture

```
src/
├── api/         # Axios-based API service layer
├── components/  # Reusable React components
├── hooks/       # Custom React hooks
├── pages/       # Page-level components (used by React Router)
└── types/       # Shared TypeScript type definitions
```

The planned data flow is: `pages/` → `hooks/` → `api/` → backend. Types are centralized in `types/`.

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

- `VITE_API_BASE_URL` — Backend API base URL (defaults to `http://localhost:8080`)

## After Every Code Change

Run `npm run lint` after every code change to verify nothing is broken.

## TypeScript Config

`tsconfig.app.json` enforces `strict: true`, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`. The build will fail if these are violated.
