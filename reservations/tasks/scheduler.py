"""Background tasks scheduler for reservations microservice"""

import logging
from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import and_
from models import SessionLocal
from models.reservations import Reservation

logger = logging.getLogger(__name__)


def release_expired_reservations():
    """
    Background task that releases expired reservations.
    
    Finds all reservations with status='reserved' and end_date in the past,
    and resets them to status='available' with user_id, start_date, end_date set to null.
    """
    db_session = SessionLocal()
    try:
        # Get current time in UTC (timezone-aware)
        now = datetime.now(timezone.utc)
        
        # Log debug info for timezone debugging
        logger.debug(f"Current time (UTC): {now} (tzinfo: {now.tzinfo})")
        
        # Find all expired reservations
        expired_reservations = db_session.query(Reservation).filter(
            and_(
                Reservation.status == 'reserved',
                Reservation.end_date < now
            )
        ).all()
        
        if not expired_reservations:
            logger.debug("No expired reservations found")
            return
        
        logger.info(f"Found {len(expired_reservations)} expired reservation(s)")
        
        # Release each expired reservation
        for reservation in expired_reservations:
            end_date_display = reservation.end_date
            if end_date_display and hasattr(end_date_display, 'tzinfo'):
                logger.debug(f"end_date tzinfo: {end_date_display.tzinfo}")
            
            logger.info(
                f"Releasing expired reservation | bike_id='{reservation.bike_id}' | "
                f"res_id={reservation.id} | ended_at={reservation.end_date} | now={now}"
            )
            
            reservation.user_id = None
            reservation.start_date = None
            reservation.end_date = None
            reservation.status = 'available'
        
        db_session.commit()
        logger.info(f"Successfully released {len(expired_reservations)} reservation(s)")
        
    except Exception as e:
        logger.error(f"Error releasing expired reservations: {e}", exc_info=True)
        db_session.rollback()
    finally:
        db_session.close()


def start_scheduler():
    """
    Initialize and start the background scheduler for reservation maintenance tasks
    """
    try:
        scheduler = BackgroundScheduler()
        
        # Schedule the task to run every minute (for testing)
        scheduler.add_job(
            release_expired_reservations,
            'interval',
            minutes=1,
            id='release_expired_reservations',
            name='Release expired reservations',
            replace_existing=True,
            misfire_grace_time=60
        )
        
        scheduler.start()
        logger.info("Background scheduler started - Release expired reservations task scheduled for every 1 minute")
        
        return scheduler
        
    except Exception as e:
        logger.error(f"Failed to start background scheduler: {e}", exc_info=True)
        raise


def stop_scheduler(scheduler):
    """
    Stop the background scheduler
    """
    try:
        if scheduler and scheduler.running:
            scheduler.shutdown()
            logger.info("Background scheduler stopped")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {e}", exc_info=True)
