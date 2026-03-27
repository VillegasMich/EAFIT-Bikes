from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.reservations import Reservation
from schemas.reservations import ReservationCreate, ReservationUpdate
from uuid import UUID


class ReservationRepository:
    """Repository for Reservation database operations"""

    @staticmethod
    def create(db: Session, reservation: ReservationCreate) -> Reservation:
        """Create a new reservation"""
        db_reservation = Reservation(**reservation.model_dump())
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        return db_reservation

    @staticmethod
    def get_by_id(db: Session, reservation_id: UUID) -> Reservation:
        """Get reservation by ID"""
        return db.query(Reservation).filter(Reservation.id == reservation_id).first()

    @staticmethod
    def get_by_bike_id(db: Session, bike_id: str) -> list[Reservation]:
        """Get all reservations for a bike"""
        return db.query(Reservation).filter(Reservation.bike_id == bike_id).all()

    @staticmethod
    def get_by_user_id(db: Session, user_id: str) -> list[Reservation]:
        """Get all reservations for a user"""
        return db.query(Reservation).filter(Reservation.user_id == user_id).all()

    @staticmethod
    def get_all(db: Session) -> list[Reservation]:
        """Get all reservations"""
        return db.query(Reservation).all()

    @staticmethod
    def update(db: Session, reservation_id: UUID, reservation: ReservationUpdate) -> Reservation:
        """Update a reservation"""
        db_reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
        if db_reservation:
            update_data = reservation.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_reservation, key, value)
            db.commit()
            db.refresh(db_reservation)
        return db_reservation

    @staticmethod
    def delete(db: Session, reservation_id: UUID) -> bool:
        """Delete a reservation"""
        db_reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
        if db_reservation:
            db.delete(db_reservation)
            db.commit()
            return True
        return False

    @staticmethod
    def bike_exists(db: Session, bike_id: str) -> bool:
        """Check if a bike exists in the system"""
        return db.query(Reservation).filter(Reservation.bike_id == bike_id).first() is not None

    @staticmethod
    def get_active_reservations(db: Session) -> list[Reservation]:
        """Get all active (reserved) reservations"""
        return db.query(Reservation).filter(Reservation.status == 'reserved').all()
    
    @staticmethod
    def get_available_bikes(db: Session) -> list[Reservation]:
        """Get all available bikes"""
        return db.query(Reservation).filter(Reservation.status == 'available').all()
    
    @staticmethod
    def get_bike_status(db: Session, bike_id: str) -> str:
        """Get the status of a specific bike ('available' or 'reserved')"""
        reservation = db.query(Reservation).filter(Reservation.bike_id == bike_id).first()
        if reservation:
            return reservation.status
        return None
    
    @staticmethod
    def get_available_bike_reservation(db: Session, bike_id: str) -> Reservation:
        """Get the available reservation entry for a bike (status='available')
        
        This returns the initial entry created when the bike was registered,
        which can be updated when a user makes a reservation.
        """
        return db.query(Reservation).filter(
            and_(Reservation.bike_id == bike_id, Reservation.status == 'available')
        ).first()
