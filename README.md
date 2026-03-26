# EAFIT-Bikes
# RabbitMQ Infrastructure Service

Servicio de infraestructura compartida de mensajería para el sistema EAFIT-Bikes. Provee el broker de mensajes RabbitMQ que permite la comunicación asíncrona entre los microservicios del sistema.

---

## Colas definidas

| Cola | Publicador | Consumidores |
|---|---|---|
| `bike_events` | `microservice/bikes` | `microservice/reservas` |

### Formato de mensajes en `bike_events`

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

---

## Credenciales

| Variable | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin123` |
| Puerto AMQP | `5672` |
| Puerto Panel Web | `15672` |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) con Kubernetes habilitado

---

## Correr localmente con Docker Compose

```bash
git checkout microservice/rabbitmq
cd rabbitmq-service
docker compose up
```

Panel de administración disponible en: http://localhost:15672

> Los demás microservicios deben usar `host.docker.internal:5672` como host de RabbitMQ cuando corren con Docker Compose en Mac.

---

## Desplegar en Kubernetes

### 1. Aplicar los manifiestos
```bash
kubectl apply -f rabbitmq-service/k8s/deployment.yaml
kubectl apply -f rabbitmq-service/k8s/service.yaml
```

### 2. Verificar que todo esté corriendo
```bash
kubectl get pods
kubectl get services
```

Deberías ver 3 réplicas de `rabbitmq-deployment` en estado `Running` y el servicio `rabbitmq-service` con `EXTERNAL-IP: localhost`.

```
NAME                                   READY   STATUS    RESTARTS   AGE
rabbitmq-deployment-xxx   1/1     Running   0          10s
rabbitmq-deployment-xxx   1/1     Running   0          10s
rabbitmq-deployment-xxx   1/1     Running   0          10s

NAME               TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)
rabbitmq-service   LoadBalancer   10.x.x.x      localhost     5672/TCP,15672/TCP
```

Panel de administración disponible en: http://localhost:15672

### 3. Eliminar los recursos
```bash
kubectl delete -f rabbitmq-service/k8s/
```

---

## Conexión desde otros microservicios

| Contexto | RABBITMQ_URL |
|---|---|
| Docker Compose (Mac) | `amqp://admin:admin123@host.docker.internal:5672/` |
| Kubernetes | `amqp://admin:admin123@rabbitmq-service:5672/` |

> En Kubernetes los microservicios se comunican por nombre de servicio, no por IP. Asegúrate de que tu variable de entorno `RABBITMQ_URL` apunte a `rabbitmq-service` en los secrets de K8s.

---

## Estructura del proyecto

```
rabbitmq-service/
├── docker-compose.yml   # Para desarrollo local
└── k8s/
    ├── deployment.yaml  # 3 réplicas de RabbitMQ
    └── service.yaml     # Expone puertos 5672 y 15672
```

---

## Tecnologías

- **RabbitMQ 3** con plugin de management
- **Docker** + **Docker Compose** — Desarrollo local
- **Kubernetes** — Orquestación (3 réplicas para alta disponibilidad)