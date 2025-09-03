import base64
import os
from typing import Tuple, Union

import apprise
import filetype

from heimdallr.channel.base import Channel, Message
from heimdallr.config.definition import SUFFIX_APPRISE_URL
from heimdallr.exception import ParamException


class AppriseMessage(Message):
    def __init__(
        self,
        title: str,
        body: str,
        attach: Union[str, None] = None,
        **kwargs,
    ):
        super().__init__(title, body)
        self.attach: Union[str, None] = attach

    def render_message(self) -> str:
        return self.body


class Apprise(Channel):
    def __init__(self, type: str, config: dict) -> None:
        super().__init__(type)
        self.url: str
        self._build_channel(config)

    def _build_channel(self, config: dict) -> None:
        self.url = config.get(SUFFIX_APPRISE_URL, "")
        if self.url == "":
            raise ParamException("Apprise url cannot be empty.")

    def send(self, message: Message) -> Tuple[bool, str]:
        """
        Send a message to apprise server.
        """
        assert isinstance(message, AppriseMessage)
        ap = apprise.Apprise()
        ap.add(self.url)
        # attach
        if message.attach:
            attach = self._handle_attach(message.attach)
        else:
            attach = None

        try:
            ap.notify(
                body=message.render_message(),
                title=message.title,
                attach=attach,
            )
            return True, ""
        except Exception as e:
            return False, str(e)
        finally:
            if attach:
                self._clean_attach(attach)

    @staticmethod
    def _handle_attach(attach: str) -> str:
        if attach.startswith("http"):
            return attach
        os.makedirs("tmp", exist_ok=True)
        file_path = os.path.join("tmp", "attach")
        bf = base64.b64decode(attach)

        ext = filetype.guess_extension(bf)

        if ext:
            file_path = f"{file_path}.{ext}"

        with open(file_path, "wb") as f:
            f.write(bf)
        return file_path

    @staticmethod
    def _clean_attach(attach: str) -> None:
        if not attach.startswith("http"):
            os.remove(attach)
