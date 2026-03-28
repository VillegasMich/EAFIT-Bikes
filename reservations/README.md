# EAFIT Bikes - Reservations Service

Microservicio de reservaciones de bicicletas para EAFIT Bikes. Permite crear, consultar y actualizar reservaciones de bicicletas con validación automática de conflictos de horarios.

## Características

- **Multi-reservas por bicicleta**: Una bicicleta puede tener múltiples reservas en diferentes rangos de tiempo
- **Gestión de conflictos**: Validación automática de conflictos de horarios
- **Eventos RabbitMQ**: Integración con RabbitMQ para eventos de creación/eliminación de bicicletas
- **Base de datos PostgreSQL**: Persistencia de datos de reservas y bicicletas

## Endpoints

### Documentación de Endpoints

#### **1. Obtener todas las bicicletas**

```
GET /bikes
```

**Descripción**: Retorna la lista de todas las bicicletas registradas en el sistema.

**Response (200 OK)**:
```json
[
  {
    "bike_id": "bike-12345",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

---

#### **2. Crear una reserva**

```
POST /reservations
```

**Descripción**: Crea una nueva reserva para una bicicleta en un rango de fechas específico. El sistema valida automáticamente que:
- La bicicleta exista
- No haya conflictos de horarios con otras reservas

**Request Payload**:
```json
{
  "bike_id": "bike-12345",
  "user_id": "user-67890",
  "start_date": "2025-01-15T10:00:00Z",
  "end_date": "2025-01-15T14:00:00Z"
}
```

**Parameter Details**:
- `bike_id` (string, required): Identificador único de la bicicleta
- `user_id` (string, required): Identificador único del usuario
- `start_date` (datetime ISO 8601, required): Fecha y hora de inicio en UTC
- `end_date` (datetime ISO 8601, required): Fecha y hora de fin en UTC (debe ser posterior a start_date)

**Response (201 CREATED)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "bike_id": "bike-12345",
  "user_id": "user-67890",
  "start_date": "2025-01-15T10:00:00Z",
  "end_date": "2025-01-15T14:00:00Z",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

**Response (409 CONFLICT)** - Si hay conflicto de horarios:
```json
{
  "status": "conflict",
  "message": "The bike 'bike-12345' has 1 conflicting reservation(s) in the requested date range.",
  "bike_id": "bike-12345",
  "requested_start": "2025-01-15T10:00:00Z",
  "requested_end": "2025-01-15T14:00:00Z",
  "conflicting_reservations": [
    {
      "id": "2b75aa9e-5816-4653-848d-eb94e66a1af4",
      "bike_id": "bike-12345",
      "user_id": "user-11111",
      "start_date": "2025-01-15T12:00:00Z",
      "end_date": "2025-01-15T16:00:00Z",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z"
    }
  ]
}
```

**Response (422 UNPROCESSABLE ENTITY)** - Si la bicicleta no existe o validación falla:
```json
{
  "detail": "Bike with ID 'bike-invalid' is not registered in the system. Please register the bike first."
}
```

---

#### **3. Obtener una reserva por ID**

```
GET /reservations/{reservation_id}
```

**Descripción**: Obtiene los detalles de una reserva específica.

**Path Parameters**:
- `reservation_id` (UUID, required): Identificador único de la reserva

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "bike_id": "bike-12345",
  "user_id": "user-67890",
  "start_date": "2025-01-15T10:00:00Z",
  "end_date": "2025-01-15T14:00:00Z",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

**Response (404 NOT FOUND)**:
```json
{
  "detail": "Reservation not found"
}
```

---

#### **4. Obtener todas las reservas de una bicicleta**

```
GET /reservations/bike/{bike_id}
```

**Descripción**: Retorna todas las reservas para una bicicleta específica.

**Path Parameters**:
- `bike_id` (string, required): Identificador de la bicicleta

**Response (200 OK)**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bike_id": "bike-12345",
    "user_id": "user-67890",
    "start_date": "2025-01-15T10:00:00Z",
    "end_date": "2025-01-15T14:00:00Z",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

---

#### **5. Obtener todas las reservas de un usuario**

```
GET /reservations/user/{user_id}
```

**Descripción**: Retorna todas las reservas hechas por un usuario específico.

**Path Parameters**:
- `user_id` (string, required): Identificador del usuario

**Response (200 OK)**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bike_id": "bike-12345",
    "user_id": "user-67890",
    "start_date": "2025-01-15T10:00:00Z",
    "end_date": "2025-01-15T14:00:00Z",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

---

#### **6. Obtener todas las reservas**

```
GET /reservations
```

**Descripción**: Retorna todas las reservas del sistema.

**Response (200 OK)**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bike_id": "bike-12345",
    "user_id": "user-67890",
    "start_date": "2025-01-15T10:00:00Z",
    "end_date": "2025-01-15T14:00:00Z",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

---

#### **7. Actualizar una reserva**

```
PUT /reservations/{reservation_id}
```

**Descripción**: Actualiza el rango de fechas de una reserva existente. Se valida automáticamente que no haya conflictos con otras reservas.

**Path Parameters**:
- `reservation_id` (UUID, required): Identificador de la reserva a actualizar

**Request Payload** (todos los campos opcionales):
```json
{
  "start_date": "2025-01-16T10:00:00Z",
  "end_date": "2025-01-16T14:00:00Z"
}
```

**Parameter Details**:
- `start_date` (datetime ISO 8601, optional): Nueva fecha y hora de inicio
- `end_date` (datetime ISO 8601, optional): Nueva fecha y hora de fin

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "bike_id": "bike-12345",
  "user_id": "user-67890",
  "start_date": "2025-01-16T10:00:00Z",
  "end_date": "2025-01-16T14:00:00Z",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-16T09:30:00Z"
}
```

