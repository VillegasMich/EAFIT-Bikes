## Context

The EAFIT Bikes frontend is a greenfield React 19 + TypeScript app bootstrapped with Vite 8. It currently contains only the default Vite starter page — no routing, no shared layout, and no navigation. React Router 7 and Tailwind CSS 4 are already installed. The planned architecture (`pages/ → hooks/ → api/`) requires a layout shell before any feature page can be built.

## Goals / Non-Goals

**Goals:**
- Establish a persistent layout (Navbar + content area + Footer) that wraps every page.
- Wire up React Router so navigation happens client-side without full reloads.
- Make adding a new page a single-entry change (add route config + page component).
- Show "EAFIT Bikes" branding in the Navbar and a Login/Register button.

**Non-Goals:**
- Implementing actual authentication logic (login/register are placeholder buttons for now).
- Building any feature pages beyond a simple Home page.
- Responsive hamburger menu (can be added later; start with a horizontal nav).
- Dark mode or theme switching.

## Decisions

### 1. Layout via React Router's `<Outlet>`

Use a root layout route whose element renders Navbar, `<Outlet />`, and Footer. All page routes are children of this layout route.

**Why over wrapping in `App.tsx` manually?** Router-based layout is the idiomatic React Router 7 pattern, supports nested layouts in the future, and keeps `App.tsx` clean.

### 2. Centralized route configuration array

Define routes as a plain TypeScript array of objects (`{ path, label, element }`) in a dedicated `src/routes.ts` file. The Navbar reads this array to render links; the router reads it to register routes.

**Why over scattered route definitions?** Single source of truth — adding a page means adding one object. The Navbar stays in sync automatically.

### 3. Tailwind CSS for all styling

Use Tailwind utility classes exclusively. Remove `App.css` boilerplate. Keep `index.css` only for Tailwind's base import and any CSS custom properties.

**Why?** Tailwind is already configured via `@tailwindcss/vite`. Utility-first keeps styles co-located and avoids CSS file proliferation.

### 4. Component file structure

```
src/
├── components/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── pages/
│   └── Home.tsx
├── routes.ts          # centralized route config
├── App.tsx            # layout shell (Navbar + Outlet + Footer)
└── main.tsx           # router provider setup
```

Each component is a single file (no barrel exports) to keep things simple at this stage.

## Risks / Trade-offs

- **Navbar doesn't scale visually for many links** → Acceptable for now; a dropdown or hamburger menu can be added when we have more than ~5 pages.
- **Login/Register button is non-functional** → Intentional placeholder; auth will be a separate change. The button is there so the layout is complete from day one.
- **No lazy loading of page components** → With only a Home page, code-splitting adds complexity for no benefit. Add `React.lazy()` when the page count grows.
