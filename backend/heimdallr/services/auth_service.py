from typing import Optional

from sqlalchemy.orm import Session

from heimdallr.auth.jwt import create_access_token
from heimdallr.database import schemas
from heimdallr.entity.user import User
from heimdallr.services.user_service import UserService


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)

    def register_user(self, user_data: schemas.UserCreate) -> User:
        return self.user_service.create_user(user_data)

    def authenticate_and_create_token(self, username: str, password: str) -> Optional[dict]:
        user = self.user_service.authenticate_user(username, password)
        if not user:
            return None

        access_token = create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}

    def get_current_user_by_username(self, username: str) -> Optional[User]:
        return self.user_service.get_user_by_username(username)

    def update_current_user(self, user: User, user_update: schemas.UserUpdate) -> Optional[User]:
        return self.user_service.update_user(user.id, user_update)

    def is_admin(self, user: User) -> bool:
        return self.user_service.is_admin(user)
