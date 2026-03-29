#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping Reservations service..."
docker compose -f "$SCRIPT_DIR/reservations/docker-compose.yml" down -v

echo "Stopping Geolocalization service..."
docker compose -f "$SCRIPT_DIR/geolocalization/docker-compose.yml" down -v

echo "Stopping Eventos service..."
docker compose -f "$SCRIPT_DIR/eventos/docker-compose.yaml" down -v

echo "Stopping Bikes service..."
docker compose -f "$SCRIPT_DIR/bikes-service/docker-compose.yaml" down -v

echo "Stopping RabbitMQ..."
docker compose -f "$SCRIPT_DIR/rabbitmq-service/docker-compose.yml" down -v

echo "All services stopped and volumes removed."
