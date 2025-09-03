import json
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from heimdallr.database.database import Base
from heimdallr.entity.association_tables import group_channel_association


class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    channel_type = Column(String(50), nullable=False)
    config = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="channels")
    groups = relationship("Group", secondary=group_channel_association, back_populates="channels")

    @property
    def config_dict(self) -> dict:
        return json.loads(self.config) if self.config else {}

    @config_dict.setter
    def config_dict(self, value: dict):
        self.config = json.dumps(value)
