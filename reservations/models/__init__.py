from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config.config import config

# Create engine
engine = create_engine(
    config.DATABASE_URL,
    echo=config.DEBUG,
    pool_pre_ping=True,
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all models
Base = declarative_base()


def get_db():
    """Dependency for FastAPI to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
