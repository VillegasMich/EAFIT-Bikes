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
    
    # RabbitMQ Configuration
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
    RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
    RABBITMQ_VHOST = os.getenv("RABBITMQ_VHOST", "/")
    
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


config = Config()
