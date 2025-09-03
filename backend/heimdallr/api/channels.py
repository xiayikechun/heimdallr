from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from heimdallr.auth.dependencies import get_current_user
from heimdallr.channel.factory import build_channel, build_message
from heimdallr.database import schemas
from heimdallr.database.database import get_db
from heimdallr.entity.user import User
from heimdallr.services.channel_service import ChannelService

router = APIRouter(prefix="/channels", tags=["channels"])


class TestChannelRequest(BaseModel):
    title: str
    body: str
    config: Optional[dict] = None  # Optional config to override channel config
    channel_type: Optional[str] = None  # Required when testing without existing channel


@router.post("/", response_model=schemas.Channel)
def create_channel(
    channel: schemas.ChannelCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    channel_service = ChannelService(db)
    return channel_service.create_channel(channel, current_user)


@router.get("/", response_model=List[schemas.Channel])
def read_channels(
    skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    channel_service = ChannelService(db)
    channels = channel_service.get_user_channels(current_user.id, skip=skip, limit=limit)
    return channels


@router.get("/{channel_id}", response_model=schemas.Channel)
def read_channel(channel_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    channel_service = ChannelService(db)
    db_channel = channel_service.get_channel_by_id(channel_id)
    if db_channel is None or not channel_service.user_owns_channel(channel_id, current_user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")
    return db_channel


@router.put("/{channel_id}", response_model=schemas.Channel)
def update_channel(
    channel_id: int,
    channel_update: schemas.ChannelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    channel_service = ChannelService(db)
    updated_channel = channel_service.update_channel(channel_id, channel_update, current_user)
    if not updated_channel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")
    return updated_channel


@router.delete("/{channel_id}")
def delete_channel(channel_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    channel_service = ChannelService(db)
    if not channel_service.delete_channel(channel_id, current_user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    return {"message": "Channel deleted successfully"}


@router.post("/{channel_id}/test")
async def test_channel(
    channel_id: int,
    test_request: TestChannelRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Case 1: channel_id = 0 means testing config from request without existing channel
        if channel_id == 0:
            if not test_request.channel_type or not test_request.config:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="channel_type and config are required when testing without existing channel",
                )

            # Load configuration from request
            channel_type = test_request.channel_type
            config = test_request.config

        else:
            # Case 2: channel_id > 0 means testing existing channel from database
            channel_service = ChannelService(db)

            # Check if channel exists and user owns it
            db_channel = channel_service.get_channel_by_id(channel_id)
            if db_channel is None or not channel_service.user_owns_channel(channel_id, current_user):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

            # Check if channel is active
            if db_channel.is_active is False:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Channel is not active")

            # Load configuration from database, with optional override from request
            channel_type = str(db_channel.channel_type)
            config = test_request.config if test_request.config is not None else db_channel.config_dict

        # Use factory functions to create channel and message
        channel = build_channel(channel_type, config)
        message = build_message(channel_type, test_request.title, test_request.body)

        # Send the message
        success, error_msg = channel.send(message)

        if success:
            return {"message": "Test message sent successfully", "success": True}
        else:
            return {"message": f"Test message failed: {error_msg}", "success": False}

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to send test message: {str(e)}"
        )
