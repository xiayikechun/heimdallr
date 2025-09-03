from sqlalchemy import Column, ForeignKey, Integer, Table

from heimdallr.database.database import Base

group_channel_association = Table(
    "group_channel",
    Base.metadata,
    Column("group_id", Integer, ForeignKey("groups.id"), primary_key=True),
    Column("channel_id", Integer, ForeignKey("channels.id"), primary_key=True),
)
