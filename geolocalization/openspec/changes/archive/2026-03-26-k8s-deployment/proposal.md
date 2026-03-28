## Why

The geolocalization microservice currently only runs via Docker Compose. The bikes microservice already has full Kubernetes manifests, and the README documents the expected K8s structure for geolocalization. Adding K8s deployment support brings this service to parity with the rest of the platform and enables orchestrated, multi-replica deployments.

## What Changes

- Add Kubernetes manifests for the geolocalization microservice under `k8s/`
- Include PostgreSQL + PostGIS database deployment and internal service
- Include the geolocalization app deployment (3 replicas) and LoadBalancer service
- Manage secrets (DATABASE_URL, RABBITMQ_URL, Postgres credentials) and config (APP_PORT, RUST_LOG) via K8s Secret and ConfigMap resources

## Capabilities

### New Capabilities
- `k8s-manifests`: Kubernetes deployment manifests for the geolocalization service, its PostGIS database, secrets, and configuration

### Modified Capabilities

_(none)_

## Impact

- **New files**: 6 YAML manifests in `k8s/` (secret, configmap, postgres-deployment, postgres-service, deployment, service)
- **No code changes**: The Rust application itself is unchanged; only infrastructure manifests are added
- **Dependencies**: Requires the `geolocalization:latest` Docker image to be built locally, and RabbitMQ to be running in the cluster (`rabbitmq-service:5672`)
- **Database**: Uses `postgis/postgis:16-3.4` image instead of plain `postgres:15` (PostGIS requirement)
