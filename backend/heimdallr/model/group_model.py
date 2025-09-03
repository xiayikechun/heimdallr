import secrets
import string
from typing import List, Optional

from sqlalchemy.orm import Session

from heimdallr.database import schemas
from heimdallr.entity.group import Group


def generate_token(length: int = 32) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def get_group(db: Session, group_id: int) -> Optional[Group]:
    return db.query(Group).filter(Group.id == group_id).first()


def get_group_by_token(db: Session, token: str) -> Optional[Group]:
    return db.query(Group).filter(Group.token == token).first()


def get_groups(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Group]:
    return db.query(Group).filter(Group.user_id == user_id).offset(skip).limit(limit).all()


def create_group(db: Session, group: schemas.GroupCreate, user_id: int) -> Group:
    token = generate_token()
    while get_group_by_token(db, token):
        token = generate_token()

    db_group = Group(name=group.name, description=group.description, token=token, user_id=user_id)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


def update_group(db: Session, group_id: int, group_update: schemas.GroupUpdate) -> Optional[Group]:
    db_group = get_group(db, group_id)
    if not db_group:
        return None

    if group_update.name is not None:
        db_group.name = group_update.name

    if group_update.description is not None:
        db_group.description = group_update.description

    db.commit()
    db.refresh(db_group)
    return db_group


def delete_group(db: Session, group_id: int) -> bool:
    db_group = get_group(db, group_id)
    if not db_group:
        return False

    db.delete(db_group)
    db.commit()
    return True


def regenerate_group_token(db: Session, group_id: int) -> Optional[Group]:
    db_group = get_group(db, group_id)
    if not db_group:
        return None

    token = generate_token()
    while get_group_by_token(db, token):
        token = generate_token()

    db_group.token = token
    db.commit()
    db.refresh(db_group)
    return db_group
