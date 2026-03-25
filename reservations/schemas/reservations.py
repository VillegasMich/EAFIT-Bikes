from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class ReservationBase(BaseModel):
    """Base schema for reservation data"""
    bike_id: str
    user_id: str
    start_date: datetime
    end_date: datetime
    status: str = 'active'


class ReservationCreate(ReservationBase):
    """Schema for creating a new reservation"""
    pass


class ReservationUpdate(BaseModel):
    """Schema for updating a reservation"""
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ReservationResponse(ReservationBase):
    """Schema for returning reservation data"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
