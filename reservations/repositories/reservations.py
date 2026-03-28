from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models.reservations import Bike, Reservation
from schemas.reservations import ReservationCreate, ReservationUpdate
from uuid import UUID


class BikeRepository:
    """Repository for Bike database operations
    
    Note: Bikes are managed only through RabbitMQ events (bike.created, bike.deleted)
    This repository only provides read access to registered bikes.
    """

    @staticmethod
    def get_all(db: Session) -> list[Bike]:
        """Get all registered bikes"""
        return db.query(Bike).all()

    @staticmethod
    def exists(db: Session, bike_id: str) -> bool:
        """Check if a bike exists in the system"""
        return db.query(Bike).filter(Bike.bike_id == bike_id).first() is not None


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
    def get_conflicting_reservations(db: Session, bike_id: str, start_date, end_date) -> list[Reservation]:
        """
        Get all reservations that conflict with the given date range.
        
        A conflict exists if:
        - existing.start_date < new.end_date AND existing.end_date > new.start_date
        
        Args:
            db: Database session
            bike_id: The bike ID
            start_date: Requested start date
            end_date: Requested end date
            
        Returns:
            List of conflicting reservations, empty if no conflicts
        """
        return db.query(Reservation).filter(
            and_(
                Reservation.bike_id == bike_id,
                Reservation.start_date < end_date,
                Reservation.end_date > start_date
            )
        ).all()
