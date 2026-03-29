import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration"""
    
    # Database Configuration
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/eafit_bikes"
    )
    
    # Database Connection Pool Settings
    DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "20"))
    DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "40"))
    DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))
    DB_POOL_PRE_PING = os.getenv("DB_POOL_PRE_PING", "True").lower() == "true"
    
    # RabbitMQ Configuration
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
    RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
    RABBITMQ_VHOST = os.getenv("RABBITMQ_VHOST", "/")
    RABBITMQ_QUEUE_NAME = os.getenv("RABBITMQ_QUEUE_NAME", "bike_created_events")
    RABBITMQ_EXCHANGE_NAME = os.getenv("RABBITMQ_EXCHANGE_NAME", "bike_service")
    
    @property
    def RABBITMQ_URL(self) -> str:
        """Construct RabbitMQ connection URL"""
        return (
            f"amqp://{self.RABBITMQ_USER}:{self.RABBITMQ_PASSWORD}"
            f"@{self.RABBITMQ_HOST}:{self.RABBITMQ_PORT}/{self.RABBITMQ_VHOST}"
        )
    
    # Application Settings
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    APP_NAME = "EAFIT Bikes - Reservations Service"
    VERSION = "1.0.0"
    
    @classmethod
    def validate_database_url(cls) -> None:
        """Validate database URL is properly configured"""
        if not cls.DATABASE_URL or cls.DATABASE_URL.startswith("postgresql://user:password"):
            raise ValueError(
                "DATABASE_URL environment variable is not properly configured. "
                "Please set it to a valid PostgreSQL connection string."
            )


config = Config()
