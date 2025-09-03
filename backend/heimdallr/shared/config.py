from sqlalchemy.orm import Session

from heimdallr.services.config_service import DatabaseConfig


def get_config_instance(db: Session) -> DatabaseConfig:
    return DatabaseConfig(db)
