# EAFIT-Bikes
# Bikes Microservice

Microservicio encargado de la gestión del catálogo de bicicletas del sistema EAFIT-Bikes. Expone una API REST para crear, consultar, actualizar y eliminar bicicletas, y publica eventos a RabbitMQ cuando una bicicleta es creada o eliminada.

---

## Datos que maneja

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int | Identificador único, autoincremental |
| `marca` | string | Marca de la bicicleta |
| `tipo` | enum | `Cross`, `Mountain bike`, `Ruta` |
| `color` | string | Color de la bicicleta |

> El estado de disponibilidad (disponible/no disponible) es responsabilidad del microservicio de reservas.

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/bikes` | Crear una bicicleta |
| `GET` | `/bikes` | Listar todas las bicicletas |
| `GET` | `/bikes/{id}` | Obtener una bicicleta por ID |
| `GET` | `/bikes/by-ids?bike_ids=1&bike_ids=2` | Obtener varias bicicletas por lista de IDs |
| `PUT` | `/bikes/{id}` | Actualizar una bicicleta |
| `DELETE` | `/bikes/{id}` | Eliminar una bicicleta |

Documentación interactiva disponible en `/docs` una vez levantado el servicio.

---

## Eventos RabbitMQ

Este servicio publica eventos en la cola `bike_events` en los siguientes casos:

**Bicicleta creada:**
```json
{
  "event": "bike_created",
  "bike_id": 5
}
```

**Bicicleta eliminada:**
```json
{
  "event": "bike_deleted",
  "bike_id": 5
}
```

> Los microservicios que necesiten reaccionar a estos eventos deben conectarse a RabbitMQ y consumir la cola `bike_events`.

---

## Variables de entorno

| Variable | Descripción | Ejemplo local |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://admin:admin123@db:5432/bikesdb` |
| `RABBITMQ_URL` | Conexión a RabbitMQ | `amqp://admin:admin123@host.docker.internal:5672/` |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) con Kubernetes habilitado
- RabbitMQ corriendo (ver rama `microservice/rabbitmq`)

---

## Correr localmente con Docker Compose

> Asegúrate de tener RabbitMQ corriendo antes de levantar este servicio.
> Ve a la rama `microservice/rabbitmq` y levanta su `docker-compose.yml` primero.

**Terminal 1 — RabbitMQ:**
```bash
git checkout microservice/rabbitmq
cd rabbitmq-service
docker compose up
```

**Terminal 2 — Bikes:**
```bash
git checkout microservice/bikes
cd bikes-service
docker compose up --build
```

La app estará disponible en:
- API: http://localhost:8000/docs
- Base de datos: `localhost:5432`

---

## Desplegar en Kubernetes

### 1. Construir la imagen Docker
```bash
cd bikes-service
docker build -t bikes-service:latest .
```

### 2. Aplicar los manifiestos
```bash
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### 3. Verificar que todo esté corriendo
```bash
kubectl get pods
kubectl get services
```

Deberías ver 3 réplicas de `bikes-deployment` y 3 de `postgres-deployment` en estado `Running`.

La app estará disponible en:
- API: http://localhost/docs
- Panel RabbitMQ: http://localhost:15672

### 4. Eliminar los recursos
```bash
kubectl delete -f k8s/
```

---

## Estructura del proyecto

```
bikes-service/
├── app/
│   ├── __init__.py
│   ├── main.py          # Arranca la app y registra rutas
│   ├── database.py      # Conexión a PostgreSQL
│   ├── models.py        # Modelos ORM (SQLAlchemy)
│   ├── schemas.py       # Schemas de validación (Pydantic)
│   ├── router.py        # Endpoints HTTP
│   ├── crud.py          # Operaciones con la base de datos
│   └── publisher.py     # Publicación de eventos a RabbitMQ
├── k8s/
│   ├── secret.yaml
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── postgres-deployment.yaml
│   └── postgres-service.yaml
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## 🔧 Tecnologías

- **Python 3.14** + **FastAPI** — API REST
- **SQLAlchemy** + **PostgreSQL** — Persistencia
- **Pika** + **RabbitMQ** — Mensajería asíncrona
- **Docker** + **Docker Compose** — Contenedores
- **Kubernetes** — Orquestación (3 réplicas por servicio)