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
        """Create a new reservation"""
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
