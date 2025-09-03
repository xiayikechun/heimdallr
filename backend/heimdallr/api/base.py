import asyncio
import inspect
import logging
import os
from typing import Any, Dict

from sqlalchemy.orm import Session

from heimdallr.channel.base import Channel
from heimdallr.channel.factory import build_message
from heimdallr.exception import AuthException
from heimdallr.response import Response, success
from heimdallr.shared.config import get_config_instance

logger = logging.getLogger(__name__)


async def serve_channels_async(key: str, db: Session, title: str = "", body: str = "", **kwargs) -> Dict[str, Any]:
    raise_exception_on_error = kwargs.pop("raise_exception_on_error", False)
    # log the caller of this function
    if os.getenv("DEBUG", "false").lower() == "true":
        logger.debug(f"Serving caller: {inspect.stack()[1].function}")

    try:
        config_instance = get_config_instance(db)
        group = config_instance.get_group(key)
    except AuthException as e:
        return Response(code=-1, message=str(e)).render()

    logger.info(f"group: {group.name}, token: {group.token}")
    errors: Dict[str, str] = {}
    async with asyncio.TaskGroup() as tg:
        for chan in group.channels:
            tg.create_task(send_to_channel(chan, title, body, errors, kwargs))

    if len(errors) == 0:
        return success()
    err_msg = ""
    for err in errors.items():
        err_msg += f"{err[0]} return: {err[1]}."
    if raise_exception_on_error:
        raise RuntimeError(err_msg)
    return Response(code=1, message=err_msg).render()


async def send_to_channel(chan: Channel, title: str, body: str, errors: Dict[str, str], kwargs: Dict[str, Any]) -> None:
    logger.info(f"channel: {chan.get_name()}, channel_type: {chan.get_type()}")
    message = build_message(chan.get_name(), title, body, **kwargs)
    rs, err = chan.send(message)
    if not rs:
        errors[chan.get_name()] = err
