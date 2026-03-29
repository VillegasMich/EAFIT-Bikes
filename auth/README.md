# EAFIT Bikes — Auth API

Next.js App Router service: verifies **Firebase ID tokens** on the server and syncs user profiles in **Supabase** (`users` table: `id`, `role`, `email`).

Base URL examples: `http://localhost:3000` (local), or your gateway / `auth-service` Service URL in Kubernetes.

---

## API endpoints

All JSON APIs use `Content-Type: application/json` unless noted.

### `GET /api/auth/health`

**Purpose:** Liveness probe (load balancers, Kubernetes). Does not call Firebase or Supabase.

**Response** `200`:

```json
{ "status": "ok", "service": "auth" }
```

**`HEAD /api/auth/health`** — same as GET for probes that only need a status code.

---

### `POST /api/auth/register`

**Purpose:** After Firebase sign-up on the client, register the user profile in Supabase.

**Body:**

| Field | Required | Description |
|--------|----------|-------------|
| `token` or `idToken` | Yes | Firebase ID token (JWT) from the client. |
| `role` | Yes | Role stored in the user row (must match your app’s role model). |

**Example:**

```json
{
  "idToken": "<firebase-id-token>",
  "role": "rider"
}
```

**Responses:**

| Status | Body | When |
|--------|------|------|
| `200` | `{ "registered": true, "uid": "<firebase-uid>" }` | Row inserted. |
| `400` | `{ "error": "..." }` | Missing/invalid JSON or missing fields. |
| `401` | `{ "error": "..." }` | Invalid or expired Firebase token. |
| `409` | `{ "error": "User already registered for this Firebase account" }` | Duplicate `id` (Postgres `23505`). |
| `500` | `{ "error": "..." }` | Supabase/Firebase misconfiguration or insert failure. |

If the Firebase token includes an email, it is stored in the configured `email` column when present.

---

### `POST /api/auth/login`

**Purpose:** Validate that a Firebase user exists in Supabase and that the submitted **role** matches the stored row (session / gate check after client sign-in).

**Body:** Same shape as register (`token` or `idToken`, `role`).

**Example:**

```json
{
  "idToken": "<firebase-id-token>",
  "role": "rider"
}
```

**Responses:**

| Status | Body | When |
|--------|------|------|
| `200` | `{ "valid": true, "uid": "<firebase-uid>" }` | Token OK and role matches DB. |
| `400` | `{ "error": "..." }` | Bad JSON or missing `token`/`idToken` or `role`. |
| `401` | `{ "error": "..." }` | Invalid or expired Firebase token. |
| `403` | `{ "error": "Role does not match stored value" }` | User exists but role differs. |
| `404` | `{ "error": "User not found for this Firebase uid" }` | No row for this Firebase `uid`. |
| `500` | `{ "error": "..." }` | Supabase query error or server misconfiguration. |

---

## Environment variables

| Variable | Used by | Notes |
|----------|---------|--------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin | Full service account JSON string (not the web `firebaseConfig`). |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client | Project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase client | **Service role** key only on the server (not the publishable/anon key). |

---

## Run locally

Create a `.env` file with the variables in the table above, then:

```bash
npm install
npm run dev
```

---

## Docker & Kubernetes

- **Image:** `Dockerfile` at repo root of this package (Next.js `standalone` output).
- **Manifests:** `k8s/` — ConfigMap (URL), Secret template (`secret.example.yaml`), Deployment, Service, `kustomization.yaml`.

```bash
docker build -t eafit-bikes-auth:latest .
kubectl apply -f k8s/secret.yaml   # from secret.example.yaml, with real values
kubectl apply -k k8s/
```
