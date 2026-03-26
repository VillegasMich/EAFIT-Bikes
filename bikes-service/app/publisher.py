import pika
import json
import os

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin123@localhost:5672/")

def publish_event(event: str, bike_id: int):
    try:
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        channel = connection.channel()
        channel.queue_declare(queue="bike_events", durable=True)
        message = json.dumps({"event": event, "bike_id": bike_id})
        channel.basic_publish(
            exchange="",
            routing_key="bike_events",
            body=message,
            properties=pika.BasicProperties(delivery_mode=2)
        )
        connection.close()
    except Exception as e:
        print(f"Error publicando evento: {e}")