import { Link } from "react-router";

function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
      <p className="mb-8 text-lg text-gray-600">Page not found.</p>
      <Link
        to="/"
        className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;
