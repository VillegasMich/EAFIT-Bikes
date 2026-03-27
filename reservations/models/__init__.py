"""SQLAlchemy models and database configuration"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
from config.config import config
import logging

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine
engine = create_engine(
    config.DATABASE_URL,
    poolclass=NullPool,  # Use NullPool to avoid connection issues with Docker
    echo=config.DEBUG
)

# Create base class for models
Base = declarative_base()

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    """
    FastAPI dependency for database sessions.
    Yields a database session that will be closed after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_database_connection() -> bool:
    """
    Test the database connection.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info("Database connection test successful")
            return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False


# Import models to ensure they are registered with Base
from models.reservations import Reservation

__all__ = [
    'engine',
    'Base',
    'SessionLocal',
    'get_db',
    'test_database_connection',
    'Reservation'
]
