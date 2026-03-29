from sqlalchemy.orm import Session
from repositories.reservations import BikeRepository, ReservationRepository
from schemas.reservations import BikeResponse, ReservationCreate, ReservationUpdate, ReservationResponse
from uuid import UUID


class BikeService:
    """Service layer for bike operations
    
    Note: Bikes are managed only through RabbitMQ events (bike.created, bike.deleted)
    This service only provides read access to registered bikes.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repository = BikeRepository()

    def get_all_bikes(self) -> list[BikeResponse]:
        """Get all registered bikes"""
        bikes = self.repository.get_all(self.db)
        return [BikeResponse.model_validate(b) for b in bikes]

    def bike_exists(self, bike_id: str) -> bool:
        """Check if a bike is registered"""
        return self.repository.exists(self.db, bike_id)


class ReservationService:
    """Service layer for reservation operations"""

    def __init__(self, db: Session):
        self.db = db
        self.reservation_repo = ReservationRepository()
        self.bike_repo = BikeRepository()

    def create_reservation(self, reservation: ReservationCreate) -> dict:
        """Create a new reservation with automatic conflict detection
        
        Returns:
            dict with either:
            - success: ReservationResponse if reservation created
            - conflict: ConflictInfo if date range conflicts with existing reservations
        """
        # Validate that the bike exists
        if not self.bike_repo.exists(self.db, reservation.bike_id):
            raise ValueError(
                f"Bike with ID '{reservation.bike_id}' is not registered in the system. "
                "Please register the bike first."
            )
        
        # Check for conflicting reservations
        conflicts = self.reservation_repo.get_conflicting_reservations(
            self.db,
            reservation.bike_id,
            reservation.start_date,
            reservation.end_date
        )
        
        if conflicts:
            return {
                "status": "conflict",
                "message": f"The bike '{reservation.bike_id}' has {len(conflicts)} conflicting reservation(s) in the requested date range.",
                "bike_id": reservation.bike_id,
                "requested_start": reservation.start_date,
                "requested_end": reservation.end_date,
                "conflicting_reservations": [
                    ReservationResponse.model_validate(c) for c in conflicts
                ]
            }
        
        # No conflicts, create the reservation
        db_reservation = self.reservation_repo.create(self.db, reservation)
        return {
            "status": "created",
            "reservation": ReservationResponse.model_validate(db_reservation)
        }

    def get_reservation(self, reservation_id: UUID) -> ReservationResponse:
        """Get a reservation by ID"""
        db_reservation = self.reservation_repo.get_by_id(self.db, reservation_id)
        if not db_reservation:
            return None
        return ReservationResponse.model_validate(db_reservation)

    def get_bike_reservations(self, bike_id: str) -> list[ReservationResponse]:
        """Get all reservations for a bike"""
        reservations = self.reservation_repo.get_by_bike_id(self.db, bike_id)
        return [ReservationResponse.model_validate(r) for r in reservations]

    def get_user_reservations(self, user_id: str) -> list[ReservationResponse]:
        """Get all reservations for a user"""
        reservations = self.reservation_repo.get_by_user_id(self.db, user_id)
        return [ReservationResponse.model_validate(r) for r in reservations]

    def get_all_reservations(self) -> list[ReservationResponse]:
        """Get all reservations"""
        reservations = self.reservation_repo.get_all(self.db)
        return [ReservationResponse.model_validate(r) for r in reservations]

    def update_reservation(self, reservation_id: UUID, reservation: ReservationUpdate) -> dict:
        """Update a reservation's date range
        
        Can update start_date and/or end_date. Will check for conflicts with
        the new date range.
        
        Returns:
            dict with either:
            - updated ReservationResponse if update successful
            - conflict info if date range conflicts with existing reservations
            
        Raises:
            ValueError: If reservation not found
        """
        db_reservation = self.reservation_repo.get_by_id(self.db, reservation_id)
        if not db_reservation:
            raise ValueError(f"Reservation with ID '{reservation_id}' not found")
        
        update_data = reservation.model_dump(exclude_unset=True)
        
        # If no fields to update, return the current reservation
        if not update_data:
            return ReservationResponse.model_validate(db_reservation)
        
        # Get the new dates (use existing if not provided in update)
        new_start = update_data.get('start_date', db_reservation.start_date)
        new_end = update_data.get('end_date', db_reservation.end_date)
        
        # Check for conflicts with the new date range (excluding this reservation)
        conflicts = self.reservation_repo.get_conflicting_reservations(
            self.db,
            db_reservation.bike_id,
            new_start,
            new_end
        )
        
        # Filter out the current reservation from conflicts
        conflicts = [c for c in conflicts if c.id != reservation_id]
        
        if conflicts:
            return {
                "status": "conflict",
                "message": f"The bike '{db_reservation.bike_id}' has {len(conflicts)} conflicting reservation(s) in the requested date range.",
                "bike_id": db_reservation.bike_id,
                "requested_start": new_start,
                "requested_end": new_end,
                "conflicting_reservations": conflicts
            }
        
        # No conflicts, apply the update
        updated_reservation = self.reservation_repo.update(self.db, reservation_id, reservation)
        return ReservationResponse.model_validate(updated_reservation)
