import { verifyFirebaseIdToken } from "@/lib/firebase-admin";

export type VerifyTokenResult =
  | { ok: true; uid: string; email?: string }
  | { ok: false; status: 401 | 500; message: string };

export async function verifyTokenFromBody(
  idToken: string,
): Promise<VerifyTokenResult> {
  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    return {
      ok: true,
      uid: decoded.uid,
      email: decoded.email ?? undefined,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (
      msg.includes("FIREBASE_SERVICE_ACCOUNT_JSON") ||
      msg.includes("not valid JSON")
    ) {
      return {
        ok: false,
        status: 500,
        message: "Server is not configured for Firebase",
      };
    }
    return {
      ok: false,
      status: 401,
      message: "Invalid or expired Firebase token",
    };
  }
}
