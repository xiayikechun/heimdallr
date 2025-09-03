from typing import List

from sqlalchemy.orm import Session

from heimdallr.channel.base import Channel
from heimdallr.channel.factory import build_channel as build_channel_from_config
from heimdallr.entity.channel import Channel as DBChannel
from heimdallr.entity.group import Group as DBGroup
from heimdallr.exception import AuthException
from heimdallr.model.group_model import get_group_by_token


class DatabaseChannel(Channel):
    def __init__(self, db_channel: DBChannel):
        self.db_channel = db_channel
        self._name = db_channel.name
        self._type = db_channel.channel_type
        self._config = db_channel.config_dict

    def get_name(self) -> str:
        return self._name

    def get_type(self) -> str:
        return self._type

    def send(self, message) -> tuple[bool, str]:
        original_channel = build_channel_from_config(self._name)

        for key, value in self._config.items():
            if hasattr(original_channel, f"_{key.lower()}"):
                setattr(original_channel, f"_{key.lower()}", value)

        return original_channel.send(message)


class DatabaseGroup:
    def __init__(self, db_group: DBGroup):
        self.name = db_group.name
        self.token = db_group.token
        self.channels: List[Channel] = []
        self._is_initialized: bool = False
        self._db_group = db_group

    def _build_group(self) -> None:
        for db_channel in self._db_group.channels:
            if db_channel.is_active:
                channel = DatabaseChannel(db_channel)
                self.channels.append(channel)

        self._is_initialized = True

    def activate(self) -> None:
        if not self._is_initialized:
            self._build_group()


class DatabaseConfig:
    def __init__(self, db: Session):
        self._db = db

    def get_group(self, token: str) -> DatabaseGroup:
        db_group = get_group_by_token(self._db, token)
        if not db_group:
            raise AuthException("key is invalid")

        group = DatabaseGroup(db_group)
        group.activate()
        return group
