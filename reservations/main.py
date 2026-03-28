from fastapi import FastAPI
from routes.reservations import router as reservations_router
from models import engine, Base, test_database_connection
from config.config import config
from config.logging import configure_logging
from rabbitmq.consumer import RabbitMQConsumer
from contextlib import asynccontextmanager
import logging
import threading

# Configure logging at startup
configure_logging(debug=config.DEBUG)
logger = logging.getLogger(__name__)

# Global instances
rabbitmq_consumer = None
consumer_thread = None


def start_rabbitmq_consumer():
    """Start RabbitMQ consumer in a separate thread"""
    global rabbitmq_consumer
    try:
        logger.info("Initializing RabbitMQ consumer...")
        rabbitmq_consumer = RabbitMQConsumer()
        
        if rabbitmq_consumer.connect():
            logger.info("RabbitMQ connected and consumer started")
            rabbitmq_consumer.start()
        else:
            logger.error("RabbitMQ connection failed - check if RabbitMQ is running on localhost:5672")
    except Exception as e:
        logger.error(f"RabbitMQ consumer error: {e}", exc_info=True)


def stop_rabbitmq_consumer():
    """Stop RabbitMQ consumer"""
    global rabbitmq_consumer
    if rabbitmq_consumer:
        try:
            logger.info("Stopping RabbitMQ consumer...")
            rabbitmq_consumer.stop()
        except Exception as e:
            logger.error(f"Error stopping RabbitMQ consumer: {e}", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic for the FastAPI application"""
    global consumer_thread
    
    # Startup
    logger.info("Starting EAFIT Bikes - Reservations Service...")
    
    # Test database connection
    if not test_database_connection():
        logger.error("Database connection failed - check DATABASE_URL in config")
        raise RuntimeError("Database connection failed at startup")
    
    logger.info("Database connection verified")
    
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized")
    
    # Start RabbitMQ consumer in a separate thread
    consumer_thread = threading.Thread(target=start_rabbitmq_consumer, daemon=True)
    consumer_thread.start()
    logger.info("Service startup complete - ready to receive requests")
    
    yield
    
    # Shutdown
    logger.info("Shutting down EAFIT Bikes - Reservations Service...")
    stop_rabbitmq_consumer()
    engine.dispose()
    logger.info("Service shutdown complete")


app = FastAPI(
    title="EAFIT Bikes - Reservations Service",
    version="1.0.0",
    lifespan=lifespan
)

# Include routes
app.include_router(reservations_router)


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "reservations"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

