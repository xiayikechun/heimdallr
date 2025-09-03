import logging
from urllib.parse import unquote_plus

from fastapi import APIRouter, Depends, Form, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from heimdallr.api.base import serve_channels_async
from heimdallr.database.database import get_db

logger = logging.getLogger(__name__)

push_router = APIRouter(prefix="/push")


@push_router.post("/form")
async def send_push_by_form(
    key: str = Form(...),
    title: str = Form(...),
    body: str = Form(...),
    msg_type: str = Form(default="text"),
    attach: str = Form(default="", description="base64 string, only support image"),
    db: Session = Depends(get_db),
):
    return await serve_channels_async(key, db, title, body, msg_type=msg_type, attach=attach)


class PostRequest(BaseModel):
    key: str = ""
    title: str = ""
    body: str = ""
    msg_type: str = "text"
    attach: str = Field("", description="base64 string, only support image")


@push_router.post("/")
async def send_push_by_json(request: PostRequest, db: Session = Depends(get_db)):
    return await serve_channels_async(
        request.key,
        db,
        request.title,
        request.body,
        msg_type=request.msg_type,
        attach=request.attach,
    )


@push_router.get("/{key}")
@push_router.post("/{key}")
@push_router.get("/{key}/{body}")
@push_router.post("/{key}/{body}")
@push_router.get("/{key}/{title}/{body}")
@push_router.post("/{key}/{title}/{body}")
async def send_push(
    key: str,
    title: str = "",
    body: str = "",
    msg_type: str = "",
    attach: str = Query("", description="base64 string, only support image"),
    db: Session = Depends(get_db),
):
    title = unquote_plus(title)
    body = unquote_plus(body)
    return await serve_channels_async(key, db, title, body, msg_type=msg_type, attach=attach)
