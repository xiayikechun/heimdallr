import base64
import hashlib
import hmac
import logging
import time
from typing import Any, Tuple

import requests

from heimdallr.channel.base import Channel, Message
from heimdallr.config.definition import (
    SUFFIX_LARK_HOST,
    SUFFIX_LARK_SECRET,
    SUFFIX_LARK_TOKEN,
)
from heimdallr.exception import ParamException

logger = logging.getLogger(__name__)


class LarkWebhookMessage(Message):
    def __init__(self, title: str, body: str, **kwargs) -> None:
        super().__init__(title, body)

    def render_message(self) -> Any:
        return {"msg_type": "text", "content": {"text": f"{self.title}\n{self.body}"}}


class LarkWebhook(Channel):

    def __init__(self, type: str, config: dict) -> None:
        super().__init__(type)
        self.base_url: str = "https://open.feishu.cn/open-apis/bot/v2/hook/"
        self.token: str = ""
        self.secret: str = ""
        self._build_channel(config)

    def _build_channel(self, config: dict) -> None:
        self.base_url = config.get(SUFFIX_LARK_HOST, self.base_url)
        self.token = config.get(SUFFIX_LARK_TOKEN, "")
        self.secret = config.get(SUFFIX_LARK_SECRET, "")
        if self.token == "":
            raise ParamException("LarkWebhook key not set")

    def send(self, message: Message) -> Tuple[bool, str]:
        if not isinstance(message, LarkWebhookMessage):
            raise ParamException("Invalid message type")

        url = f"{self.base_url}{self.token}"
        msg = message.render_message()
        if self.secret != "":
            timestamp = str(int(time.time()))
            sign = gen_sign(timestamp, self.secret)
            msg["timestamp"] = timestamp
            msg["sign"] = sign
        rs = requests.post(
            url,
            json=msg,
            headers={"Content-Type": "application/json"},
        ).json()
        logger.debug(f"LarkWebhook response: {rs}")
        if rs["code"] != 0:
            logger.error(f"LarkWebhook error: {rs['msg']}")
            return False, rs["msg"]
        return True, rs["msg"]


def gen_sign(timestamp, secret):
    string_to_sign = "{}\n{}".format(timestamp, secret)
    hmac_code = hmac.new(string_to_sign.encode("utf-8"), digestmod=hashlib.sha256).digest()
    sign = base64.b64encode(hmac_code).decode("utf-8")
    return sign
