import client from "./client";

export type AuthBackendAction = "login" | "register";

/** Body your backend should accept: verify the JWT with Firebase Admin and upsert the user. */
export interface SyncAuthBody {
  idToken: string;
}

/**
 * Sends the Firebase ID token to the backend after sign-in or sign-up.
 * Adjust paths if your API uses different routes.
 */
export async function syncAuthWithBackend(
  action: AuthBackendAction,
  idToken: string
): Promise<void> {
  const path = action === "register" ? "/auth/register" : "/auth/login";
  await client.post(path, { idToken } satisfies SyncAuthBody);
}
