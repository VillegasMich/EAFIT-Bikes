from sqlalchemy import Column, String, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from models import Base


class Bike(Base):
    """SQLAlchemy ORM model for bikes table
    
    Tracks registered bikes in the system. When a bike is created,
    it's registered here. When a bike is deleted, this entry is removed
    but reservation history is preserved.
    
    Attributes:
        bike_id: Unique identifier (string ID from bike service)
        created_at: Timestamp when the bike was registered
        updated_at: Timestamp when the bike record was last updated
    """
    __tablename__ = "bikes"

    bike_id = Column(
        String,
        primary_key=True,
        nullable=False,
        doc="Unique identifier for the bike"
    )
    created_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
        doc="Timestamp when the bike was registered"
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Timestamp when the bike record was last updated"
    )

    __table_args__ = (
        Index('idx_bikes_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<Bike(bike_id={self.bike_id})>"


class Reservation(Base):
    """SQLAlchemy ORM model for reservations table
    
    Represents an actual reservation with a specific user, bike, and date range.
    Availability is determined by checking for date conflicts with existing reservations.
    
    Attributes:
        id: Unique identifier (UUID)
        bike_id: Reference to the bike (string ID from bike service)
        user_id: Reference to the user (string ID from user service)
        start_date: When the reservation begins
        end_date: When the reservation ends
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
        nullable=False,
        doc="Reference to the user making the reservation"
    )
    start_date = Column(
        DateTime(timezone=True),
        nullable=False,
        doc="Start date and time of the reservation"
    )
    end_date = Column(
        DateTime(timezone=True),
        nullable=False,
        doc="End date and time of the reservation"
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
        Index('idx_reservations_bike_date_range', 'bike_id', 'start_date', 'end_date'),
    )

    def __repr__(self):
        return f"<Reservation(id={self.id}, bike_id={self.bike_id}, user_id={self.user_id})>"
