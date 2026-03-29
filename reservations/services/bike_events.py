"""Service for handling bike creation and deletion events from RabbitMQ"""

import logging
from typing import Dict, Any
from sqlalchemy.orm import Session
from models.reservations import Bike
from schemas.reservations import BikeCreate

logger = logging.getLogger(__name__)


async def handle_bike_created_event(
    bike_id: str,
    db_session: Session
) -> Dict[str, Any]:
    """
    Handle bike created event by registering it in the bikes table.
    
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
        existing_bike = db_session.query(Bike).filter(
            Bike.bike_id == bike_id
        ).first()
        
        if existing_bike:
            logger.info(
                f"Bike '{bike_id}' already registered (idempotent)"
            )
            return {
                "status": "skipped",
                "reason": "bike_already_exists",
                "bike_id": bike_id,
                "message": f"Bike '{bike_id}' already registered in system"
            }
        
        # Register new bike
        new_bike = Bike(bike_id=bike_id)
        db_session.add(new_bike)
        db_session.commit()
        db_session.refresh(new_bike)
        
        logger.info(
            f"Bike registered | bike_id='{bike_id}' | created_at={new_bike.created_at}"
        )
        
        return {
            "status": "created",
            "bike_id": bike_id,
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


async def handle_bike_deleted_event(
    bike_id: str,
    db_session: Session
) -> Dict[str, Any]:
    """
    Handle bike deleted event by removing it from the bikes table.
    
    IMPORTANT: This only removes the bike from the bikes table.
    Reservation history is preserved for audit purposes.
    
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
        logger.info(f"Processing bike.deleted event | bike_id='{bike_id}'")
        
        # Find bike to delete
        bike_to_delete = db_session.query(Bike).filter(
            Bike.bike_id == bike_id
        ).first()
        
        if not bike_to_delete:
            logger.info(
                f"Bike '{bike_id}' not found (already deleted or never registered)"
            )
            return {
                "status": "skipped",
                "reason": "bike_not_found",
                "bike_id": bike_id,
                "message": f"Bike '{bike_id}' was not found in the system"
            }
        
        # Delete bike (preserves reservation history)
        db_session.delete(bike_to_delete)
        db_session.commit()
        
        logger.info(
            f"Bike deleted | bike_id='{bike_id}' | Reservation history preserved"
        )
        
        return {
            "status": "deleted",
            "bike_id": bike_id,
            "message": f"Bike '{bike_id}' deleted. Reservation history preserved."
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
