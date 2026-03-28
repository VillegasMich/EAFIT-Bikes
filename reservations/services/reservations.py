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
            # Update directly without schema validation (this is internal, not through PUT endpoint)
            available_reservation.user_id = reservation.user_id
            available_reservation.start_date = reservation.start_date
            available_reservation.end_date = reservation.end_date
            available_reservation.status = 'reserved'
            self.db.commit()
            self.db.refresh(available_reservation)
            db_reservation = available_reservation
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
        """Update a reservation
        
        Only allows two operations:
        1. Update dates (start_date and/or end_date) - for reserved reservations only
        2. Cancel reservation (status='available') - returns bike to available pool, clearing user/dates
        
        Raises:
            ValueError: If update violates business rules
        """
        db_reservation = self.repository.get_by_id(self.db, reservation_id)
        if not db_reservation:
            return None
        
        update_data = reservation.model_dump(exclude_unset=True)
        
        # Validate update operations
        is_updating_dates = 'start_date' in update_data or 'end_date' in update_data
        is_updating_status = 'status' in update_data
        
        # Case 1: Updating dates (start_date and/or end_date)
        if is_updating_dates and not is_updating_status:
            # Can only update dates on reserved reservations (not on 'available')
            if db_reservation.status == 'available':
                raise ValueError("Cannot update dates on 'available' reservations. Only 'reserved' reservations can have dates updated.")
        
        # Case 2: Cancelling reservation (status='available')
        elif is_updating_status and not is_updating_dates:
            # Validate status value
            if update_data['status'] != 'available':
                raise ValueError(f"Invalid status for update: {update_data['status']}. Only 'available' is allowed to release/cancel a reservation.")
            
            # Can only release from 'reserved' status back to 'available'
            if db_reservation.status != 'reserved':
                raise ValueError(f"Can only cancel 'reserved' reservations. Current status: {db_reservation.status}")
            
            # When cancelling, also clear user_id, start_date, end_date
            db_reservation.user_id = None
            db_reservation.start_date = None
            db_reservation.end_date = None
            db_reservation.status = 'available'
            self.db.commit()
            self.db.refresh(db_reservation)
            return ReservationResponse.model_validate(db_reservation)
        
        # Case 3: Trying to update both dates and status - not allowed
        elif is_updating_dates and is_updating_status:
            raise ValueError("Cannot update both dates and status in a single request. Please update dates and status separately.")
        
        # Apply the update (for Case 1: date updates)
        db_reservation = self.repository.update(self.db, reservation_id, reservation)
        return ReservationResponse.model_validate(db_reservation)

    def get_active_reservations(self) -> list[ReservationResponse]:
        """Get all active reservations"""
        reservations = self.repository.get_active_reservations(self.db)
        return [ReservationResponse.model_validate(r) for r in reservations]
