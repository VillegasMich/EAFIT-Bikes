## 1. Setup & Cleanup

- [x] 1.1 Remove Vite boilerplate content from `App.tsx` and delete `App.css`
- [x] 1.2 Update `index.css` to keep only Tailwind base import and any needed custom properties

## 2. Routing Configuration

- [x] 2.1 Create `src/routes.ts` with the centralized route config array (path, label, element)
- [x] 2.2 Create `src/pages/Home.tsx` as the default landing page component
- [x] 2.3 Create `src/pages/NotFound.tsx` as the 404 fallback page

## 3. Layout Components

- [x] 3.1 Create `src/components/Navbar.tsx` — renders "EAFIT Bikes" branding, navigation links from route config, and a Login/Register button
- [x] 3.2 Create `src/components/Footer.tsx` — renders copyright text with "EAFIT Bikes" and the current year

## 4. App Shell & Router Wiring

- [x] 4.1 Rewrite `src/App.tsx` as the layout shell: Navbar + `<Outlet />` + Footer
- [x] 4.2 Update `src/main.tsx` to set up `BrowserRouter` (or `createBrowserRouter`) using the route config and the layout shell

## 5. Verification & Documentation

- [x] 5.1 Run `npm run lint` and fix any lint errors
- [x] 5.2 Run `npm run build` and verify the production build succeeds
- [x] 5.3 Update `CLAUDE.md` if any architectural notes need to reflect the new layout and routing setup
