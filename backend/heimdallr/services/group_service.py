import asyncio
from typing import List, Optional

from sqlalchemy.orm import Session

from heimdallr.channel.factory import build_channel, build_message
from heimdallr.database import schemas
from heimdallr.entity.group import Group
from heimdallr.entity.user import User
from heimdallr.model import group_model


class GroupService:
    def __init__(self, db: Session):
        self.db = db

    def get_group_by_id(self, group_id: int) -> Optional[Group]:
        return group_model.get_group(self.db, group_id)

    def get_group_by_token(self, token: str) -> Optional[Group]:
        return group_model.get_group_by_token(self.db, token)

    def get_user_groups(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Group]:
        return group_model.get_groups(self.db, user_id=user_id, skip=skip, limit=limit)

    def create_group(self, group: schemas.GroupCreate, user: User) -> Group:
        return group_model.create_group(self.db, group, int(user.id))

    def update_group(self, group_id: int, group_update: schemas.GroupUpdate, user: User) -> Optional[Group]:
        # Check if group exists and belongs to user
        db_group = self.get_group_by_id(group_id)
        if not db_group or int(db_group.user_id) != int(user.id):
            return None

        return group_model.update_group(self.db, group_id, group_update)

    def delete_group(self, group_id: int, user: User) -> bool:
        # Check if group exists and belongs to user
        db_group = self.get_group_by_id(group_id)
        if not db_group or int(db_group.user_id) != int(user.id):
            return False

        return group_model.delete_group(self.db, group_id)

    def regenerate_group_token(self, group_id: int, user: User) -> Optional[Group]:
        # Check if group exists and belongs to user
        db_group = self.get_group_by_id(group_id)
        if not db_group or int(db_group.user_id) != int(user.id):
            return None

        return group_model.regenerate_group_token(self.db, group_id)

    def user_owns_group(self, group_id: int, user: User) -> bool:
        db_group = self.get_group_by_id(group_id)
        return db_group is not None and int(db_group.user_id) == int(user.id)

    async def test_group(self, group_id: int, title: str, body: str, user: User):
        """Test all channels in a group by sending test messages."""
        # Import here to avoid circular import
        from heimdallr.api.groups import ChannelTestResult, TestGroupResponse

        # Check if group exists and belongs to user
        db_group = self.get_group_by_id(group_id)
        if not db_group or int(db_group.user_id) != int(user.id):
            raise ValueError("Group not found or access denied")

        # Get all active channels in the group
        active_channels = [ch for ch in db_group.channels if ch.is_active]

        if not active_channels:
            raise ValueError("Group has no active channels")

        # Test each channel asynchronously
        channel_results = []
        async with asyncio.TaskGroup() as tg:
            tasks = []
            for channel in active_channels:
                task = tg.create_task(self._test_single_channel(channel, title, body))
                tasks.append((channel, task))

        # Collect results
        overall_success = True
        for channel, task in tasks:
            success, message = task.result()
            channel_results.append(
                ChannelTestResult(channel_id=channel.id, channel_name=channel.name, success=success, message=message)
            )
            if not success:
                overall_success = False

        # Prepare response
        success_count = sum(1 for result in channel_results if result.success)
        total_count = len(channel_results)

        if overall_success:
            message = f"All {total_count} channels tested successfully"
        else:
            message = f"{success_count}/{total_count} channels tested successfully"

        return TestGroupResponse(success=overall_success, message=message, channel_results=channel_results)

    async def _test_single_channel(self, channel, title: str, body: str) -> tuple[bool, str]:
        """Test a single channel and return (success, message)."""
        try:
            # Build channel instance
            channel_instance = build_channel(channel.channel_type, channel.config_dict)

            # Build message
            message = build_message(channel.channel_type, title, body)

            # Send message
            success, error_msg = channel_instance.send(message)

            if success:
                return True, "Test message sent successfully"
            else:
                return False, f"Test failed: {error_msg}"

        except Exception as e:
            return False, f"Test failed: {str(e)}"

    async def test_group_with_channels(self, title: str, body: str, channels, user: User):
        """Test provided channels configuration (for edit mode)."""
        # Import here to avoid circular import
        from heimdallr.api.groups import ChannelTestResult, TestGroupResponse

        # Filter only active channels
        active_channels = [ch for ch in channels if ch.is_active]

        if not active_channels:
            raise ValueError("No active channels provided")

        # Test each channel asynchronously
        channel_results = []
        async with asyncio.TaskGroup() as tg:
            tasks = []
            for channel_config in active_channels:
                task = tg.create_task(self._test_single_channel_config(channel_config, title, body))
                tasks.append((channel_config, task))

        # Collect results
        overall_success = True
        for channel_config, task in tasks:
            success, message = task.result()
            channel_results.append(
                ChannelTestResult(
                    channel_id=channel_config.id, channel_name=channel_config.name, success=success, message=message
                )
            )
            if not success:
                overall_success = False

        # Prepare response
        success_count = sum(1 for result in channel_results if result.success)
        total_count = len(channel_results)

        if overall_success:
            message = f"All {total_count} channels tested successfully"
        else:
            message = f"{success_count}/{total_count} channels tested successfully"

        return TestGroupResponse(success=overall_success, message=message, channel_results=channel_results)

    async def _test_single_channel_config(self, channel_config, title: str, body: str) -> tuple[bool, str]:
        """Test a single channel configuration and return (success, message)."""
        try:
            # Build channel instance from config
            channel_instance = build_channel(channel_config.channel_type, channel_config.config)

            # Build message
            message = build_message(channel_config.channel_type, title, body)

            # Send message
            success, error_msg = channel_instance.send(message)

            if success:
                return True, "Test message sent successfully"
            else:
                return False, f"Test failed: {error_msg}"

        except Exception as e:
            return False, f"Test failed: {str(e)}"
