## Context

The geolocalization microservice runs locally via Docker Compose but lacks Kubernetes manifests. The bikes microservice already has a complete K8s setup (`bikes-service/k8s/`) with 6 manifests: secret, configmap, postgres-deployment, postgres-service, app deployment (3 replicas), and LoadBalancer service. The README already documents the expected K8s structure for geolocalization. This design follows the same patterns established by the bikes service.

## Goals / Non-Goals

**Goals:**
- Create 6 K8s manifests that deploy the geolocalization service and its PostGIS database
- Follow the same conventions as `bikes-service/k8s/` (naming, labels, structure)
- Support 3 replicas for the app deployment
- Wire DATABASE_URL and RABBITMQ_URL via Secrets, APP_PORT and RUST_LOG via ConfigMap

**Non-Goals:**
- Persistent volumes for PostgreSQL (matches bikes-service pattern — no PVCs)
- Horizontal Pod Autoscaler or resource limits (can be added later)
- Ingress or network policies
- CI/CD pipeline for image building or deployment

## Decisions

### 1. Mirror bikes-service manifest structure
**Decision**: Use the exact same 6-file structure (`secret.yaml`, `configmap.yaml`, `postgres-deployment.yaml`, `postgres-service.yaml`, `deployment.yaml`, `service.yaml`).
**Rationale**: Consistency across the platform. Anyone who deployed bikes can deploy geolocalization the same way.
**Alternative**: Helm chart or Kustomize — rejected as overkill for the current project scope and inconsistent with the existing approach.

### 2. Use `postgis/postgis:16-3.4` for the database image
**Decision**: Use PostGIS image instead of plain `postgres:15`.
**Rationale**: The geolocalization service requires PostGIS extensions (`GEOGRAPHY(POINT, 4326)`, GIST indexes). The PostGIS image includes PostgreSQL with spatial extensions pre-installed.

### 3. Separate secret from bikes-service
**Decision**: Create a dedicated `geo-secret` rather than sharing `bikes-secret`.
**Rationale**: Each microservice should own its secrets independently. The DATABASE_URL points to a different database (`geolocalization` vs `bikesdb`) and a different internal service name (`geo-db-service` vs `db-service`).

### 4. App container port 8080
**Decision**: The geolocalization service listens on port 8080 (its default APP_PORT), exposed externally on port 80 via the LoadBalancer service.
**Rationale**: Matches the Docker Compose configuration and the APP_PORT documented in the README.

### 5. Naming convention: `geo-` prefix
**Decision**: Use `geo-` prefix for K8s resource names (e.g., `geo-deployment`, `geo-service`, `geo-db-service`, `geo-secret`, `geo-config`).
**Rationale**: Avoids collision with bikes-service resources in the same cluster while keeping names short and recognizable.

## Risks / Trade-offs

- **No persistent storage** → Database data is lost on pod restart. Acceptable for development/demo; production would need PVCs. Matches the bikes-service pattern.
- **3 Postgres replicas without replication** → Each replica is an independent database, not a cluster. This matches the bikes-service approach but is not suitable for production. The app deployment connects to whichever pod the service routes to, so data may be inconsistent across pods.
- **`imagePullPolicy: Never`** → Only works with locally-built images (Docker Desktop K8s). Not suitable for remote clusters.
- **Hardcoded base64 secrets** → Same approach as bikes-service. Acceptable for local development; production should use a secrets manager.
