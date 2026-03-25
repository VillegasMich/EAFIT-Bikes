from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from models import get_db
from schemas.reservations import ReservationCreate, ReservationUpdate, ReservationResponse
from services.reservations import ReservationService

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.post("/", response_model=ReservationResponse, status_code=201)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db)
):
    """Create a new reservation"""
    service = ReservationService(db)
    return service.create_reservation(reservation)


@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation(
    reservation_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a reservation by ID"""
    service = ReservationService(db)
    reservation = service.get_reservation(reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


@router.get("/bike/{bike_id}", response_model=list[ReservationResponse])
def get_bike_reservations(
    bike_id: str,
    db: Session = Depends(get_db)
):
    """Get all reservations for a bike"""
    service = ReservationService(db)
    return service.get_bike_reservations(bike_id)


@router.get("/user/{user_id}", response_model=list[ReservationResponse])
def get_user_reservations(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get all reservations for a user"""
    service = ReservationService(db)
    return service.get_user_reservations(user_id)


@router.get("/", response_model=list[ReservationResponse])
def get_all_reservations(
    db: Session = Depends(get_db)
):
    """Get all reservations"""
    service = ReservationService(db)
    return service.get_all_reservations()


@router.put("/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: UUID,
    reservation: ReservationUpdate,
    db: Session = Depends(get_db)
):
    """Update a reservation"""
    service = ReservationService(db)
    updated = service.update_reservation(reservation_id, reservation)
    if not updated:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return updated


@router.delete("/{reservation_id}", status_code=204)
def delete_reservation(
    reservation_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a reservation"""
    service = ReservationService(db)
    if not service.delete_reservation(reservation_id):
        raise HTTPException(status_code=404, detail="Reservation not found")


@router.get("/active/all", response_model=list[ReservationResponse])
def get_active_reservations(
    db: Session = Depends(get_db)
):
    """Get all active reservations"""
    service = ReservationService(db)
    return service.get_active_reservations()
