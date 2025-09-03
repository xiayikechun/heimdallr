import json
import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from heimdallr.api.base import serve_channels_async
from heimdallr.database.database import get_db
from heimdallr.webhook.github_star import GithubStarWebhook

logger = logging.getLogger(__name__)

webhook_router = APIRouter(prefix="/webhook")


@webhook_router.post("/github/star/{key}")
async def github_star(key: str, req: Request, db: Session = Depends(get_db)):
    body = await req.body()
    webhook = GithubStarWebhook(json.loads(body))
    title, msg_body, jump_url = webhook.parse()
    return await serve_channels_async(key, db, title, msg_body, jump_url=jump_url)


@webhook_router.post("/rsspush/{key}")
async def rsspush(key: str, req: Request, db: Session = Depends(get_db)):
    form = await req.form()
    task_title = form.get("task_title")
    title = form.get("title")
    desp = form.get("desp")
    jump_url = form.get("link")
    return await serve_channels_async(key, db, f"{task_title}", f"{title}\n{desp}", jump_url=jump_url)
