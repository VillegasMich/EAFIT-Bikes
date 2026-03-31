import authClient from "./authClient";

/** Body your backend should accept: verify the JWT with Firebase Admin and upsert the user. */
export interface SyncAuthBody {
  idToken: string;
  role?: string;
}

async function postIdToken(
  path: string,
  idToken: string,
  role?: string
): Promise<void> {
  const body: SyncAuthBody = { idToken, ...(role && { role }) };
  console.log(`Syncing auth with backend at ${path}...`);
  await authClient.post(path, body);
}

/**
 * Checks if the backend service is up and healthy.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    await authClient.get("/api/auth/health", { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Sends the Firebase ID token to the backend after sign-in.
 */
export async function login(
  idToken: string,
  role?: string
): Promise<void> {
  await postIdToken("/api/auth/login", idToken, role);
}

/**
 * Sends the Firebase ID token to the backend after sign-up.
 */
export async function register(
  idToken: string,
  role?: string
): Promise<void> {
  await postIdToken("/api/auth/register", idToken, role);
}
