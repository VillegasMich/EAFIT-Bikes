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
];

export const notFoundRoute: RouteConfig = {
  path: "*",
  label: "Not Found",
  element: NotFound,
  showInNav: false,
};
