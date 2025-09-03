from typing import List, Optional

from sqlalchemy.orm import Session

from heimdallr.database import schemas
from heimdallr.entity.channel import Channel
from heimdallr.entity.user import User
from heimdallr.model import channel_model


class ChannelService:
    def __init__(self, db: Session):
        self.db = db

    def get_channel_by_id(self, channel_id: int) -> Optional[Channel]:
        return channel_model.get_channel(self.db, channel_id)

    def get_user_channels(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Channel]:
        return channel_model.get_channels(self.db, user_id=user_id, skip=skip, limit=limit)

    def create_channel(self, channel: schemas.ChannelCreate, user: User) -> Channel:
        return channel_model.create_channel(self.db, channel, int(user.id))

    def update_channel(self, channel_id: int, channel_update: schemas.ChannelUpdate, user: User) -> Optional[Channel]:
        # Check if channel exists and belongs to user
        db_channel = self.get_channel_by_id(channel_id)
        if not db_channel or int(db_channel.user_id) != int(user.id):
            return None

        return channel_model.update_channel(self.db, channel_id, channel_update)

    def delete_channel(self, channel_id: int, user: User) -> bool:
        # Check if channel exists and belongs to user
        db_channel = self.get_channel_by_id(channel_id)
        if not db_channel or int(db_channel.user_id) != int(user.id):
            return False

        return channel_model.delete_channel(self.db, channel_id)

    def add_channel_to_group(self, group_id: int, channel_id: int, user: User) -> bool:
        # Check if both group and channel belong to user
        from heimdallr.services.group_service import GroupService

        group_service = GroupService(self.db)
        if not group_service.user_owns_group(group_id, user):
            return False

        db_channel = self.get_channel_by_id(channel_id)
        if not db_channel or int(db_channel.user_id) != int(user.id):
            return False

        return channel_model.add_channel_to_group(self.db, group_id, channel_id)

    def remove_channel_from_group(self, group_id: int, channel_id: int, user: User) -> bool:
        # Check if both group and channel belong to user
        from heimdallr.services.group_service import GroupService

        group_service = GroupService(self.db)
        if not group_service.user_owns_group(group_id, user):
            return False

        db_channel = self.get_channel_by_id(channel_id)
        if not db_channel or int(db_channel.user_id) != int(user.id):
            return False

        return channel_model.remove_channel_from_group(self.db, group_id, channel_id)

    def user_owns_channel(self, channel_id: int, user: User) -> bool:
        db_channel = self.get_channel_by_id(channel_id)
        return db_channel is not None and int(db_channel.user_id) == int(user.id)
