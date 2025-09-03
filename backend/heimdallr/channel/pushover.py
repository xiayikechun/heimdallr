import logging
from typing import Any
from urllib.parse import quote_plus

import requests

from heimdallr.channel.base import Channel, Message
from heimdallr.config.definition import SUFFIX_PUSHOVER_TOKEN, SUFFIX_PUSHOVER_USER
from heimdallr.exception import ParamException

logger = logging.getLogger(__name__)


class PushoverMessage(Message):
    def __init__(self, title: str, body: str, **kwargs):
        super().__init__(title, body)

    def render_message(self) -> Any:
        return quote_plus(f"{self.title}\n{self.body}")


class Pushover(Channel):

    def __init__(self, type: str, config: dict) -> None:
        super().__init__(type)
        self.base_url = "https://api.pushover.net/1/messages.json"
        self.token: str
        self.user: str
        self._build_channel(config)

    def _build_channel(self, config: dict) -> None:
        self.token = config.get(SUFFIX_PUSHOVER_TOKEN, "")
        self.user = config.get(SUFFIX_PUSHOVER_USER, "")
        if self.token == "" or self.user == "":
            raise ParamException("pushover token or user not set")

    def send(self, message: Message):
        url = f"{self.base_url}?token={self.token}&user={self.user}&message={message.render_message()}"
        rs = requests.post(url).json()
        logger.debug(f"Pushover response: {rs}")
        if rs["status"] == 1:
            return True, rs["request"]
        logger.error(f"Pushover error: {rs['errors']}")
        return False, rs["errors"]
