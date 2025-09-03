import logging
from typing import Tuple

import requests

from heimdallr.channel.base import Channel, Message
from heimdallr.config.definition import (
    SUFFIX_DISCORD_WEBHOOK_ID,
    SUFFIX_DISCORD_WEBHOOK_TOKEN,
)
from heimdallr.exception import ParamException

logger = logging.getLogger(__name__)


class DiscordWebhookMessage(Message):
    def __init__(self, title: str, body: str, **kwargs):
        super().__init__(title, body)

    def render_message(self) -> str:
        return f"{self.title}\n{self.body}"


class DiscordWebhook(Channel):

    def __init__(self, type: str, config: dict):
        super().__init__(type)
        self.base_url = "https://discord.com/api/webhooks/"
        self.webhook_id: str
        self.webhook_token: str
        self._build_channel(config)

    def _build_channel(self, config: dict) -> None:
        self.webhook_id = config.get(SUFFIX_DISCORD_WEBHOOK_ID, "")
        self.webhook_token = config.get(SUFFIX_DISCORD_WEBHOOK_TOKEN, "")
        if not self.webhook_id or not self.webhook_token:
            raise ParamException("Discord webhook id or token is empty.")

    def send(self, message: Message) -> Tuple[bool, str]:
        if not isinstance(message, DiscordWebhookMessage):
            raise ParamException("Discord webhook only supports DiscordWebhookMessage.")
        msg = {"content": message.render_message()}
        url = f"{self.base_url}{self.webhook_id}/{self.webhook_token}"
        headers = {"Content-Type": "application/json"}
        rs = requests.post(url, json=msg, headers=headers)
        if rs.status_code != 204:
            logger.error(f"Discord webhook send failed: {rs.text}")
        return rs.status_code == 204, rs.text
