## ADDED Requirements

### Requirement: Kubernetes Secret for credentials
The system SHALL provide a `secret.yaml` manifest containing base64-encoded values for `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`, and `RABBITMQ_URL`. The secret MUST be named `geo-secret`. The `DATABASE_URL` MUST point to `geo-db-service:5432/geolocalization`. The `RABBITMQ_URL` MUST point to `rabbitmq-service:5672`.

#### Scenario: Secret contains all required keys
- **WHEN** `kubectl apply -f k8s/secret.yaml` is executed
- **THEN** a Secret named `geo-secret` exists with keys `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`, and `RABBITMQ_URL`

### Requirement: Kubernetes ConfigMap for configuration
The system SHALL provide a `configmap.yaml` manifest named `geo-config` containing `APP_PORT` set to `"8080"` and `RUST_LOG` set to `"error"`.

#### Scenario: ConfigMap contains app configuration
- **WHEN** `kubectl apply -f k8s/configmap.yaml` is executed
- **THEN** a ConfigMap named `geo-config` exists with `APP_PORT=8080` and `RUST_LOG=error`

### Requirement: PostGIS database deployment
The system SHALL provide a `postgres-deployment.yaml` manifest that deploys 3 replicas of `postgis/postgis:16-3.4`. Each pod MUST use label `app: geo-postgres`. Environment variables `POSTGRES_USER`, `POSTGRES_PASSWORD` MUST be sourced from `geo-secret`, and `POSTGRES_DB` MUST be set to `geolocalization`.

#### Scenario: PostGIS pods are running
- **WHEN** `kubectl apply -f k8s/postgres-deployment.yaml` is executed
- **THEN** 3 pods with label `app: geo-postgres` are created running the `postgis/postgis:16-3.4` image on port 5432

### Requirement: PostGIS database service
The system SHALL provide a `postgres-service.yaml` manifest that creates a ClusterIP service named `geo-db-service` selecting pods with label `app: geo-postgres`, exposing port 5432.

#### Scenario: Database is reachable internally
- **WHEN** `kubectl apply -f k8s/postgres-service.yaml` is executed
- **THEN** a ClusterIP service named `geo-db-service` exists routing TCP port 5432 to pods with label `app: geo-postgres`

### Requirement: Geolocalization app deployment
The system SHALL provide a `deployment.yaml` manifest that deploys 3 replicas of the `geolocalization:latest` image with `imagePullPolicy: Never`. Each pod MUST use label `app: geolocalization`. The container MUST expose port 8080. `DATABASE_URL` and `RABBITMQ_URL` MUST be sourced from `geo-secret`. `APP_PORT` and `RUST_LOG` MUST be sourced from `geo-config`.

#### Scenario: App pods are running with correct environment
- **WHEN** `kubectl apply -f k8s/deployment.yaml` is executed
- **THEN** 3 pods with label `app: geolocalization` are created with `DATABASE_URL` from `geo-secret`, `RABBITMQ_URL` from `geo-secret`, `APP_PORT` from `geo-config`, and `RUST_LOG` from `geo-config`

### Requirement: Geolocalization app service
The system SHALL provide a `service.yaml` manifest that creates a LoadBalancer service named `geo-service` selecting pods with label `app: geolocalization`, mapping external port 80 to container port 8080.

#### Scenario: Service exposes the API externally
- **WHEN** `kubectl apply -f k8s/service.yaml` is executed
- **THEN** a LoadBalancer service named `geo-service` exists routing TCP port 80 to target port 8080 on pods with label `app: geolocalization`
