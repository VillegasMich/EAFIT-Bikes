"""Service for handling bike creation events from RabbitMQ"""

import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.reservations import Reservation
from schemas.reservations import ReservationCreate

logger = logging.getLogger(__name__)


async def handle_bike_created_event(
    bike_id: str,
    db_session: Session
) -> Dict[str, Any]:
    """
    Handle bike created event by creating a reservation entry in the database.
    
    This is idempotent - if the bike already exists, it logs and returns without
    creating a duplicate.
    
    Args:
        bike_id: The unique identifier of the bike from the event
        db_session: SQLAlchemy database session
        
    Returns:
        Dict with event processing result
        
    Raises:
        ValueError: If bike_id is invalid
        Exception: On database errors (logged but re-raised for proper handling)
    """
    try:
        # Validate bike_id
        if not bike_id or not isinstance(bike_id, str) or not bike_id.strip():
            error_msg = f"Invalid bike_id: {bike_id}"
            logger.error(f"{error_msg}")
            raise ValueError(error_msg)
        
        bike_id = bike_id.strip()
        logger.info(f"Processing bike.created event | bike_id='{bike_id}'")
        
        # Check if bike already exists (idempotency)
        existing_reservation = db_session.query(Reservation).filter(
            Reservation.bike_id == bike_id
        ).first()
        
        if existing_reservation:
            logger.info(
                f"Bike '{bike_id}' already registered (idempotent) | res_id={existing_reservation.id}"
            )
            return {
                "status": "skipped",
                "reason": "bike_already_exists",
                "bike_id": bike_id,
                "message": f"Bike '{bike_id}' already registered in system"
            }
        
        # Create new reservation entry with status='available'
        reservation_data = ReservationCreate(
            bike_id=bike_id,
            user_id=None,
            start_date=None,
            end_date=None,
            status='available'
        )
        
        db_reservation = Reservation(**reservation_data.model_dump())
        db_session.add(db_reservation)
        db_session.commit()
        db_session.refresh(db_reservation)
        
        logger.info(
            f"Reservation created | bike_id='{bike_id}' | res_id={db_reservation.id} | status={db_reservation.status}"
        )
        
        return {
            "status": "created",
            "bike_id": bike_id,
            "reservation_id": str(db_reservation.id),
            "message": f"Bike '{bike_id}' registered successfully"
        }
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise
    except Exception as e:
        logger.error(
            f"Database error for bike_id='{bike_id}': {e}",
            exc_info=True
        )
        db_session.rollback()
        raise


def validate_bike_event(message: Dict[str, Any]) -> bool:
    """
    Validate that message has required fields for bike event
    
    Args:
        message: Dictionary to validate
        
    Returns:
        bool: True if message is valid, False otherwise
    """
    required_fields = ["bike_id"]
    
    for field in required_fields:
        if field not in message:
            logger.warning(f"Missing required field in bike event: {field}")
            return False
    
    if not message.get("bike_id"):
        logger.warning("bike_id field is empty or None")
        return False
    
    return True
