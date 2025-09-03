import logging

from heimdallr.channel.apprise import Apprise, AppriseMessage
from heimdallr.channel.bark import Bark, BarkMessage
from heimdallr.channel.base import Channel, Message
from heimdallr.channel.chanify import Chanify, ChanifyMessage
from heimdallr.channel.dingtalk import DingTalk, DingTalkMessage
from heimdallr.channel.discord import DiscordWebhook, DiscordWebhookMessage
from heimdallr.channel.email import Email, EmailMessage
from heimdallr.channel.lark import LarkWebhook, LarkWebhookMessage
from heimdallr.channel.ntfy import Ntfy, NtfyMessage
from heimdallr.channel.pushdeer import PushDeer, PushDeerMessage
from heimdallr.channel.pushme import Pushme, PushmeMessage
from heimdallr.channel.pushover import Pushover, PushoverMessage
from heimdallr.channel.quote0 import Quote0, Quote0Message
from heimdallr.channel.telegram import Telegram, TelegramMessage
from heimdallr.channel.wecom import (
    WecomApp,
    WecomAppMessage,
    WecomWebhook,
    WecomWebhookMessage,
)
from heimdallr.exception import ParamException

logger = logging.getLogger(__name__)

# supported channels
CHANNEL_BARK = "bark"
CHANNEL_WECOM_WEBHOOK = "wecom_webhook"
CHANNEL_WECOM_APP = "wecom_app"
CHANNEL_PUSHOVER = "pushover"
CHANNEL_PUSHDEER = "pushdeer"
CHANNEL_CHANIFY = "chanify"
CHANNEL_EMAIL = "email"
CHANNEL_DISCORD_WEBHOOK = "discord_webhook"
CHANNEL_TELEGRAM = "telegram"
CHANNEL_NTFY = "ntfy"
CHANNEL_LARK_WEBHOOK = "lark_webhook"
CHANNEL_DINGTALK_WEBHOOK = "dingtalk_webhook"
CHANNEL_APPRISE = "apprise"
CHANNEL_PUSHME = "pushme"
CHANNEL_QUOTE0 = "quote0"


def build_channel(name: str, config: dict) -> Channel:
    """
    Build a channel instance by name and config.
    """
    logger.debug(f"Building channel, type {name}")

    # build channel instance
    if name == CHANNEL_BARK:
        return Bark(name, config)
    elif name == CHANNEL_WECOM_WEBHOOK:
        return WecomWebhook(name, config)
    elif name == CHANNEL_WECOM_APP:
        return WecomApp(name, config)
    elif name == CHANNEL_PUSHOVER:
        return Pushover(name, config)
    elif name == CHANNEL_PUSHDEER:
        return PushDeer(name, config)
    elif name == CHANNEL_CHANIFY:
        return Chanify(name, config)
    elif name == CHANNEL_EMAIL:
        return Email(name, config)
    elif name == CHANNEL_DISCORD_WEBHOOK:
        return DiscordWebhook(name, config)
    elif name == CHANNEL_TELEGRAM:
        return Telegram(name, config)
    elif name == CHANNEL_NTFY:
        return Ntfy(name, config)
    elif name == CHANNEL_LARK_WEBHOOK:
        return LarkWebhook(name, config)
    elif name == CHANNEL_DINGTALK_WEBHOOK:
        return DingTalk(name, config)
    elif name == CHANNEL_APPRISE:
        return Apprise(name, config)
    elif name == CHANNEL_PUSHME:
        return Pushme(name, config)
    elif name == CHANNEL_QUOTE0:
        return Quote0(name, config)
    else:
        raise ParamException(f"Channel {name} not supported.")


def build_message(channel_type: str, title: str, body: str, **kwargs) -> Message:
    """
    Build a message instance by channel type.
    """
    # build message instance
    if channel_type == CHANNEL_BARK:
        return BarkMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_WECOM_WEBHOOK:
        return WecomWebhookMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_WECOM_APP:
        return WecomAppMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_PUSHOVER:
        return PushoverMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_PUSHDEER:
        return PushDeerMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_CHANIFY:
        return ChanifyMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_EMAIL:
        return EmailMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_DISCORD_WEBHOOK:
        return DiscordWebhookMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_TELEGRAM:
        return TelegramMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_NTFY:
        return NtfyMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_LARK_WEBHOOK:
        return LarkWebhookMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_DINGTALK_WEBHOOK:
        return DingTalkMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_APPRISE:
        return AppriseMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_PUSHME:
        return PushmeMessage(title, body, **kwargs)
    elif channel_type == CHANNEL_QUOTE0:
        return Quote0Message(title, body, **kwargs)
    else:
        raise ParamException(f"Channel type {channel_type} not supported.")