**Response (409 CONFLICT)** - Si hay conflicto con otras reservas:
```json
{
  "status": "conflict",
  "message": "The bike 'bike-12345' has 1 conflicting reservation(s) in the requested date range.",
  "bike_id": "bike-12345",
  "requested_start": "2025-01-16T10:00:00Z",
  "requested_end": "2025-01-16T14:00:00Z",
  "conflicting_reservations": [
    {
      "id": "11017702-8478-4735-b5cc-280e7e845628",
      "bike_id": "bike-12345",
      "user_id": "user-11111",
      "start_date": "2025-01-16T11:00:00Z",
      "end_date": "2025-01-16T15:00:00Z",
      "created_at": "2025-01-16T08:00:00Z",
      "updated_at": "2025-01-16T08:00:00Z"
    }
  ]
}
```

**Response (404 NOT FOUND)** - Si la reserva no existe:
```json
{
  "detail": "Reservation with ID 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' not found"
}
```

**Response (422 UNPROCESSABLE ENTITY)** - Si la validación falla:
```json
{
  "detail": "Cannot update reservation. The new date range conflicts with 1 existing reservation(s)."
}
```

---

## Modelos de Datos

### BikeResponse
```json
{
  "bike_id": "string (min 1 char)",
  "created_at": "datetime (ISO 8601 UTC)",
  "updated_at": "datetime (ISO 8601 UTC)"
}
```

### ReservationResponse
```json
{
  "id": "UUID",
  "bike_id": "string (min 1 char)",
  "user_id": "string (min 1 char)",
  "start_date": "datetime (ISO 8601 UTC)",
  "end_date": "datetime (ISO 8601 UTC)",
  "created_at": "datetime (ISO 8601 UTC)",
  "updated_at": "datetime (ISO 8601 UTC)"
}
```

### ConflictResponse
```json
{
  "status": "conflict",
  "message": "string",
  "bike_id": "string",
  "requested_start": "datetime (ISO 8601 UTC)",
  "requested_end": "datetime (ISO 8601 UTC)",
  "conflicting_reservations": [
    {
      "id": "UUID",
      "bike_id": "string",
      "user_id": "string",
      "start_date": "datetime (ISO 8601 UTC)",
      "end_date": "datetime (ISO 8601 UTC)",
      "created_at": "datetime (ISO 8601 UTC)",
      "updated_at": "datetime (ISO 8601 UTC)"
    }
  ]
}
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `201` | CREATED - Recurso creado exitosamente |
| `404` | NOT FOUND - Recurso no encontrado |
| `409` | CONFLICT - Conflicto de horarios encontrado |
| `422` | UNPROCESSABLE ENTITY - Error de validación |

---

## Notas Importantes

### Gestión de Bicicletas
- Las bicicletas se crean y eliminan únicamente a través de eventos RabbitMQ (`bike.created`, `bike.deleted`)
- No hay endpoints HTTP de creación o eliminación de bicicletas
- GET /bikes es el único endpoint disponible para bicicletas

### Gestión de Reservas
- Las reservas **no pueden ser eliminadas** a través de la API HTTP
- Solo pueden ser creadas, consultadas y actualizadas
- La eliminación de una bicicleta a través de RabbitMQ **preserva el historial de reservas**

### Validación de Conflictos
- Un conflicto existe cuando dos rangos de tiempo se solapan: `existing.start < new.end AND existing.end > new.start`
- Al actualizar una reserva, se validan todas las otras reservas de la misma bicicleta
- Se incluyen detalles completos de las reservas conflictivas en la respuesta

### Zonas Horarias
- Todas las fechas y horas deben estar en formato ISO 8601 UTC
- En desarrollo, la variable de entorno `ASSUME_LOCAL_TZ` puede configurarse para usar una zona horaria local (ej: "America/Bogota")
- En producción, se asume UTC

---

## Ejemplos de Uso

### Crear una Reserva

```bash
curl -X POST http://localhost:8000/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "bike_id": "bike-12345",
    "user_id": "user-67890",
    "start_date": "2025-01-15T10:00:00Z",
    "end_date": "2025-01-15T14:00:00Z"
  }'
```

### Actualizar una Reserva

```bash
curl -X PUT http://localhost:8000/reservations/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2025-01-16T10:00:00Z",
    "end_date": "2025-01-16T14:00:00Z"
  }'
```

### Obtener Reservas de una Bicicleta

```bash
curl http://localhost:8000/reservations/bike/bike-12345
```

---

## Configuración

### Variables de Entorno

- `DATABASE_URL`: Conexión a PostgreSQL (requerido)
- `RABBITMQ_URL`: Conexión a RabbitMQ (requerido)
- `ASSUME_LOCAL_TZ`: Zona horaria para desarrollo (opcional, ej: "America/Bogota")

---

## Base de Datos

### Tablas Principales

- **bikes**: Registro de bicicletas activas
- **reservations**: Historial de reservas

### Migraciones

Las migraciones se gestionan con Alembic. Para aplicarlas:

```bash
alembic upgrade head
```
