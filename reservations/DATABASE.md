# Database Schema Documentation

## Overview
This document describes the PostgreSQL database schema for the EAFIT Bikes Reservations microservice.

The service uses **SQLAlchemy** as the ORM for database interactions. The database schema is defined through SQLAlchemy models and is automatically created when the application starts.

## Tables

### reservations

The `reservations` table stores bike reservation information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier for the reservation (auto-generated) |
| `bike_id` | VARCHAR | NOT NULL | Logical ID of the bike being reserved |
| `user_id` | VARCHAR | NOT NULL | Logical ID of the user making the reservation |
| `start_date` | TIMESTAMP | NOT NULL | When the reservation starts |
| `end_date` | TIMESTAMP | NOT NULL | When the reservation ends |
| `status` | VARCHAR | DEFAULT 'active' | Status of the reservation: 'active' or 'cancelled' |
| `created_at` | TIMESTAMP | DEFAULT now() | Timestamp when the record was created |
| `updated_at` | TIMESTAMP | DEFAULT now() | Timestamp when the record was last updated |

### Indexes

- **idx_reservations_bike_id**: Index on `bike_id` for faster queries by bike
- **idx_reservations_user_id**: Index on `user_id` for faster queries by user

## Architecture

### Database Layer
- **models/reservations.py**: SQLAlchemy ORM model definition for the Reservation table
- **models/__init__.py**: Database engine, session factory, and dependency injection

### Data Access Layer
- **repositories/reservations.py**: Repository pattern implementation with database operations

### Business Logic Layer
- **services/reservations.py**: Service layer with business logic

### API Layer
- **routes/reservations.py**: FastAPI routes and endpoints
- **schemas/reservations.py**: Pydantic models for request/response validation

## Connection Configuration

The database connection is configured via the `DATABASE_URL` environment variable in `.env` file:

```
DATABASE_URL=postgresql://username:password@localhost:5432/eafit_bikes
```

Default connection string (if not set):
```
postgresql://user:password@localhost:5432/eafit_bikes
```

## Using SQLAlchemy ORM

### Creating Records
```python
from models.reservations import Reservation
from models import SessionLocal

db = SessionLocal()
reservation = Reservation(
    bike_id="bike-123",
    user_id="user-456",
    start_date=datetime.now(),
    end_date=datetime.now() + timedelta(hours=2),
    status="active"
)
db.add(reservation)
db.commit()
```

### Querying Records
```python
# Get by ID
reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()

# Get all active reservations
active = db.query(Reservation).filter(Reservation.status == 'active').all()

# Get by bike or user
bike_reservations = db.query(Reservation).filter(Reservation.bike_id == bike_id).all()
```

## API Endpoints

### Create Reservation
```
POST /reservations/
```

### Get Reservation
```
GET /reservations/{reservation_id}
```

### Get Bike Reservations
```
GET /reservations/bike/{bike_id}
```

### Get User Reservations
```
GET /reservations/user/{user_id}
```

### Get All Reservations
```
GET /reservations/
```

### Get Active Reservations
```
GET /reservations/active/all
```

### Update Reservation
```
PUT /reservations/{reservation_id}
```

### Delete Reservation
```
DELETE /reservations/{reservation_id}
```

