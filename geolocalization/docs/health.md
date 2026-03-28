# GET /health

Liveness probe endpoint. Returns the service status and database connectivity state.

## Request

```
GET /health
```

No authentication required. No request body.

## Response

**Status:** `200 OK` (always, regardless of database state)

**Headers:** `Content-Type: application/json`

### When database is connected

```json
{
  "status": "ok",
  "db": "connected"
}
```

### When database is unavailable

```json
{
  "status": "ok",
  "db": "unavailable"
}
```

## Fields

| Field    | Type   | Description                                      |
|----------|--------|--------------------------------------------------|
| `status` | string | Always `"ok"` if the service is running          |
| `db`     | string | `"connected"` or `"unavailable"` based on pool state |

## Notes

- This endpoint never returns an error status code. If the process is alive, it responds `200`.
- Operators should monitor the `db` field to detect degraded mode (service running without database).
