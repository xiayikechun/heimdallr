from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from heimdallr.auth.dependencies import get_current_user
from heimdallr.database import schemas
from heimdallr.database.database import get_db
from heimdallr.entity.user import User
from heimdallr.services.channel_service import ChannelService
from heimdallr.services.group_service import GroupService

router = APIRouter(prefix="/groups", tags=["groups"])


class ChannelConfig(BaseModel):
    id: int
    name: str
    channel_type: str
    config: dict
    is_active: bool


class TestGroupRequest(BaseModel):
    title: str
    body: str
    channels: Optional[List[ChannelConfig]] = None  # For testing with provided channels config


class ChannelTestResult(BaseModel):
    channel_id: int
    channel_name: str
    success: bool
    message: str


class TestGroupResponse(BaseModel):
    success: bool
    message: str
    channel_results: List[ChannelTestResult]


@router.post("/", response_model=schemas.Group)
def create_group(
    group: schemas.GroupCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    group_service = GroupService(db)
    return group_service.create_group(group, current_user)


@router.get("/", response_model=List[schemas.Group])
def read_groups(
    skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    group_service = GroupService(db)
    groups = group_service.get_user_groups(current_user.id, skip=skip, limit=limit)
    return groups


@router.get("/{group_id}", response_model=schemas.GroupWithChannels)
def read_group(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    group_service = GroupService(db)
    db_group = group_service.get_group_by_id(group_id)
    if db_group is None or not group_service.user_owns_group(group_id, current_user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return db_group


@router.put("/{group_id}", response_model=schemas.Group)
def update_group(
    group_id: int,
    group_update: schemas.GroupUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    group_service = GroupService(db)
    updated_group = group_service.update_group(group_id, group_update, current_user)
    if not updated_group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return updated_group


@router.delete("/{group_id}")
def delete_group(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    group_service = GroupService(db)
    if not group_service.delete_group(group_id, current_user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    return {"message": "Group deleted successfully"}


@router.post("/{group_id}/regenerate-token", response_model=schemas.Group)
def regenerate_group_token(
    group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    group_service = GroupService(db)
    updated_group = group_service.regenerate_group_token(group_id, current_user)
    if not updated_group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return updated_group


@router.post("/{group_id}/channels/{channel_id}")
def add_channel_to_group(
    group_id: int, channel_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    channel_service = ChannelService(db)
    if not channel_service.add_channel_to_group(group_id, channel_id, current_user):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to add channel to group")

    return {"message": "Channel added to group successfully"}


@router.delete("/{group_id}/channels/{channel_id}")
def remove_channel_from_group(
    group_id: int, channel_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    channel_service = ChannelService(db)
    if not channel_service.remove_channel_from_group(group_id, channel_id, current_user):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to remove channel from group")

    return {"message": "Channel removed from group successfully"}


@router.post("/{group_id}/test", response_model=TestGroupResponse)
async def test_group(
    group_id: int,
    test_request: TestGroupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    group_service = GroupService(db)
    try:
        if group_id == 0 and test_request.channels:
            # Test with provided channels config (edit mode)
            result = await group_service.test_group_with_channels(
                test_request.title, test_request.body, test_request.channels, current_user
            )
        else:
            # Test with database config (normal mode)
            result = await group_service.test_group(group_id, test_request.title, test_request.body, current_user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to test group: {str(e)}")
