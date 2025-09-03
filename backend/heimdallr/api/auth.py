from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session

from heimdallr.auth.dependencies import get_current_user
from heimdallr.database import schemas
from heimdallr.database.database import get_db
from heimdallr.entity.user import User
from heimdallr.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

security = HTTPBasic()


@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    try:
        return auth_service.register_user(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=schemas.Token)
def login_for_access_token(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    token_data = auth_service.authenticate_and_create_token(credentials.username, credentials.password)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_data


@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    try:
        updated_user = auth_service.update_current_user(current_user, user_update)
        if not updated_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
