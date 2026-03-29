import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { login, register, checkBackendHealth } from "../api/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../firebase/config";

function firebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Try signing in.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isFirebaseConfigured()) {
      setError(
        "Firebase is not configured. Copy .env.example to .env and set your Firebase web app keys."
      );
      return;
    }

    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (mode === "register" && !role) {
      setError("Please select a role.");
      return;
    }

    setSubmitting(true);
    const auth = getFirebaseAuth();

    try {
      const backendIsHealthy = await checkBackendHealth();
      if (!backendIsHealthy) {
        setError("Backend service is not available. Please try again later.");
        setSubmitting(false);
        return;
      }

      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        console.log("cred", cred);
        const idToken = await cred.user.getIdToken();
        console.log("idToken", idToken);
        await register(idToken, role);
      } else {
        const cred = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        const idToken = await cred.user.getIdToken();
        await login(idToken);
      }
      navigate("/");
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      if (code.startsWith("auth/")) {
        setError(firebaseErrorMessage(code));
      } else {
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "status" in err.response
        ) {
          setError("Could not reach the server or it rejected the request.");
        } else {
          setError("Could not complete the request. Check your connection.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          {mode === "login"
            ? "Use your email and password. Your session is synced with the API."
            : "Register to get started. Your account is synced with the API."}
        </p>

        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "register"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => {
              setMode("register");
              setRole("");
              setError(null);
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="auth-password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {mode === "register" && (
            <>
              <div>
                <label
                  htmlFor="auth-confirm"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>
                <input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="auth-role"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Role *
                </label>
                <select
                  id="auth-role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/" className="font-medium text-blue-600 hover:text-blue-700">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
