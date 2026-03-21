import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

export interface RouteConfig {
  path: string;
  label: string;
  element: React.ComponentType;
  showInNav?: boolean;
}

export const routes: RouteConfig[] = [
  { path: "/", label: "Home", element: Home, showInNav: true },
];

export const notFoundRoute: RouteConfig = {
  path: "*",
  label: "Not Found",
  element: NotFound,
  showInNav: false,
};
