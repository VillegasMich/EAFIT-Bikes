from sqlalchemy import Column, String, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from models import Base


class Reservation(Base):
    """SQLAlchemy model for reservations table"""
    __tablename__ = "reservations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )
    bike_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, default='active', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Indexes
    __table_args__ = (
        Index('idx_reservations_bike_id', 'bike_id'),
        Index('idx_reservations_user_id', 'user_id'),
    )

    def __repr__(self):
        return f"<Reservation(id={self.id}, bike_id={self.bike_id}, user_id={self.user_id})>"
