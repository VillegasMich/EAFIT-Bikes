import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { NotificationProvider } from "./components/NotificationProvider.tsx";
import { routes, notFoundRoute } from "./routes.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NotificationProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.element />}
            />
          ))}
          <Route
            path={notFoundRoute.path}
            element={<notFoundRoute.element />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
    </NotificationProvider>
  </StrictMode>
);
