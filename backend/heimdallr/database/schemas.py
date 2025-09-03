import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, field_serializer


class UserBase(BaseModel):
    username: str
    email: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_admin: bool
    created_at: datetime
    updated_at: datetime


class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None


class GroupCreate(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class Group(GroupBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    token: str
    user_id: int
    created_at: datetime
    updated_at: datetime


class GroupWithChannels(Group):
    channels: List["Channel"] = []


class ChannelBase(BaseModel):
    name: str
    channel_type: str
    config: Dict[str, Any]
    is_active: bool = True


class ChannelCreate(ChannelBase):
    pass


class ChannelUpdate(BaseModel):
    name: Optional[str] = None
    channel_type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class Channel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    channel_type: str
    config: str  # This will be the JSON string from database
    is_active: bool
    user_id: int
    created_at: datetime
    updated_at: datetime

    @field_serializer("config")
    def serialize_config(self, config: str) -> Dict[str, Any]:
        """Convert JSON string to dict for API response"""
        try:
            return json.loads(config) if config else {}
        except (json.JSONDecodeError, TypeError):
            return {}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
