import Bikes from "./pages/Bikes";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Home from "./pages/Home";
import Map from "./pages/Map";
import NotFound from "./pages/NotFound";

export interface RouteConfig {
  path: string;
  label: string;
  element: React.ComponentType;
  showInNav?: boolean;
}

export const routes: RouteConfig[] = [
  { path: "/", label: "Home", element: Home, showInNav: true },
  { path: "/map", label: "Map", element: Map, showInNav: true },
  { path: "/bikes", label: "Bikes", element: Bikes, showInNav: true },
  { path: "/events", label: "Events", element: Events, showInNav: true },
  { path: "/auth", label: "Auth", element: Auth, showInNav: false },
];

export const notFoundRoute: RouteConfig = {
  path: "*",
  label: "Not Found",
  element: NotFound,
  showInNav: false,
};
