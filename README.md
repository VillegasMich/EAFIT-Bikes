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

# RabbitMQ Infrastructure Service

Servicio de infraestructura compartida de mensajería para el sistema EAFIT-Bikes. Provee el broker de mensajes RabbitMQ que permite la comunicación asíncrona entre los microservicios del sistema.

---

## Colas definidas

| Cola | Publicador | Consumidores |
|---|---|---|
| `bike_events` | `microservice/bikes` | `microservice/reservas` |

### Formato de mensajes en `bike_events`

Ver la sección [Eventos RabbitMQ](#eventos-rabbitmq) arriba.

---

## Credenciales

| Variable | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin123` |
| Puerto AMQP | `5672` |
| Puerto Panel Web | `15672` |

---

## Conexión desde otros microservicios

| Contexto | RABBITMQ_URL |
|---|---|
| Docker Compose (Mac) | `amqp://admin:admin123@host.docker.internal:5672/` |
| Kubernetes | `amqp://admin:admin123@rabbitmq-service:5672/` |

> En Kubernetes los microservicios se comunican por nombre de servicio, no por IP. Asegúrate de que tu variable de entorno `RABBITMQ_URL` apunte a `rabbitmq-service` en los secrets de K8s.

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

Panel de administración disponible en: http://localhost:15672

**Terminal 2 — Bikes:**
```bash
git checkout microservice/bikes
cd bikes-service
docker compose up --build
```

La app estará disponible en:
- API: http://localhost:8000/docs
- Base de datos: `localhost:5432`

> Los demás microservicios deben usar `host.docker.internal:5672` como host de RabbitMQ cuando corren con Docker Compose en Mac.

---

## Desplegar en Kubernetes

Todos los servicios se exponen a través de un **Nginx Ingress** que enruta el tráfico por path:

| Path | Servicio |
|------|----------|
| `/bikes/*` | `bikes-service` |
| `/docs` | `bikes-service` (Swagger UI) |
| `/locations/*` | `geo-service` |
| `/health` | `geo-service` |

### 1. Habilitar el Ingress Controller

**Minikube:**
```bash
minikube addons enable ingress
```

**Docker Desktop:**
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml
```

### 2. Construir las imágenes Docker

**Minikube** — las imágenes deben existir dentro del Docker de Minikube:
```bash
eval $(minikube docker-env)
docker build -t bikes-service:latest bikes-service/
docker build -t geolocalization:latest geolocalization/
```

**Docker Desktop** — basta con construir normalmente:
```bash
docker build -t bikes-service:latest bikes-service/
docker build -t geolocalization:latest geolocalization/
```

### 3. Aplicar los manifiestos

```bash
# RabbitMQ
kubectl apply -f rabbitmq-service/k8s/deployment.yaml
kubectl apply -f rabbitmq-service/k8s/service.yaml

# Bikes
kubectl apply -f bikes-service/k8s/secret.yaml
kubectl apply -f bikes-service/k8s/configmap.yaml
kubectl apply -f bikes-service/k8s/postgres-deployment.yaml
kubectl apply -f bikes-service/k8s/postgres-service.yaml
kubectl apply -f bikes-service/k8s/deployment.yaml
kubectl apply -f bikes-service/k8s/service.yaml

# Geolocalization
kubectl apply -f geolocalization/k8s/secret.yaml
kubectl apply -f geolocalization/k8s/configmap.yaml
kubectl apply -f geolocalization/k8s/postgres-deployment.yaml
kubectl apply -f geolocalization/k8s/postgres-service.yaml
kubectl apply -f geolocalization/k8s/deployment.yaml
kubectl apply -f geolocalization/k8s/service.yaml

# Ingress
kubectl apply -f k8s/ingress.yaml
```

### 4. Verificar que todo esté corriendo

```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

Deberías ver las réplicas de cada deployment en estado `Running` y el ingress `eafit-bikes-ingress` con una dirección asignada.

### 5. Acceder a los servicios

**Docker Desktop:** los endpoints están disponibles directamente en `localhost`:
- Bikes API: http://localhost/bikes
- Swagger UI: http://localhost/docs
- Locations API: http://localhost/locations
- Health check: http://localhost/health

**Minikube:** usa la IP de Minikube (`minikube ip`):
- Bikes API: http://\<minikube-ip\>/bikes
- Swagger UI: http://\<minikube-ip\>/docs
- Locations API: http://\<minikube-ip\>/locations
- Health check: http://\<minikube-ip\>/health

**Panel de RabbitMQ** (ambos entornos):
```bash
kubectl port-forward svc/rabbitmq-service 15672:15672
```
Luego acceder a: http://localhost:15672

### 6. Eliminar los recursos

```bash
kubectl delete -f k8s/
kubectl delete -f bikes-service/k8s/
kubectl delete -f geolocalization/k8s/
kubectl delete -f rabbitmq-service/k8s/
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

rabbitmq-service/
├── docker-compose.yml   # Para desarrollo local
└── k8s/
    ├── deployment.yaml  # 3 réplicas de RabbitMQ
    └── service.yaml     # Expone puertos 5672 y 15672
```

---

## Tecnologías

- **Python 3.14** + **FastAPI** — API REST
- **SQLAlchemy** + **PostgreSQL** — Persistencia
- **Pika** + **RabbitMQ** — Mensajería asíncrona
- **RabbitMQ 3** con plugin de management
- **Docker** + **Docker Compose** — Contenedores
- **Kubernetes** — Orquestación (3 réplicas por servicio)

---

# Geolocalization Microservice

Microservicio encargado de almacenar y servir datos de geolocalización en tiempo real de las bicicletas. El frontend consume este servicio para renderizar las posiciones de las bicicletas en un mapa interactivo (Google Maps / Leaflet).

> Este servicio **no** maneja la visualización del mapa. Solo provee datos de geolocalización vía API REST. Toda la lógica de visualización vive en el frontend.

---

## Datos que maneja

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único de la fila, auto-generado |
| `bicycle_id` | int | ID de la bicicleta (del microservicio de Bikes) |
| `location` | GEOGRAPHY(POINT, 4326) | Coordenadas geográficas (longitud, latitud) en WGS84 |
| `updated_at` | timestamptz | Timestamp de la última actualización de posición |

Cada bicicleta puede tener múltiples filas de ubicación (historial de movimiento).

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/locations` | Listar todas las ubicaciones de bicicletas |
| `GET` | `/locations?latest=true` | Solo la ubicación más reciente por bicicleta |
| `GET` | `/locations/bicycle/:bicycle_id` | Ubicaciones de una bicicleta específica |
| `POST` | `/locations` | Registrar una posición GPS de una bicicleta |
| `POST` | `/locations/batch` | Registrar múltiples posiciones GPS en una sola operación |

**Validación de coordenadas:** latitud ∈ [-90, 90], longitud ∈ [-180, 180]. Valores inválidos retornan `422 Unprocessable Entity`.

Health check disponible en: `GET /health`

---

## Eventos RabbitMQ

Este servicio **consume** eventos de la cola `bike_events`. Si `RABBITMQ_URL` no está configurado o RabbitMQ no está disponible, el servidor HTTP inicia normalmente sin el consumidor.

| Evento | Acción |
|---|---|
| `bike_created` | Inserta una ubicación por defecto en la Universidad EAFIT (6.2006, -75.5783) |
| `bike_deleted` | Elimina todas las filas de ubicación de esa bicicleta |

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL con PostGIS | `postgres://user:pass@db:5432/geolocalization` |
| `APP_PORT` | Puerto en el que escucha el servicio | `8080` |
| `RUST_LOG` | Nivel de log (default: `error`) | `info`, `geolocalization=debug` |
| `RABBITMQ_URL` | Conexión a RabbitMQ para eventos de bicicletas | `amqp://admin:admin123@host.docker.internal:5672/` |

---

## Correr localmente con Docker Compose

> Asegúrate de tener RabbitMQ corriendo antes si quieres que el consumidor de eventos funcione.

```bash
git checkout microservice/geolocalization
cd geolocalization
cp .env.example .env
docker compose up --build
```

La app estará disponible en:
- API: http://localhost:8080/health
- Base de datos: `localhost:5433`

### Seed data

El proyecto incluye un binario de seed que puebla la base de datos con datos de prueba — múltiples bicicletas con rutas GPS cerca del campus EAFIT.

```bash
# La base de datos debe estar corriendo
docker compose up -d db

# Ejecutar el seed
cargo run --bin seed
```

### Modo live ingestor

Inserta una nueva posición por bicicleta cada segundo, simulando movimiento continuo a lo largo de rutas predefinidas.

```bash
cargo run --bin seed -- --live
```

### Movement simulator

Mueve todas las bicicletas existentes en la base de datos a posiciones aleatorias cercanas cada segundo.

```bash
cargo run --bin mover
```

---

## Desplegar en Kubernetes

El despliegue de todos los microservicios (incluyendo Geolocalization) se documenta en la sección [Desplegar en Kubernetes](#desplegar-en-kubernetes) del Bikes Microservice arriba.

### Conexión a RabbitMQ en Kubernetes

La variable `RABBITMQ_URL` en el secret debe apuntar al servicio de RabbitMQ por nombre:

```
amqp://admin:admin123@rabbitmq-service:5672/
```

---

## Tecnologías (Geolocalization)

- **Rust 1.94** + **Axum** — API REST sobre el runtime async **Tokio**
- **SQLx** — Driver de base de datos con verificación de queries en tiempo de compilación
- **PostgreSQL + PostGIS** — Almacenamiento geoespacial (`GEOGRAPHY(POINT, 4326)`, WGS84)
- **Lapin** — Cliente RabbitMQ para consumir eventos de bicicletas
- **Docker** + **Docker Compose** — Contenedores
- **Kubernetes** — Orquestación (3 réplicas por servicio)
