#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting RabbitMQ..."
docker compose -f "$SCRIPT_DIR/rabbitmq-service/docker-compose.yml" up -d

echo "Building and starting Bikes service..."
docker compose -f "$SCRIPT_DIR/bikes-service/docker-compose.yaml" up -d --build

echo "Building and starting Eventos service..."
docker compose -f "$SCRIPT_DIR/eventos/docker-compose.yaml" up -d --build

echo "Building and starting Geolocalization service..."
docker compose -f "$SCRIPT_DIR/geolocalization/docker-compose.yml" up -d --build

echo "Building and starting Reservations service..."
docker compose -f "$SCRIPT_DIR/reservations/docker-compose.yml" up -d --build

echo "All services built and started."
