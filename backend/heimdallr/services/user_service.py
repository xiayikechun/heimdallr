from typing import List, Optional

from sqlalchemy.orm import Session

from heimdallr.database import schemas
from heimdallr.entity.user import User
from heimdallr.model import user_model


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return user_model.get_user(self.db, user_id)

    def get_user_by_username(self, username: str) -> Optional[User]:
        return user_model.get_user_by_username(self.db, username)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return user_model.get_user_by_email(self.db, email)

    def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        return user_model.get_users(self.db, skip=skip, limit=limit)

    def create_user(self, user: schemas.UserCreate) -> User:
        # Check if username already exists
        if self.get_user_by_username(user.username):
            raise ValueError("Username already registered")

        # Check if email already exists
        if user.email and self.get_user_by_email(user.email):
            raise ValueError("Email already registered")

        return user_model.create_user(self.db, user)

    def update_user(self, user_id: int, user_update: schemas.UserUpdate) -> Optional[User]:
        # Check if user exists
        if not self.get_user_by_id(user_id):
            return None

        # Check if email is being changed and already exists
        if user_update.email:
            existing_user = self.get_user_by_email(user_update.email)
            if existing_user and int(existing_user.id) != user_id:
                raise ValueError("Email already registered")

        return user_model.update_user(self.db, user_id, user_update)

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        return user_model.authenticate_user(self.db, username, password)

    def is_admin(self, user: User) -> bool:
        return user.is_admin
