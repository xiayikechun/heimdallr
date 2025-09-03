from typing import List, Optional

from sqlalchemy.orm import Session

from heimdallr.database import schemas
from heimdallr.entity.channel import Channel
from heimdallr.entity.group import Group


def get_channel(db: Session, channel_id: int) -> Optional[Channel]:
    return db.query(Channel).filter(Channel.id == channel_id).first()


def get_channels(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Channel]:
    return db.query(Channel).filter(Channel.user_id == user_id).offset(skip).limit(limit).all()


def create_channel(db: Session, channel: schemas.ChannelCreate, user_id: int) -> Channel:
    db_channel = Channel(
        name=channel.name, channel_type=channel.channel_type, is_active=channel.is_active, user_id=user_id
    )
    db_channel.config_dict = channel.config
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel


def update_channel(db: Session, channel_id: int, channel_update: schemas.ChannelUpdate) -> Optional[Channel]:
    db_channel = get_channel(db, channel_id)
    if not db_channel:
        return None

    if channel_update.name is not None:
        db_channel.name = channel_update.name

    if channel_update.channel_type is not None:
        db_channel.channel_type = channel_update.channel_type

    if channel_update.config is not None:
        db_channel.config_dict = channel_update.config

    if channel_update.is_active is not None:
        db_channel.is_active = channel_update.is_active

    db.commit()
    db.refresh(db_channel)
    return db_channel


def delete_channel(db: Session, channel_id: int) -> bool:
    db_channel = get_channel(db, channel_id)
    if not db_channel:
        return False

    db.delete(db_channel)
    db.commit()
    return True


def add_channel_to_group(db: Session, group_id: int, channel_id: int) -> bool:
    group = db.query(Group).filter(Group.id == group_id).first()
    channel = get_channel(db, channel_id)

    if not group or not channel:
        return False

    if channel not in group.channels:
        group.channels.append(channel)
        db.commit()

    return True


def remove_channel_from_group(db: Session, group_id: int, channel_id: int) -> bool:
    group = db.query(Group).filter(Group.id == group_id).first()
    channel = get_channel(db, channel_id)

    if not group or not channel:
        return False

    if channel in group.channels:
        group.channels.remove(channel)
        db.commit()

    return True
