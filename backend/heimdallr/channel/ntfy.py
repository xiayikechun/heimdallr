import logging
from typing import Dict, Tuple

import requests

from heimdallr.channel.base import Channel, Message
from heimdallr.config.definition import SUFFIX_NTFY_HOST, SUFFIX_NTFY_TOPIC
from heimdallr.exception import ParamException

logger = logging.getLogger(__name__)


class NtfyMessage(Message):
    def __init__(self, title: str, body: str, **kwargs):
        super().__init__(title, body)
        self.msg_type = kwargs.get("msg_type", "text")

    def render_message(
        self,
    ) -> Tuple[Dict, bytes]:
        headers: Dict = {"Title": self.title.encode(encoding="utf-8")}
        content = self.body.encode(encoding="utf-8")
        if self.msg_type == "markdown":
            headers["Content-Type"] = "text/markdown"

        return headers, content


class Ntfy(Channel):

    def __init__(self, type: str, config: dict) -> None:
        super().__init__(type)
        self.host: str = "https://ntfy.sh"
        self.topic: str
        self._build_channel(config)

    def _build_channel(self, config: dict) -> None:
        self.host = config.get(SUFFIX_NTFY_HOST, self.host)
        self.topic = config.get(SUFFIX_NTFY_TOPIC, "")
        if not self.topic:
            raise ParamException("Ntfy topic is empty.")

    def send(self, message: Message) -> Tuple[bool, str]:
        if not isinstance(message, NtfyMessage):
            raise ParamException("Ntfy only supports NtfyMessage.")
        headers, content = message.render_message()
        url = f"{self.host}/{self.topic}"
        rs = requests.post(url, headers=headers, data=content)
        if rs.status_code != 200:
            logger.error(f"Ntfy send failed: {rs.text}")
        return rs.status_code == 200, rs.text
