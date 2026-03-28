from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from models import get_db
from schemas.reservations import (
    BikeResponse,
    ReservationCreate, ReservationUpdate, ReservationResponse,
    ReservationConflictResponse
)
from services.reservations import BikeService, ReservationService

router = APIRouter(tags=["reservations"])


# ============================================================================
# Bike Endpoints
# ============================================================================
# Note: Bikes are created/deleted only through RabbitMQ events (bike.created, bike.deleted)

@router.get("/bikes", response_model=list[BikeResponse])
def get_all_bikes(
    db: Session = Depends(get_db)
):
    """Get all registered bikes"""
    service = BikeService(db)
    return service.get_all_bikes()


# ============================================================================
# Reservation Endpoints
# ============================================================================

@router.post("/reservations", status_code=201)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db)
):
    """Create a new reservation
    
    Returns:
    - 201 with ReservationResponse if successful
    - 409 with conflict details if date range conflicts with existing reservations
    - 422 with error details if validation fails
    """
    try:
        service = ReservationService(db)
        result = service.create_reservation(reservation)
        
        if result.get("status") == "conflict":
            # Convert datetime and ReservationResponse objects to serializable format
            conflict_detail = {
                "status": result["status"],
                "message": result["message"],
                "bike_id": result["bike_id"],
                "requested_start": result["requested_start"].isoformat(),
                "requested_end": result["requested_end"].isoformat(),
                "conflicting_reservations": [
                    {
                        "id": str(r.id),
                        "bike_id": r.bike_id,
                        "user_id": r.user_id,
                        "start_date": r.start_date.isoformat(),
                        "end_date": r.end_date.isoformat(),
                        "created_at": r.created_at.isoformat(),
                        "updated_at": r.updated_at.isoformat(),
                    }
                    for r in result["conflicting_reservations"]
                ]
            }
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=conflict_detail
            )
        
        return result.get("reservation")
    
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/reservations/{reservation_id}", response_model=ReservationResponse)
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


@router.get("/reservations/bike/{bike_id}", response_model=list[ReservationResponse])
def get_bike_reservations(
    bike_id: str,
    db: Session = Depends(get_db)
):
    """Get all reservations for a specific bike"""
    service = ReservationService(db)
    return service.get_bike_reservations(bike_id)


@router.get("/reservations/user/{user_id}", response_model=list[ReservationResponse])
def get_user_reservations(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get all reservations for a specific user"""
    service = ReservationService(db)
    return service.get_user_reservations(user_id)


@router.get("/reservations", response_model=list[ReservationResponse])
def get_all_reservations(
    db: Session = Depends(get_db)
):
    """Get all reservations"""
    service = ReservationService(db)
    return service.get_all_reservations()


@router.put("/reservations/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: UUID,
    reservation: ReservationUpdate,
    db: Session = Depends(get_db)
):
    """Update a reservation's date range
    
    Can update start_date and/or end_date. Will check for conflicts with
    the new date range.
    
    Returns:
    - 200 with updated ReservationResponse if successful
    - 409 with conflict details if date range conflicts with existing reservations
    - 404 if reservation not found
    - 422 if validation fails
    """
    try:
        service = ReservationService(db)
        result = service.update_reservation(reservation_id, reservation)
        
        # Check if result is a dict indicating conflict (service returns dict on conflict)
        if isinstance(result, dict) and result.get("status") == "conflict":
            conflict_detail = {
                "status": result["status"],
                "message": result["message"],
                "bike_id": result["bike_id"],
                "requested_start": result["requested_start"].isoformat(),
                "requested_end": result["requested_end"].isoformat(),
                "conflicting_reservations": [
                    {
                        "id": str(r.id),
                        "bike_id": r.bike_id,
                        "user_id": r.user_id,
                        "start_date": r.start_date.isoformat(),
                        "end_date": r.end_date.isoformat(),
                        "created_at": r.created_at.isoformat(),
                        "updated_at": r.updated_at.isoformat(),
                    }
                    for r in result["conflicting_reservations"]
                ]
            }
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=conflict_detail
            )
        
        return result
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        raise HTTPException(status_code=422, detail=error_msg)
