import client from "./client";

export type AuthBackendAction = "login" | "register";

/** Body your backend should accept: verify the JWT with Firebase Admin and upsert the user. */
export interface SyncAuthBody {
  idToken: string;
  role?: string;
}

/**
 * Checks if the backend service is up and healthy.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    await client.get("10.0.1.229:3000/api/auth/health", { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Sends the Firebase ID token to the backend after sign-in or sign-up.
 * Adjust paths if your API uses different routes.
 */
export async function syncAuthWithBackend(
  action: AuthBackendAction,
  idToken: string,
  role?: string
): Promise<void> {
  const path = action === "register" ? "10.0.1.229:3000/api/auth/register" : "10.0.1.229:3000/api/auth/login";
  const body: SyncAuthBody = { idToken, ...(role && { role }) };
  console.log(`Syncing auth with backend at ${path}...`);
  await client.post(path, body);
}
