# EAFIT Bikes - Reservations Microservice

A FastAPI-based microservice for managing bicycle reservations with PostgreSQL.

## Setup

### Prerequisites
- Docker & Docker Compose, OR
- Python 3.13+
- PostgreSQL 12+ (running locally)
- RabbitMQ (running locally)
- pip/venv

### Quick Start with Docker

1. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

2. **Build and Run**
```bash
docker build -t eafit-bikes-reservations .
docker run -p 8000:8000 \
  --env-file .env \
  --network host \
  eafit-bikes-reservations
```

### Local Development Setup

1. **Create Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database credentials:
# DATABASE_URL=postgresql://user:password@localhost:5432/eafit_bikes
# RABBITMQ_HOST=localhost
```

## Database Setup

The database schema is automatically created when the application starts. The service uses SQLAlchemy ORM to manage the database.

### Schema
- **reservations** table with indexes on `bike_id` and `user_id` for optimal query performance

For detailed schema documentation, see [DATABASE.md](./DATABASE.md)

## Running the Application

**Option 1: Python (Development)**
```bash
source venv/bin/activate
python main.py
```

**Option 2: Uvicorn with Reload**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Option 3: Docker**
```bash
docker build -t eafit-bikes-reservations .
docker run -p 8000:8000 --env-file .env --network host eafit-bikes-reservations
```

The API will be available at `http://localhost:8000`

### Health Check
```bash
curl http://localhost:8000/health
# Expected response: {"status":"healthy","service":"reservations"}
```

## API Documentation

Once the server is running, interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
reservations/
├── config/
│   ├── __init__.py
│   └── config.py           # Configuration & environment variables
├── models/
│   ├── __init__.py
│   └── reservations.py     # SQLAlchemy ORM models
├── schemas/
│   ├── __init__.py
│   └── reservations.py     # Pydantic request/response schemas
├── repositories/
│   ├── __init__.py
│   └── reservations.py     # Data access layer
├── services/
│   ├── __init__.py
│   └── reservations.py     # Business logic layer
├── routes/
│   ├── __init__.py
│   └── reservations.py     # API endpoints
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker container configuration
├── .env.example           # Environment variables template
├── DATABASE.md            # Database documentation
└── README.md              # This file
```

## API Endpoints

### Reservations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reservations/` | Create a new reservation |
| GET | `/reservations/` | Get all reservations |
| GET | `/reservations/{reservation_id}` | Get a specific reservation |
| GET | `/reservations/bike/{bike_id}` | Get all reservations for a bike |
| GET | `/reservations/user/{user_id}` | Get all reservations for a user |
| GET | `/reservations/active/all` | Get all active reservations |
| PUT | `/reservations/{reservation_id}` | Update a reservation |
| DELETE | `/reservations/{reservation_id}` | Cancel a reservation |

### Request/Response Example

**Create Reservation:**
```bash
curl -X POST http://localhost:8000/reservations/ \
  -H "Content-Type: application/json" \
  -d '{
    "bike_id": "bike-123",
    "user_id": "user-456",
    "start_date": "2024-03-25T10:00:00",
    "end_date": "2024-03-25T12:00:00",
    "status": "active"
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "bike_id": "bike-123",
  "user_id": "user-456",
  "start_date": "2024-03-25T10:00:00",
  "end_date": "2024-03-25T12:00:00",
  "status": "active",
  "created_at": "2024-03-24T19:05:00",
  "updated_at": "2024-03-24T19:05:00"
}
```

## Architecture

The service follows a clean architecture pattern:

1. **Routes** - FastAPI endpoints
2. **Schemas** - Pydantic models for validation
3. **Services** - Business logic
4. **Repositories** - Data access operations
5. **Models** - SQLAlchemy ORM definitions
6. **Config** - Configuration management

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:password@localhost:5432/eafit_bikes` | PostgreSQL connection string |
| `RABBITMQ_HOST` | `localhost` | RabbitMQ broker hostname |
| `RABBITMQ_PORT` | `5672` | RabbitMQ broker port |
| `RABBITMQ_USER` | `guest` | RabbitMQ username |
| `RABBITMQ_PASSWORD` | `guest` | RabbitMQ password |
| `DEBUG` | `False` | Enable debug mode |

## Development

### Code Style
The project follows PEP 8 conventions. Ensure code is properly formatted.

### Adding New Features
1. Create the SQLAlchemy model in `models/`
2. Create Pydantic schemas in `schemas/`
3. Implement repository operations in `repositories/`
4. Add business logic in `services/`
5. Expose endpoints in `routes/`

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running on localhost:5432
- Check `DATABASE_URL` in `.env` file
- Ensure database credentials are correct

### RabbitMQ Connection Issues
- Verify RabbitMQ is running on localhost:5672
- Check `RABBITMQ_*` environment variables in `.env`

### Port Already in Use
Default port is 8000. Change it in the docker run command or when running locally:
```bash
# Local: uvicorn automatically finds an available port with --reload
uvicorn main:app --reload --port 8001

# Docker: change port mapping
docker run -p 8001:8000 eafit-bikes-reservations
```

### Import Errors
If you get import errors, ensure:
1. Virtual environment is activated: `source venv/bin/activate`
2. Dependencies are installed: `pip install -r requirements.txt`
3. Python path includes the project root

## License
See LICENSE file in the root directory.
