from sqlalchemy import Column, String, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from models import Base


class Reservation(Base):
    """SQLAlchemy ORM model for reservations table
    
    Attributes:
        id: Unique identifier (UUID)
        bike_id: Reference to the bike (string ID from bike service)
        user_id: Reference to the user (string ID from user service)
        start_date: When the reservation begins
        end_date: When the reservation ends
        status: Current status ('active', 'cancelled', 'completed', etc.)
        created_at: Timestamp when record was created
        updated_at: Timestamp when record was last updated
    """
    __tablename__ = "reservations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        doc="Unique identifier for the reservation"
    )
    bike_id = Column(
        String,
        nullable=False,
        doc="Reference to the bike being reserved"
    )
    user_id = Column(
        String,
        nullable=True,
        doc="Reference to the user making the reservation"
    )
    start_date = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="Start date and time of the reservation"
    )
    end_date = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="End date and time of the reservation"
    )
    status = Column(
        String,
        default='available',
        nullable=False,
        doc="Current status of the reservation ('available' or 'reserved')"
    )
    created_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
        doc="Timestamp when the reservation was created"
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Timestamp when the reservation was last updated"
    )

    __table_args__ = (
        Index('idx_reservations_bike_id', 'bike_id'),
        Index('idx_reservations_user_id', 'user_id'),
    )

    def __repr__(self):
        return f"<Reservation(id={self.id}, bike_id={self.bike_id}, user_id={self.user_id}, status={self.status})>"
