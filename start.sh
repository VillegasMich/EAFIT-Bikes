#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting RabbitMQ..."
docker compose -f "$SCRIPT_DIR/rabbitmq-service/docker-compose.yml" up -d

echo "Starting Bikes service..."
docker compose -f "$SCRIPT_DIR/bikes-service/docker-compose.yaml" up -d

echo "Starting Eventos service..."
docker compose -f "$SCRIPT_DIR/eventos/docker-compose.yaml" up -d

echo "Starting Geolocalization service..."
docker compose -f "$SCRIPT_DIR/geolocalization/docker-compose.yml" up -d

echo "Starting Reservations service..."
docker compose -f "$SCRIPT_DIR/reservations/docker-compose.yml" up -d

echo "Starting Auth service..."
docker compose -f "$SCRIPT_DIR/auth/docker-compose.yml" up -d

echo "All services started."
