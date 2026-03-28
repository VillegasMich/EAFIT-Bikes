import { Link, NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { routes } from "../routes";

function Navbar() {
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <Link to="/" className="text-xl font-bold text-blue-600">
        EAFIT Bikes
      </Link>

      <div className="flex items-center gap-6">
        <ul className="flex gap-4">
          {routes
            .filter((r) => r.showInNav)
            .map((route) => (
              <li key={route.path}>
                <NavLink
                  to={route.path}
                  className={({ isActive }) =>
                    isActive
                      ? "font-semibold text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }
                >
                  {route.label}
                </NavLink>
              </li>
            ))}
        </ul>

        {loading ? (
          <span className="text-sm text-gray-500">…</span>
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="max-w-[10rem] truncate text-sm text-gray-600">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
