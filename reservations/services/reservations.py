from sqlalchemy.orm import Session
from repositories.reservations import ReservationRepository
from schemas.reservations import ReservationCreate, ReservationUpdate, ReservationResponse
from uuid import UUID


class ReservationService:
    """Service layer for reservation operations"""

    def __init__(self, db: Session):
        self.db = db
        self.repository = ReservationRepository()

    def create_reservation(self, reservation: ReservationCreate) -> ReservationResponse:
        """Create a new reservation
        
        Two cases:
        1. Create draft by bike.created event: Only bike_id provided, status='available'
           -> Creates new entry
        2. User makes actual reservation: user_id, start_date, end_date provided, status='reserved'
           -> Updates existing available entry for that bike
        """
        # Validate that the bike exists
        if not self.repository.bike_exists(self.db, reservation.bike_id):
            raise ValueError(f"Bike with ID '{reservation.bike_id}' does not exist in the system. Create the bike first before making a reservation.")
        
        # If this is a user reservation (not a bike creation event)
        if reservation.user_id and reservation.start_date and reservation.end_date:
            # Get the available reservation entry for this bike
            available_reservation = self.repository.get_available_bike_reservation(
                self.db, reservation.bike_id
            )
            
            if not available_reservation:
                raise ValueError(f"Bike '{reservation.bike_id}' is not available for reservation")
            
            # Update the existing available entry with reservation details
            update_data = ReservationUpdate(
                user_id=reservation.user_id,
                start_date=reservation.start_date,
                end_date=reservation.end_date,
                status='reserved'
            )
            db_reservation = self.repository.update(self.db, available_reservation.id, update_data)
        else:
            # Create new reservation (from bike.created event)
            db_reservation = self.repository.create(self.db, reservation)
        
        return ReservationResponse.model_validate(db_reservation)

    def get_reservation(self, reservation_id: UUID) -> ReservationResponse:
        """Get a reservation by ID"""
        db_reservation = self.repository.get_by_id(self.db, reservation_id)
        if not db_reservation:
            return None
        return ReservationResponse.model_validate(db_reservation)

    def get_bike_reservations(self, bike_id: str) -> list[ReservationResponse]:
        """Get all reservations for a bike"""
        reservations = self.repository.get_by_bike_id(self.db, bike_id)
        return [ReservationResponse.model_validate(r) for r in reservations]

    def get_user_reservations(self, user_id: str) -> list[ReservationResponse]:
        """Get all reservations for a user"""
        reservations = self.repository.get_by_user_id(self.db, user_id)
        return [ReservationResponse.model_validate(r) for r in reservations]

    def get_all_reservations(self) -> list[ReservationResponse]:
        """Get all reservations"""
        reservations = self.repository.get_all(self.db)
        return [ReservationResponse.model_validate(r) for r in reservations]

    def update_reservation(self, reservation_id: UUID, reservation: ReservationUpdate) -> ReservationResponse:
        """Update a reservation"""
        db_reservation = self.repository.update(self.db, reservation_id, reservation)
        if not db_reservation:
            return None
        return ReservationResponse.model_validate(db_reservation)

    def delete_reservation(self, reservation_id: UUID) -> bool:
        """Delete a reservation"""
        return self.repository.delete(self.db, reservation_id)

    def get_active_reservations(self) -> list[ReservationResponse]:
        """Get all active reservations"""
        reservations = self.repository.get_active_reservations(self.db)
        return [ReservationResponse.model_validate(r) for r in reservations]
