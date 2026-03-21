# Locations API

## REST Endpoints

### GET `/locations`

Returns all bicycle location records.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `latest` | bool | `false` | When `true`, returns only the most recent location per bicycle |

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "bicycle_id": "uuid",
    "latitude": 6.20,
    "longitude": -75.57,
    "updated_at": "2026-03-20T12:00:00Z"
  }
]
```

---

### GET `/locations/bicycle/:bicycle_id`

Returns all location records for a specific bicycle.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `bicycle_id` | UUID | The bicycle's unique identifier |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `latest` | bool | `false` | When `true`, returns only the single most recent location |

**Response:** `200 OK` — JSON array of `LocationResponse` (empty array if no records)

**Errors:**
- `400 Bad Request` — invalid UUID format

---

### POST `/locations`

Inserts a single bicycle location.

**Request Body:**

```json
{
  "bicycle_id": "uuid",
  "latitude": 6.20,
  "longitude": -75.57
}
```

**Response:** `201 Created` — the inserted `LocationResponse`

**Errors:**
- `422 Unprocessable Entity` — coordinates out of range

**Validation:**
- latitude must be in [-90, 90]
- longitude must be in [-180, 180]

---

### POST `/locations/batch`

Inserts multiple bicycle locations in a single operation.

**Request Body:**

```json
{
  "locations": [
    { "bicycle_id": "uuid", "latitude": 6.20, "longitude": -75.57 },
    { "bicycle_id": "uuid", "latitude": 6.21, "longitude": -75.58 }
  ]
}
```

**Response:** `201 Created` — JSON array of inserted `LocationResponse` objects

**Errors:**
- `422 Unprocessable Entity` — any entry has invalid coordinates, or array is empty

**Validation:**
- All entries validated before insertion; entire batch rejected if any entry fails
- latitude must be in [-90, 90]
- longitude must be in [-180, 180]
- `locations` array must not be empty

---

## Common Error Responses

All errors return JSON:

```json
{ "error": "descriptive message" }
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request (invalid UUID format) |
| `422` | Validation error (coordinates out of range, empty batch) |
| `503` | Database unavailable |
