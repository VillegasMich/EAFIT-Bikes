from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from zoneinfo import ZoneInfo
import os


class BikeCreate(BaseModel):
    """Schema for registering a new bike"""
    bike_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for the bike",
        example="bike-12345"
    )

    @field_validator('bike_id')
    @classmethod
    def validate_bike_id_not_empty(cls, v):
        """Ensure bike_id is non-empty string"""
        if not v or not v.strip():
            raise ValueError('bike_id must be a non-empty string')
        return v.strip()


class BikeResponse(BaseModel):
    """Schema for returning bike registration data"""
    bike_id: str = Field(
        ...,
        description="Unique identifier for the bike",
        example="bike-12345"
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the bike was registered",
        example="2025-01-15T10:00:00Z"
    )
    updated_at: datetime = Field(
        ...,
        description="Timestamp when the bike record was last updated",
        example="2025-01-15T10:00:00Z"
    )

    model_config = {"from_attributes": True}


def ensure_timezone_aware(v):
    """
    Convert naive datetimes to timezone-aware datetimes.
    
    For development/testing with local timezone:
    - If env var ASSUME_LOCAL_TZ is set, use that timezone (e.g., "America/Bogota")
    - Otherwise, assume UTC (production behavior)
    """
    if v is None:
        return v
    
    if isinstance(v, datetime):
        # If datetime is already timezone-aware, return as-is
        if v.tzinfo is not None:
            return v
        
        # For naive datetimes, check if we should use local timezone
        assume_local_tz = os.getenv('ASSUME_LOCAL_TZ')
        
        if assume_local_tz:
            # Development mode: assume local timezone
            try:
                tz = ZoneInfo(assume_local_tz)
                # Treat the naive datetime as being in the local timezone
                return v.replace(tzinfo=tz)
            except Exception as e:
                # Fall back to UTC if timezone is invalid
                return v.replace(tzinfo=timezone.utc)
        else:
            # Production mode: assume UTC
            return v.replace(tzinfo=timezone.utc)
    
    return v


class ReservationCreate(BaseModel):
    """Schema for creating a new reservation
    
    Creates a reservation for a bike during a specific date range.
    The system will validate that:
    1. The bike exists in the bikes table
    2. No conflicting reservations exist for the date range
    """
    bike_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for the bike",
        example="bike-12345"
    )
    user_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for the user",
        example="user-67890"
    )
    start_date: datetime = Field(
        ...,
        description="Start date and time of the reservation (UTC)",
        example="2025-01-15T10:00:00Z"
    )
    end_date: datetime = Field(
        ...,
        description="End date and time of the reservation (UTC)",
        example="2025-01-15T14:00:00Z"
    )

    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_timezone_aware(cls, v):
        """Convert naive datetimes to timezone-aware datetimes"""
        return ensure_timezone_aware(v)

    @field_validator('end_date')
    @classmethod
    def validate_end_after_start(cls, v, info):
        """Ensure end_date is after start_date"""
        if 'start_date' in info.data and info.data['start_date'] is not None:
            if v <= info.data['start_date']:
                raise ValueError('end_date must be after start_date')
        return v

    @field_validator('bike_id', 'user_id')
    @classmethod
    def validate_ids_not_empty(cls, v):
        """Ensure IDs are non-empty strings"""
        if not v or not v.strip():
            raise ValueError('IDs must be non-empty strings')
        return v.strip()


class ReservationUpdate(BaseModel):
    """Schema for updating a reservation
    
    Allows updating start_date and/or end_date for an existing reservation.
    """
    start_date: Optional[datetime] = Field(
        None,
        description="Updated start date and time (UTC)",
        example="2025-01-15T10:00:00Z"
    )
    end_date: Optional[datetime] = Field(
        None,
        description="Updated end date and time (UTC)",
        example="2025-01-15T14:00:00Z"
    )

    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_timezone_aware(cls, v):
        """Convert naive datetimes to timezone-aware datetimes"""
        return ensure_timezone_aware(v)

    @field_validator('end_date')
    @classmethod
    def validate_end_after_start_if_present(cls, v, info):
        """Ensure end_date is after start_date if both are provided"""
        if v is not None and 'start_date' in info.data and info.data['start_date'] is not None:
            if v <= info.data['start_date']:
                raise ValueError('end_date must be after start_date')
        return v


class ReservationResponse(BaseModel):
    """Schema for returning complete reservation data"""
    id: UUID = Field(
        ...,
        description="Unique identifier for the reservation",
        example="550e8400-e29b-41d4-a716-446655440000"
    )
    bike_id: str = Field(
        ...,
        description="Unique identifier for the bike",
        example="bike-12345"
    )
    user_id: str = Field(
        ...,
        description="Unique identifier for the user",
        example="user-67890"
    )
    start_date: datetime = Field(
        ...,
        description="Start date and time of the reservation",
        example="2025-01-15T10:00:00Z"
    )
    end_date: datetime = Field(
        ...,
        description="End date and time of the reservation",
        example="2025-01-15T14:00:00Z"
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the reservation was created",
        example="2025-01-15T10:00:00Z"
    )
    updated_at: datetime = Field(
        ...,
        description="Timestamp when the reservation was last updated",
        example="2025-01-15T10:00:00Z"
    )

    model_config = {"from_attributes": True}


class ReservationConflictResponse(BaseModel):
    """Schema for returning conflict information when a reservation cannot be made"""
    status: str = Field(
        default="conflict",
        description="Status indicating a conflict exists"
    )
    message: str = Field(
        ...,
        description="Human-readable error message"
    )
    bike_id: str = Field(
        ...,
        description="The bike ID that has a conflict"
    )
    requested_start: datetime = Field(
        ...,
        description="The requested start date"
    )
    requested_end: datetime = Field(
        ...,
        description="The requested end date"
    )
    conflicting_reservations: list[ReservationResponse] = Field(
        ...,
        description="List of existing reservations that conflict with the requested range"
    )
