"""Logging configuration for EAFIT Bikes - Reservations Service"""

import logging
import sys
from logging.handlers import RotatingFileHandler


def configure_logging(debug: bool = False):
    """
    Configure logging for the application
    
    Args:
        debug: Whether to enable debug logging level
    """
    # Set log level based on environment
    log_level = logging.DEBUG if debug else logging.INFO
    
    # Create formatter with better readability
    formatter = logging.Formatter(
        fmt='[%(asctime)s] %(levelname)-8s [%(name)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Console handler with formatted output
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File handler for persistent logs
    file_handler = RotatingFileHandler(
        'reservations.log',
        maxBytes=10_485_760,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)
    
    # Reduce verbosity of noisy third-party libraries
    logging.getLogger('pika').setLevel(logging.WARNING)
    logging.getLogger('pika.adapters').setLevel(logging.WARNING)
    logging.getLogger('pika.adapters.utils').setLevel(logging.WARNING)
    logging.getLogger('pika.adapters.utils.connection_workflow').setLevel(logging.WARNING)
    logging.getLogger('pika.adapters.utils.io_services_utils').setLevel(logging.WARNING)
    logging.getLogger('pika.adapters.blocking_connection').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.pool').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    
    # Application loggers at INFO level
    logging.getLogger('main').setLevel(logging.INFO)
    logging.getLogger('models').setLevel(logging.INFO)
    logging.getLogger('rabbitmq').setLevel(logging.INFO)
    logging.getLogger('services').setLevel(logging.INFO)
    logging.getLogger('repositories').setLevel(logging.INFO)
    logging.getLogger('routes').setLevel(logging.INFO)
