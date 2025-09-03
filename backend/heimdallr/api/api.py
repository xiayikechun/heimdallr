from fastapi import APIRouter

from heimdallr.api import (
    auth,
    channels,
    competable,
    groups,
    push,
    users,
    version,
    webhook,
)

router = APIRouter()
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(groups.router)
router.include_router(channels.router)
# router.include_router(welcome.welcome_router)
router.include_router(webhook.webhook_router)
router.include_router(competable.competable_router)
router.include_router(push.push_router)
router.include_router(version.router)
