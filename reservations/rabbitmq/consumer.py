import pika
import logging
import json
import time
import asyncio
from typing import Callable
from config.config import config
from models import SessionLocal
from services.bike_events import handle_bike_created_event, validate_bike_event

logger = logging.getLogger(__name__)


class RabbitMQConsumer:
    """RabbitMQ consumer for bike creation events"""
    
    def __init__(self, message_handler: Callable = None):
        """
        Initialize RabbitMQ consumer
        
        Args:
            message_handler: Callable that processes incoming messages
                           If not provided, uses default bike event handler
        """
        self.message_handler = message_handler or self._default_message_handler
        self.connection = None
        self.channel = None
        self.is_running = False
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 5
        self.reconnect_delay = 5  # seconds
        self.message_retry_count = {}  # Track retries per message
    
    def _default_message_handler(self, message: dict) -> None:
        """
        Default message handler that processes bike events
        
        Args:
            message: Parsed JSON message from RabbitMQ
        """
        # Validate message structure
        if not validate_bike_event(message):
            logger.error(f"Invalid bike event - missing required fields: {message}")
            raise ValueError(f"Invalid bike event: missing required fields")
        
        # Extract bike_id from event
        bike_id = message.get("bike_id")
        event_type = message.get("event_type", "bike.created")
        
        logger.info(f"Processing {event_type} event for bike_id='{bike_id}'")
        logger.debug(f"Full event data: {message}")
        
        # Get database session and process event
        db_session = SessionLocal()
        try:
            result = asyncio.run(handle_bike_created_event(bike_id, db_session))
            logger.info(f"Event processed successfully: {result['message']}")
        except Exception as e:
            logger.error(f"Error processing bike event: {e}", exc_info=True)
            raise
        finally:
            db_session.close()
    
    def connect(self) -> bool:
        """
        Establish connection to RabbitMQ broker
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            credentials = pika.PlainCredentials(
                config.RABBITMQ_USER,
                config.RABBITMQ_PASSWORD
            )
            
            connection_params = pika.ConnectionParameters(
                host=config.RABBITMQ_HOST,
                port=config.RABBITMQ_PORT,
                virtual_host=config.RABBITMQ_VHOST,
                credentials=credentials,
                connection_attempts=3,
                retry_delay=2,
                blocked_connection_timeout=300
            )
            
            self.connection = pika.BlockingConnection(connection_params)
            self.channel = self.connection.channel()
            
            logger.info(
                f"Connected to RabbitMQ at {config.RABBITMQ_HOST}:"
                f"{config.RABBITMQ_PORT}"
            )
            self.reconnect_attempts = 0
            return True
            
        except Exception as e:
            logger.error(f"RabbitMQ connection failed: {e}")
            self.reconnect_attempts += 1
            return False
    
    def setup_queue(self):
        """Configure exchange and queue bindings"""
        try:
            self.channel.exchange_declare(
                exchange=config.RABBITMQ_EXCHANGE_NAME,
                exchange_type='topic',
                durable=True
            )
            
            self.channel.queue_declare(
                queue=config.RABBITMQ_QUEUE_NAME,
                durable=True
            )
            
            self.channel.queue_bind(
                exchange=config.RABBITMQ_EXCHANGE_NAME,
                queue=config.RABBITMQ_QUEUE_NAME,
                routing_key='bike.created'
            )
            
            logger.info(
                f"Queue setup complete: '{config.RABBITMQ_QUEUE_NAME}' "
                f"<- '{config.RABBITMQ_EXCHANGE_NAME}' (routing: bike.created)"
            )
        except Exception as e:
            logger.error(f"Failed to setup queue: {e}")
            raise
    
    def message_callback(self, ch, method, properties, body):
        """
        Handle incoming messages from RabbitMQ
        
        Args:
            ch: Channel
            method: Method frame
            properties: Message properties
            body: Message body (bytes)
        """
        delivery_tag = method.delivery_tag
        message_id = f"{method.delivery_tag}:{body[:50]}"
        
        try:
            # Parse JSON message
            try:
                message = json.loads(body)
                logger.info(f"Received message: bike_id='{message.get('bike_id')}' event='{message.get('event_type', 'bike.created')}'")
            except json.JSONDecodeError as e:
                logger.error(
                    f"Invalid JSON in message: {e} | Raw: {body[:100]}"
                )
                ch.basic_ack(delivery_tag=delivery_tag)
                return
            
            # Process the message using the handler
            try:
                self.message_handler(message)
                ch.basic_ack(delivery_tag=delivery_tag)
                logger.info(f"Message acknowledged: bike_id='{message.get('bike_id')}'")
                if message_id in self.message_retry_count:
                    del self.message_retry_count[message_id]
                    
            except ValueError as e:
                # Validation error - don't requeue
                logger.warning(f"Validation error (rejecting): {str(e)[:80]}")
                ch.basic_ack(delivery_tag=delivery_tag)
                
            except Exception as e:
                # Other errors - try to requeue with limit
                retry_count = self.message_retry_count.get(message_id, 0)
                max_retries = 3
                
                if retry_count < max_retries:
                    logger.warning(
                        f"Processing failed [retry {retry_count + 1}/{max_retries}]: {str(e)[:80]}"
                    )
                    self.message_retry_count[message_id] = retry_count + 1
                    ch.basic_nack(delivery_tag=delivery_tag, requeue=True)
                else:
                    logger.error(f"Max retries exceeded for bike_id='{message.get('bike_id')}' - rejecting")
                    ch.basic_ack(delivery_tag=delivery_tag)
                    if message_id in self.message_retry_count:
                        del self.message_retry_count[message_id]
                
        except Exception as e:
            logger.error(f"Unexpected error in message handler: {e}", exc_info=True)
            try:
                ch.basic_ack(delivery_tag=delivery_tag)
            except Exception as ack_error:
                logger.error(f"Failed to send ACK: {ack_error}")
    
    def start(self):
        """Start consuming messages from the queue"""
        while self.reconnect_attempts < self.max_reconnect_attempts:
            try:
                if not self.connection or self.connection.is_closed:
                    if not self.connect():
                        time.sleep(self.reconnect_delay)
                        continue
                
                if not self.channel or self.channel.is_closed:
                    self.channel = self.connection.channel()
                
                self.setup_queue()
                
                # Set prefetch count to 1 for fair dispatch
                self.channel.basic_qos(prefetch_count=1)
                self.channel.basic_consume(
                    queue=config.RABBITMQ_QUEUE_NAME,
                    on_message_callback=self.message_callback
                )
                
                logger.info(f"Started consuming from queue '{config.RABBITMQ_QUEUE_NAME}'")
                self.is_running = True
                self.channel.start_consuming()
                
            except pika.exceptions.AMQPConnectionError as e:
                logger.warning(f"Connection lost: {e}")
                self.reconnect_attempts += 1
                if self.reconnect_attempts < self.max_reconnect_attempts:
                    logger.info(
                        f"Reconnecting... ({self.reconnect_attempts}/{self.max_reconnect_attempts})"
                    )
                    time.sleep(self.reconnect_delay)
            except KeyboardInterrupt:
                logger.info("Consumer interrupted")
                self.stop()
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}", exc_info=True)
                self.reconnect_attempts += 1
                if self.reconnect_attempts < self.max_reconnect_attempts:
                    time.sleep(self.reconnect_delay)
        
        if self.reconnect_attempts >= self.max_reconnect_attempts:
            logger.error("Max reconnection attempts exceeded. Consumer stopped.")
    
    def stop(self):
        """Stop consuming messages"""
        self.is_running = False
        if self.channel and self.channel.is_open:
            self.channel.stop_consuming()
        if self.connection and self.connection.is_open:
            self.connection.close()
        logger.info("RabbitMQ consumer stopped")
