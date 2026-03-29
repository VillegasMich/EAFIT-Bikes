import pika
import json
import os

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin123@localhost:5672/")
EXCHANGE_NAME = "bike_service"

def publish_event(event: str, bike_id: int):
    try:
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type="topic", durable=True)
        # bike_created -> bike.created, bike_deleted -> bike.deleted
        routing_key = "bike." + event.removeprefix("bike_")
        message = json.dumps({"event": event, "bike_id": bike_id})
        channel.basic_publish(
            exchange=EXCHANGE_NAME,
            routing_key=routing_key,
            body=message,
            properties=pika.BasicProperties(delivery_mode=2)
        )
        connection.close()
    except Exception as e:
        print(f"Error publicando evento: {e}")