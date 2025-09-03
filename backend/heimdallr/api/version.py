import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from heimdallr.services.update_service import UpdateService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/version", tags=["version"])


@router.get("/", response_model=Dict[str, str])
async def get_current_version():
    """Get current application version."""
    try:
        update_service = UpdateService()
        current_version = update_service.get_current_version()
        return {"version": current_version}
    except Exception as e:
        logger.error(f"Failed to get current version: {e}")
        raise HTTPException(status_code=500, detail="Failed to get version information")


@router.get("/check", response_model=Dict[str, Any])
async def check_for_updates():
    """Check for available updates."""
    try:
        update_service = UpdateService()
        update_info = update_service.check_for_updates()
        return update_info
    except Exception as e:
        logger.error(f"Failed to check for updates: {e}")
        raise HTTPException(status_code=500, detail="Failed to check for updates")


@router.post("/check", response_model=Dict[str, Any])
async def force_check_updates():
    """Force check for updates (bypasses cache)."""
    try:
        update_service = UpdateService()
        # Clear cache to force fresh check
        if update_service.cache_file.exists():
            update_service.cache_file.unlink()

        update_info = update_service.check_for_updates()
        return update_info
    except Exception as e:
        logger.error(f"Failed to force check for updates: {e}")
        raise HTTPException(status_code=500, detail="Failed to check for updates")
