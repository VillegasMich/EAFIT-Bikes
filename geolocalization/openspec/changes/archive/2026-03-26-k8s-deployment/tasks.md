## 1. Kubernetes Secrets and ConfigMap

- [x] 1.1 Create `k8s/secret.yaml` with `geo-secret` containing base64-encoded `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL` (pointing to `geo-db-service:5432/geolocalization`), and `RABBITMQ_URL` (pointing to `rabbitmq-service:5672`)
- [x] 1.2 Create `k8s/configmap.yaml` with `geo-config` containing `APP_PORT: "8080"` and `RUST_LOG: "error"`

## 2. PostGIS Database Deployment

- [x] 2.1 Create `k8s/postgres-deployment.yaml` with 3 replicas of `postgis/postgis:16-3.4`, label `app: geo-postgres`, env vars from `geo-secret`, and `POSTGRES_DB: geolocalization`
- [x] 2.2 Create `k8s/postgres-service.yaml` as ClusterIP service named `geo-db-service` on port 5432, selecting `app: geo-postgres`

## 3. Geolocalization App Deployment

- [x] 3.1 Create `k8s/deployment.yaml` with 3 replicas of `geolocalization:latest` (`imagePullPolicy: Never`), label `app: geolocalization`, container port 8080, `DATABASE_URL` and `RABBITMQ_URL` from `geo-secret`, `APP_PORT` and `RUST_LOG` from `geo-config`
- [x] 3.2 Create `k8s/service.yaml` as LoadBalancer service named `geo-service` mapping port 80 → target port 8080, selecting `app: geolocalization`

## 4. Documentation

- [x] 4.1 Update README.md Kubernetes section to remove the "pendiente" note and reference the actual manifest files with concrete `kubectl apply` commands
