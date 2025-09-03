#!/usr/bin/env python3
"""
Database initialization script for Heimdallr.
This script creates the database tables and can be used for initial setup.
"""

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from heimdallr.database.database import create_tables

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    logger.info("Starting database initialization...")

    try:
        create_tables()
        logger.info("Database tables created successfully!")

        logger.info("Database initialization completed!")

    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
