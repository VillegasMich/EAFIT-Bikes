import * as admin from "firebase-admin";

export async function verifyFirebaseIdToken(idToken: string) {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");
    }
    let credentials: admin.ServiceAccount;
    try {
      credentials = JSON.parse(raw) as admin.ServiceAccount;
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON");
    }
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  }
  return admin.auth().verifyIdToken(idToken);
}
